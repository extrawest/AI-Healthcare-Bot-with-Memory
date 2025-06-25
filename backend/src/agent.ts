import {
    AIMessage,
    HumanMessage,
    SystemMessage,
} from '@langchain/core/messages';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import { DynamicTool } from '@langchain/core/tools';
import { getEmbeddings, getLLMResponse, padEmbedding } from './services/llm';
import {
    ensureQdrantCollection,
    searchQdrant,
    addToQdrant,
} from './services/qdrant';
import { addToMem0 } from './services/mem0';
import { VECTOR_DIMENSION } from './config';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MEM0_API_KEY) {
    throw new Error('MEM0_API_KEY environment variable is required');
}

class HealthAgent {
    private static _instance: HealthAgent | null = null;
    private _initialized: boolean = false;
    private appId: string = 'healthcare-app';

    public static getInstance(): HealthAgent {
        if (!HealthAgent._instance) {
            HealthAgent._instance = new HealthAgent();
        }
        return HealthAgent._instance;
    }

    private constructor() {
        if (!this._initialized) {
            this._initialized = true;
            console.log('HealthAgent initialized');
            // Ensure Qdrant collection exists with correct dimensions
            ensureQdrantCollection().catch(console.error);
        }
    }

    public async ask(
        question: string,
        userId?: string
    ): Promise<{ messages: string[] }> {
        console.log('Self ID:', this);

        // Search for relevant memories
        const embedding = await getEmbeddings(question);
        const paddedEmbedding = padEmbedding(embedding, VECTOR_DIMENSION);
        const memories = await searchQdrant(paddedEmbedding, userId);
        console.log(
            'Previous memories:',
            memories.results.map((m) => m.metadata.mem0_response).join('\n')
        );

        // Build context from memories
        let context = 'Relevant information from previous conversations:\n';
        if (memories.results && memories.results.length > 0) {
            for (const memory of memories.results) {
                context += ` - ${memory.memory}\n`;
            }
        }

        // Prepare messages for LLM
        const messages = [
            {
                role: 'system' as const,
                content: `You are a helpful healthcare support assistant. Use the provided context to personalize your responses and remember user health information and past interactions. ${context}`,
            },
            {
                role: 'user' as const,
                content: question,
            },
        ];

        // Get response from LLM
        const response = await getLLMResponse(messages);

        // Add to memory
        await this.addMemory(question, response, userId);

        return { messages: [response] };
    }

    private async addMemory(
        question: string,
        response: string,
        userId?: string
    ): Promise<void> {
        const embedding = await getEmbeddings(question + ' ' + response);
        const paddedEmbedding = padEmbedding(embedding, VECTOR_DIMENSION);

        // Add to mem0 first to get the response
        const mem0Response = await addToMem0(question, response, userId);
        console.log('Memory added to mem0ai with response:', mem0Response);

        const mem0Memory = mem0Response[0]?.data?.memory || '';

        await addToQdrant(paddedEmbedding, {
            question,
            response,
            userId,
            appId: this.appId,
            timestamp: new Date().toISOString(),
            mem0_response: mem0Memory,
        });
    }

    public async searchMemory(query: string, userId?: string): Promise<any> {
        const embedding = await getEmbeddings(query);
        const paddedEmbedding = padEmbedding(embedding, VECTOR_DIMENSION);
        return await searchQdrant(paddedEmbedding, userId);
    }
}

export const healthcareSupport = HealthAgent.getInstance();

const historyTool = new DynamicTool({
    name: 'history',
    description: 'Get user history and context from previous conversations',
    func: async (input: string) => {
        try {
            const { userId, query } = JSON.parse(input);
            const memories = await healthcareSupport.searchMemory(
                query,
                userId
            );

            if (memories.results && memories.results.length > 0) {
                let context =
                    'Relevant information from previous conversations:\n';
                for (const memory of memories.results) {
                    context += ` - ${memory.memory}\n`;
                }
                return context;
            }
            return '';
        } catch (error) {
            console.error('Error in history tool:', error);
            return '';
        }
    },
});

async function getHistory(state: typeof MessagesAnnotation.State) {
    const lastUserMessage = state.messages[
        state.messages.length - 1
    ] as HumanMessage;
    const userMessage = lastUserMessage.content.toString();
    const userId = lastUserMessage.additional_kwargs?.userId as string;

    const history = await historyTool.invoke(
        JSON.stringify({ userId, query: userMessage })
    );
    console.log('Retrieved history:', history);

    return {
        ...state,
        history,
    };
}

async function callModel(
    state: typeof MessagesAnnotation.State & { history: string }
) {
    const lastUserMessage = state.messages[
        state.messages.length - 1
    ] as HumanMessage;
    const userMessage = lastUserMessage.content.toString();
    const userId = lastUserMessage.additional_kwargs?.userId as
        | string
        | undefined;

    const result = await healthcareSupport.ask(userMessage, userId);

    return {
        messages: [
            new AIMessage({
                content: result.messages[0],
                additional_kwargs: { userId },
            }),
        ],
    };
}

const workflow = new StateGraph(MessagesAnnotation)
    .addNode('getHistory', getHistory)
    .addNode('callModel', callModel)
    .addEdge('__start__', 'getHistory')
    .addEdge('getHistory', 'callModel')
    .addEdge('callModel', '__end__');

export const graph = workflow.compile();
