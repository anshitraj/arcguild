import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const searchParams = request.nextUrl.searchParams
    const seasonId = searchParams.get('seasonId')
    const userId = searchParams.get('userId') || auth.address

    if (!seasonId) {
      return NextResponse.json(
        { error: 'seasonId is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { address: userId.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const progress = await prisma.missionProgress.findMany({
      where: {
        seasonId,
        userId: user.id,
      },
      include: {
        missionTemplate: true,
      },
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Get mission progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
