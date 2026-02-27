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
        const response = await socialfi.contents.contentsCreate({
            apiKey: process.env.TAPESTRY_API_KEY || '',
            walletAddress,
            namespace: namespace || 'chronicle',
            body,
        });
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
        const response = await socialfi.likes.likesCreate({
            apiKey: process.env.TAPESTRY_API_KEY || '',
            walletAddress,
            contentId,
        });
        return response;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to like Tapestry post');
    }
};
