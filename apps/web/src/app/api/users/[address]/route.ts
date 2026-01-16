import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { address: params.address.toLowerCase() },
      select: {
        id: true,
        address: true,
        xp: true,
        level: true,
        reputation: true,
        totalMissions: true,
        totalDeployments: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
