import {
    QDRANT_HOST,
    QDRANT_PORT,
    QDRANT_COLLECTION,
    VECTOR_DIMENSION,
} from '../config';

function getQdrantUrl(path: string): string {
    const cleanHost = QDRANT_HOST.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '').replace(/;/g, '');
    return `${cleanHost}:${QDRANT_PORT}/${cleanPath}`;
}

export async function ensureQdrantCollection(): Promise<void> {
    try {
        const checkUrl = getQdrantUrl(`collections/${QDRANT_COLLECTION}`);
        const checkResponse = await fetch(checkUrl);

        if (checkResponse.status === 404) {
            const createResponse = await fetch(checkUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: QDRANT_COLLECTION,
                    vectors: {
                        default: {
                            size: VECTOR_DIMENSION,
                            distance: 'Cosine',
                        },
                    },
                }),
            });

            if (!createResponse.ok) {
                const errorText = await createResponse.text();
                console.error('Create collection response:', errorText);
                throw new Error(`Failed to create collection: ${errorText}`);
            }
            console.log('Created Qdrant collection with correct dimensions');
        } else if (checkResponse.ok) {
            // For existing collections, we'll check the configuration instead of updating
            const collectionInfo = await checkResponse.json();
            console.log('Existing collection configuration:', collectionInfo);

            // Verify if the configuration matches what we need
            const vectorConfig = collectionInfo.result?.vectors?.default;
            if (
                !vectorConfig ||
                vectorConfig.size !== VECTOR_DIMENSION ||
                vectorConfig.distance !== 'Cosine'
            ) {
                console.warn(
                    'Collection exists but has different configuration:',
                    vectorConfig
                );
                console.warn('Expected:', {
                    size: VECTOR_DIMENSION,
                    distance: 'Cosine',
                });
                console.warn(
                    'You may need to delete and recreate the collection with the correct configuration.'
                );
            } else {
                console.log('Collection exists with correct configuration');
            }
        }
    } catch (error) {
        console.error('Error ensuring Qdrant collection:', error);
        throw error;
    }
}

export interface SearchMemoryResponse {
    results: Array<{
        memory: string;
        metadata: {
            appId: string;
            mem0_response?: string;
        };
    }>;
}

export async function searchQdrant(
    vector: number[],
    userId: string | undefined
): Promise<SearchMemoryResponse> {
    try {
        const searchUrl = getQdrantUrl(
            `collections/${QDRANT_COLLECTION}/points/search`
        );

        const searchBody = {
            vector: vector,
            limit: 5,
            with_payload: true,
            filter: userId
                ? {
                      must: [
                          {
                              key: 'userId',
                              match: { value: userId },
                          },
                          {
                              key: 'appId',
                              match: { value: 'healthcare-app' },
                          },
                      ],
                  }
                : {
                      must: [
                          {
                              key: 'appId',
                              match: { value: 'healthcare-app' },
                          },
                      ],
                  },
        };

        console.log('Qdrant search request:', {
            url: searchUrl,
            vectorLength: vector.length,
        });

        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchBody),
        });

        if (!response.ok) {
            throw new Error(`Qdrant search failed: ${await response.text()}`);
        }

        const searchResults = await response.json();
        console.log('Qdrant search results:', searchResults);

        return {
            results: (searchResults.result || [])
                .map((hit: any) => {
                    if (!hit?.payload) {
                        console.warn('Hit missing payload:', hit);
                        return null;
                    }
                    return {
                        memory: `${hit.payload.question}\nResponse: ${hit.payload.response}`,
                        metadata: {
                            appId: hit.payload.appId,
                            mem0_response: hit.payload.mem0_response || '',
                        },
                    };
                })
                .filter((result: any) => result !== null),
        };
    } catch (error) {
        console.error('Error searching Qdrant:', error);
        return { results: [] };
    }
}

export async function addToQdrant(
    vector: number[],
    payload: any
): Promise<void> {
    const pointId = Math.floor(Date.now() / 1000);
    const qdrantUrl = getQdrantUrl(`collections/${QDRANT_COLLECTION}/points`);

    console.log('Debug - Qdrant request:', {
        url: qdrantUrl,
        pointId,
    });

    const vectorData = {
        points: [
            {
                id: pointId,
                vector: vector,
                payload,
            },
        ],
    };

    console.log('Sending request to Qdrant:', {
        url: qdrantUrl,
        pointId,
        vectorLength: vector.length,
        sampleVector: vector.slice(0, 5),
        payload: payload,
    });

    try {
        const qdrantResponse = await fetch(qdrantUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vectorData),
        });

        if (!qdrantResponse.ok) {
            const errorText = await qdrantResponse.text();
            console.error('Qdrant request failed:', {
                status: qdrantResponse.status,
                statusText: qdrantResponse.statusText,
                body: errorText,
                requestData: vectorData,
            });
            throw new Error(
                `Qdrant API error: ${qdrantResponse.status} - ${errorText}`
            );
        }

        const responseData = await qdrantResponse.json();
        console.log('Successfully added vector to Qdrant:', responseData);
    } catch (error) {
        console.error('Error adding to Qdrant:', error);
        if (
            error instanceof TypeError &&
            error.message.includes('fetch failed')
        ) {
            console.error(
                'Connection to Qdrant failed. Please check if Qdrant is running and accessible at:',
                qdrantUrl
            );
        }
        throw error;
    }
}
