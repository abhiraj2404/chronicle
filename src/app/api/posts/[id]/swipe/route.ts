import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { Swipe } from '@/models/Swipe';
import { likeTapestryPost } from '@/lib/tapestry-posts';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const postId = params.id;
        const body = await req.json();
        const { swiperWallet, isRightSwipe } = body;

        if (!swiperWallet || isRightSwipe === undefined) {
            return NextResponse.json(
                { error: 'swiperWallet and isRightSwipe are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if the user already swiped on this post
        const existingSwipe = await Swipe.findOne({ swiperWallet, postId });
        if (existingSwipe) {
            return NextResponse.json(
                { error: 'User has already swiped on this post' },
                { status: 400 }
            );
        }

        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Save the new swipe record
        const swipe = new Swipe({
            swiperWallet,
            postId,
            isRightSwipe,
        });
        await swipe.save();

        // Handle Right Swipe Actions (Buy/Like mechanism)
        if (isRightSwipe) {
            // Increment right swipes counter on the post
            post.rightSwipes += 1;
            await post.save();

            // Mirror like to Tapestry if the post has a tapestryContentId
            if (post.tapestryContentId) {
                try {
                    await likeTapestryPost({
                        walletAddress: swiperWallet,
                        contentId: post.tapestryContentId,
                    });
                } catch (e: any) {
                    console.warn('Failed to mirror like to Tapestry:', e.message);
                }
            }
        }

        return NextResponse.json({ success: true, swipe, post }, { status: 201 });
    } catch (error: any) {
        console.error(`Error processing swipe for post ${params.id}:`, error);

        // race condition on saves
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'User has already swiped on this post' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to record swipe' },
            { status: 500 }
        );
    }
}
