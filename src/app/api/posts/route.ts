import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { createTapestryPost } from '@/lib/tapestry-posts';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { creatorWallet, contentUrl, caption, tokenCA } = body;

        if (!creatorWallet || !contentUrl || !caption || !tokenCA) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 1. Create post on Tapestry first
        let tapestryContentId = '';
        try {
            const tapestryRes = await createTapestryPost({
                walletAddress: creatorWallet,
                body: caption, // In a real app we might combine caption and contentUrl
            });
            // The exact response shape depends on SocialFi SDK, assuming it returns an ID
            tapestryContentId = tapestryRes?.id || tapestryRes?.data?.id || '';
        } catch (e: any) {
            console.warn('Failed to mirror post to Tapestry:', e.message);
            // We can decide to either fail the whole request or proceed without Tapestry ID
        }

        // 2. Save post to MongoDB
        const post = new Post({
            creatorWallet,
            contentUrl,
            caption,
            tokenCA,
            tapestryContentId,
        });

        await post.save();

        return NextResponse.json({ success: true, post }, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/posts:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to create post' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const walletAddress = searchParams.get('walletAddress');

        await connectDB();

        // Strategy to avoid showing posts user already swiped on
        let filter = {};
        if (walletAddress) {
            // Find all post IDs this user has already swiped on
            const mongoose = require('mongoose');
            const { Swipe } = require('@/models/Swipe');
            // Require is used to avoid circular deps if they happen, otherwise standard import
            const SwipeModel = mongoose.models.Swipe || Swipe;

            const userSwipes = await SwipeModel.find({ swiperWallet: walletAddress }).select('postId');
            const swipedPostIds = userSwipes.map((swipe: any) => swipe.postId);

            filter = { _id: { $nin: swipedPostIds } };
        }

        // Fetch posts sorted by newest first
        const posts = await Post.find(filter).sort({ createdAt: -1 });

        return NextResponse.json({ posts }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching feed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
}
