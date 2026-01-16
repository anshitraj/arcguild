import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'

export async function GET(request: NextRequest) {
  try {
    // Get the first active season (you can modify this logic as needed)
    const season = await prisma.season.findFirst({
      where: {
        status: 'ACTIVE',
        startAt: { lte: new Date() },
        endAt: { gte: new Date() },
      },
      include: {
        guild: {
          select: {
            id: true,
            name: true,
            handle: true,
            logoUrl: true,
          },
        },
        _count: {
          select: {
            progress: true,
            proofs: true,
          },
        },
      },
      orderBy: { startAt: 'desc' },
    })

    if (!season) {
      return NextResponse.json(
        { error: 'No active season found' },
        { status: 404 }
      )
    }

    // Get total unique users in this season
    const uniqueUsers = await prisma.missionProgress.groupBy({
      by: ['userId'],
      where: { seasonId: season.id },
    })

    // Get total guilds participating
    const uniqueGuilds = await prisma.missionProgress.groupBy({
      by: ['guildId'],
      where: { seasonId: season.id },
    })

    return NextResponse.json({
      ...season,
      totalPlayers: uniqueUsers.length,
      totalGuilds: uniqueGuilds.length,
    })
  } catch (error) {
    console.error('Get active season error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
