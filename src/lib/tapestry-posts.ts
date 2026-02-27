import { socialfi } from '@/utils/socialfi';

/**
 * Creates a post on the decentralized Tapestry protocol.
 */
export const createTapestryPost = async ({
    walletAddress,
    namespace,
    body,
}: {
    walletAddress: string;
    namespace?: string;
    body: string;
}) => {
    try {
        const response = await socialfi.contents.findOrCreateCreate(
            { apiKey: process.env.TAPESTRY_API_KEY || '' },
            {
                id: Date.now().toString(), // Generating a unique ID for the content
                profileId: walletAddress,
                properties: [
                    { key: 'body', value: body },
                    { key: 'namespace', value: namespace || 'chronicle' },
                ],
            }
        );
        return response;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to create Tapestry post');
    }
};

/**
 * Likes a post on the decentralized Tapestry protocol.
 */
export const likeTapestryPost = async ({
    walletAddress,
    contentId,
}: {
    walletAddress: string;
    contentId: string;
}) => {
    try {
        const response = await socialfi.likes.likesCreate(
            { apiKey: process.env.TAPESTRY_API_KEY || '', nodeId: contentId },
            { startId: walletAddress }
        );
        return response;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to like Tapestry post');
    }
};
