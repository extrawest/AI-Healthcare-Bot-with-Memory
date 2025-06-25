import Memory from 'mem0ai';
import {
    MEM0_API_KEY,
    OLLAMA_BASE_URL,
    LLM_MODEL,
    EMBEDDING_MODEL,
    QDRANT_COLLECTION,
    QDRANT_HOST,
    QDRANT_PORT,
} from '../config';

export const memory = new Memory({
    apiKey: MEM0_API_KEY,
    llm: {
        provider: 'custom',
        config: {
            endpoint: `${OLLAMA_BASE_URL}/api/chat`,
            model: LLM_MODEL,
        },
    },
    embedder: {
        provider: 'custom',
        config: {
            endpoint: `${OLLAMA_BASE_URL}/api/embeddings`,
            model: EMBEDDING_MODEL,
        },
    },

    customPrompt: `
    Please only extract entities containing patient health information, appointment details, and user information. 
    Here are some few shot examples:

    Input: Hi.
    Output: {{"facts" : []}}

    Input: The weather is nice today.
    Output: {{"facts" : []}}

    Input: I have a headache and would like to schedule an appointment.
    Output: {{"facts" : ["Patient reports headache", "Wants to schedule an appointment"]}}

    Input: My name is Jane Smith, and I need to reschedule my appointment for next Tuesday.
    Output: {{"facts" : ["Patient name: Jane Smith", "Wants to reschedule appointment", "Original appointment: next Tuesday"]}}

    Input: I have diabetes and my blood sugar is high.
    Output: {{"facts" : ["Patient has diabetes", "Reports high blood sugar"]}}

    Return the facts and patient information in a json format as shown above.
    `,
    version: 'v1.1',
} as any);

export async function addToMem0(
    question: string,
    response: string,
    userId: string | undefined
): Promise<any> {
    const messages = [
        {
            role: 'user' as const,
            content: question,
        },
        {
            role: 'assistant' as const,
            content: response,
        },
    ];

    const mem0Response = await memory.add(messages, {
        version: 'v2',
        user_id: userId || 'default-user',
        app_id: 'healthcare-app',
        metadata: {
            appId: 'healthcare-app',
        },
        custom_categories: [
            { health: 'Health-related information and preferences' },
        ],
    });

    console.log('Memory added to mem0ai with response:', mem0Response);
    return mem0Response;
}
