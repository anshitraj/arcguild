import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const seasonId = searchParams.get('seasonId')
    const guildId = searchParams.get('guildId')

    if (!seasonId) {
      return NextResponse.json(
        { error: 'seasonId is required' },
        { status: 400 }
      )
    }

    const where: any = {
      seasonMissions: {
        some: {
          seasonId,
          enabled: true,
        },
      },
    }

    if (guildId) {
      where.guildId = guildId
    }

    const missions = await prisma.missionTemplate.findMany({
      where,
      include: {
        seasonMissions: {
          where: { seasonId },
        },
        guild: {
          select: { id: true, name: true, handle: true },
        },
        _count: {
          select: { progress: true },
        },
      },
    })

    return NextResponse.json(missions)
  } catch (error) {
    console.error('Get missions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
