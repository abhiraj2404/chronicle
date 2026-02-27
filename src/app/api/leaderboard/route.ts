import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        await connectDB();

        // Aggregate to sum up rightSwipes per creator and sort to find top creators
        const leaderboard = await Post.aggregate([
            {
                $group: {
                    _id: '$creatorWallet',
                    totalRightSwipes: { $sum: '$rightSwipes' },
                    totalPosts: { $sum: 1 },
                },
            },
            {
                $project: {
                    creatorWallet: '$_id',
                    totalRightSwipes: 1,
                    totalPosts: 1,
                    _id: 0,
                },
            },
            { $sort: { totalRightSwipes: -1 } },
            { $limit: limit },
        ]);

        return NextResponse.json({ success: true, leaderboard }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
