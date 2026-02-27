import { connectDB } from '@/lib/db'
import { UserPreferences } from '@/models/UserPreferences'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ wallet: string }> },
) {
  try {
    const { wallet } = await params
    const walletAddress = wallet

    if (!walletAddress) {
      return NextResponse.json({ error: 'wallet is required' }, { status: 400 })
    }

    await connectDB()

    const prefs = await UserPreferences.findOne({ walletAddress })

    // Return early if not found, with a default value of 0
    if (!prefs) {
      return NextResponse.json(
        { success: true, preferences: { defaultBuyAmount: 0 } },
        { status: 200 },
      )
    }

    return NextResponse.json(
      { success: true, preferences: prefs },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 },
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ wallet: string }> },
) {
  try {
    const { wallet } = await params
    const walletAddress = wallet
    const body = await req.json()
    const { defaultBuyAmount } = body

    if (!walletAddress || defaultBuyAmount === undefined) {
      return NextResponse.json(
        { error: 'wallet and defaultBuyAmount are required' },
        { status: 400 },
      )
    }

    if (typeof defaultBuyAmount !== 'number' || defaultBuyAmount < 0) {
      return NextResponse.json(
        { error: 'defaultBuyAmount must be a positive number' },
        { status: 400 },
      )
    }

    await connectDB()

    const prefs = await UserPreferences.findOneAndUpdate(
      { walletAddress },
      { walletAddress, defaultBuyAmount },
      { new: true, upsert: true }, // Create if doesn't exist
    )

    return NextResponse.json(
      { success: true, preferences: prefs },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 },
    )
  }
}
