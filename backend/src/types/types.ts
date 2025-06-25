export interface AIResponse {
    messages: string[];
}

export interface LLMRequest {
    userMessage: string;
    userId: string;
}

export interface SearchMemoryResponse {
    results: Array<{
        memory: string;
    }>;
}

export interface Mem0Response {
    id: string;
    memory: string;
    metadata: {
        appId: string;
        userId?: string;
    };
}
