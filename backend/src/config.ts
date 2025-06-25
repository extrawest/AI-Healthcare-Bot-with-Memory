import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
    'MEM0_API_KEY',
    'OLLAMA_BASE_URL',
    'LLM_MODEL',
    'EMBEDDING_MODEL',
    'QDRANT_HOST',
    'QDRANT_PORT',
    'QDRANT_COLLECTION',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
}

export const MEM0_API_KEY = process.env.MEM0_API_KEY!;
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL!;
export const LLM_MODEL = process.env.LLM_MODEL!;
export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL!;
export const QDRANT_HOST = process.env.QDRANT_HOST!;
export const QDRANT_PORT = process.env.QDRANT_PORT!;
export const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION!;
export const VECTOR_DIMENSION = 1536;
