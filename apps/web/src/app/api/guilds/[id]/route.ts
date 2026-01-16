import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { requireAuth } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guild = await prisma.guild.findFirst({
      where: {
        OR: [
          { id: params.id },
          { handle: params.id },
        ],
      },
      include: {
        creator: {
          select: { address: true },
        },
        members: {
          include: {
            user: {
              select: { address: true, xp: true, level: true },
            },
          },
          take: 10,
        },
        seasons: {
          where: { status: 'ACTIVE' },
          orderBy: { startAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { members: true, missions: true, badges: true },
        },
      },
    })

    if (!guild) {
      return NextResponse.json(
        { error: 'Guild not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(guild)
  } catch (error) {
    console.error('Get guild error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
