import { connectDB } from '@/lib/db'
import { Portfolio } from '@/models/Portfolio'
import { Transaction } from '@/models/Transaction'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ wallet: string }> },
) {
  try {
    const { wallet } = await params
    const walletAddress = wallet
    const body = await req.json()
    const { tokenCA, sellAmount, currentPrice } = body

    if (
      !walletAddress ||
      !tokenCA ||
      sellAmount === undefined ||
      currentPrice === undefined
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields (wallet, tokenCA, sellAmount, currentPrice)',
        },
        { status: 400 },
      )
    }

    if (sellAmount <= 0) {
      return NextResponse.json(
        { error: 'sellAmount must be greater than 0' },
        { status: 400 },
      )
    }

    await connectDB()

    // 1. Verify existence and sufficient balance
    const portfolioItem = await Portfolio.findOne({ walletAddress, tokenCA })

    if (!portfolioItem || portfolioItem.balance < sellAmount) {
      return NextResponse.json(
        { error: 'Insufficient token balance to complete this sale' },
        { status: 400 },
      )
    }

    // 2. Decrement Portfolio Balance & Adjust totalInvested proportionally
    const ratioSold = sellAmount / portfolioItem.balance
    const investedReduction = portfolioItem.totalInvested * ratioSold

    portfolioItem.balance -= sellAmount
    portfolioItem.totalInvested -= investedReduction

    await portfolioItem.save()

    // 3. Loggign the SELL Transaction
    const transaction = new Transaction({
      walletAddress,
      tokenCA,
      type: 'SELL',
      amount: sellAmount,
      pricePaid: currentPrice, // Assuming currentPrice is passed from the frontend for now
    })
    await transaction.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Sell order processed',
        holding: portfolioItem,
        transaction,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('Error processing sell:', error)
    return NextResponse.json(
      { error: 'Failed to process sell order' },
      { status: 500 },
    )
  }
}
