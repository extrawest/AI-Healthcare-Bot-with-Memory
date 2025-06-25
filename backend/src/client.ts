import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Client } from '@langchain/langgraph-sdk';
import { LLMRequest } from './types/types';
import { HumanMessage } from '@langchain/core/messages';
import readline from 'readline';

const requestSchema = z.object({
    userMessage: z.string(),
    userId: z.string(),
});

export async function streamChat(req: LLMRequest) {
    const { userMessage, userId } = requestSchema.parse(req);
    const client = new Client({ apiUrl: 'http://localhost:2024' });

    const message = new HumanMessage({
        content: userMessage,
        additional_kwargs: { userId },
    });

    const streamResponse = client.runs.stream(
        null,
        'agent', // Assistant ID
        {
            input: {
                messages: [message],
            },
            streamMode: 'messages-tuple',
        }
    );

    return streamResponse;
}

function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}

// Interactive chat function
async function startInteractiveChat() {
    const rl = createReadlineInterface();
    const userId = 'console-user-' + randomUUID();
    console.log(
        '\n🏥 Welcome to the Healthcare Assistant! Type "exit" to quit.\n'
    );

    while (true) {
        const userMessage = await new Promise<string>((resolve) => {
            rl.question('You: ', resolve);
        });

        if (userMessage.toLowerCase() === 'exit') {
            console.log('\nGoodbye! Take care of your health! 👋\n');
            rl.close();
            break;
        }

        try {
            console.log('\nAssistant: ');
            const streamResponse = await streamChat({
                userMessage,
                userId,
            });

            let assistantResponse = '';
            for await (const chunk of streamResponse) {
                if (chunk.event === 'messages') {
                    const [message] = chunk.data;
                    if (message && typeof message.content === 'string') {
                        process.stdout.write(message.content);
                        assistantResponse += message.content;
                    }
                }
            }
        } catch (error) {
            console.log('Please try again.');
        }
    }
}

if (require.main === module) {
    startInteractiveChat().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
