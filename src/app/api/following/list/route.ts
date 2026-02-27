import { getFollowing } from '@/lib/tapestry'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'username is required' },
        { status: 400 },
      )
    }

    const response = await getFollowing({ username })
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching following:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch following' },
      { status: 500 },
    )
  }
}
