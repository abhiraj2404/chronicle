import { connectDB } from '@/lib/db'
import { likeTapestryPost } from '@/lib/tapestry-posts'
import { Portfolio } from '@/models/Portfolio'
import { Post } from '@/models/Post'
import { Swipe } from '@/models/Swipe'
import { Transaction } from '@/models/Transaction'
import { UserPreferences } from '@/models/UserPreferences'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const postId = id
    const body = await req.json()
    const { swiperWallet, isRightSwipe, customBuyAmount } = body

    if (!swiperWallet || isRightSwipe === undefined) {
      return NextResponse.json(
        { error: 'swiperWallet and isRightSwipe are required' },
        { status: 400 },
      )
    }

    await connectDB()

    // Check if the user already swiped on this post
    const existingSwipe = await Swipe.findOne({ swiperWallet, postId })
    if (existingSwipe) {
      return NextResponse.json(
        { error: 'User has already swiped on this post' },
        { status: 400 },
      )
    }

    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Determine the actual buy amount if it's a right swipe
    let buyAmount = 0
    if (isRightSwipe) {
      if (customBuyAmount !== undefined && customBuyAmount > 0) {
        buyAmount = customBuyAmount
      } else {
        // Fetch default preference
        const prefs = await UserPreferences.findOne({
          walletAddress: swiperWallet,
        })
        if (prefs && prefs.defaultBuyAmount > 0) {
          buyAmount = prefs.defaultBuyAmount
        }
      }
    }

    // Save the new swipe record
    const swipe = new Swipe({
      swiperWallet,
      postId,
      isRightSwipe,
      buyAmount: isRightSwipe ? buyAmount : undefined,
    })
    await swipe.save()

    let transaction = null

    if (isRightSwipe) {
      if (buyAmount > 0) {
        //updating portfolio
        //a simulated execution price or fetch from real Oracle if we go w one
        //assuming `buyAmount` passed/configured is in Quote currency (e.g., exactly $10 USDC to spend)
        // for simplicity without live quoting here, we record the "amount" as the total USD spent.
        // in prod,wed calculate exact token amounts via Jupiter/Raydium here.

        await Portfolio.findOneAndUpdate(
          { walletAddress: swiperWallet, tokenCA: post.tokenCA },
          {
            $inc: {
              balance: buyAmount,
              totalInvested: buyAmount,
            },
          },
          { new: true, upsert: true },
        )

        // Log the BUY Transaction
        transaction = new Transaction({
          walletAddress: swiperWallet,
          tokenCA: post.tokenCA,
          type: 'BUY',
          amount: buyAmount,
          pricePaid: buyAmount,
        })
        await transaction.save()
      }
      // Increment right swipes counter on the post
      post.rightSwipes += 1
      await post.save()

      // Mirror like to Tapestry if the post has a tapestryContentId
      if (post.tapestryContentId) {
        try {
          await likeTapestryPost({
            walletAddress: swiperWallet,
            contentId: post.tapestryContentId,
          })
        } catch (e: any) {
          console.warn('Failed to mirror like to Tapestry:', e.message)
        }
      }
    }

    return NextResponse.json({ success: true, swipe, post }, { status: 201 })
  } catch (error: any) {
    console.error('Error processing swipe:', error)

    // race condition on saves
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User has already swiped on this post' },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to record swipe' },
      { status: 500 },
    )
  }
}
