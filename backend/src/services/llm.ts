import { OLLAMA_BASE_URL, LLM_MODEL, EMBEDDING_MODEL } from '../config';

export async function getEmbeddings(input: string): Promise<number[]> {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: EMBEDDING_MODEL,
                prompt: input,
            }),
        });

        if (!response.ok) {
            throw new Error(`Embedding API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.embedding;
    } catch (error) {
        console.error('Error getting embeddings:', error);
        throw error;
    }
}

export async function getLLMResponse(messages: any[]): Promise<string> {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: LLM_MODEL,
                messages: messages,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`LLM API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.message.content;
    } catch (error) {
        console.error('Error getting LLM response:', error);
        throw error;
    }
}

export function padEmbedding(embedding: number[], targetDim: number): number[] {
    if (embedding.length >= targetDim) {
        return embedding.slice(0, targetDim);
    }
    // Pad with zeros to reach target dimension
    return [...embedding, ...Array(targetDim - embedding.length).fill(0)];
}
