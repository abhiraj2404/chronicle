import { connectDB } from '@/lib/db'
import { Portfolio } from '@/models/Portfolio'
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

    // Fetch all active token balances for the user where the balance is greater than 0
    const holdings = await Portfolio.find({
      walletAddress,
      balance: { $gt: 0 },
    }).sort({ updatedAt: -1 })

    return NextResponse.json({ success: true, holdings }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 },
    )
  }
}
