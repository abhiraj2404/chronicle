import { connectDB } from '@/lib/db'
import { Post } from '@/models/Post'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ wallet: string }> },
) {
  try {
    const { wallet } = await params
    const creatorWallet = wallet

    if (!creatorWallet) {
      return NextResponse.json(
        { error: 'creatorWallet is required' },
        { status: 400 },
      )
    }

    await connectDB()

    // Aggregate to find total right swipes for this creator across all posts
    const analytics = await Post.aggregate([
      { $match: { creatorWallet } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalRightSwipes: { $sum: '$rightSwipes' },
        },
      },
    ])

    // Fetch the individual posts for their profile
    const posts = await Post.find({ creatorWallet }).sort({ createdAt: -1 })

    const stats =
      analytics.length > 0
        ? analytics[0]
        : { totalPosts: 0, totalRightSwipes: 0 }
    delete stats._id

    return NextResponse.json({ success: true, stats, posts }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching creator analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch creator analytics' },
      { status: 500 },
    )
  }
}
