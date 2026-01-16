import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const seasonId = searchParams.get('seasonId')
    const type = searchParams.get('type') || 'individual' // 'individual' or 'guild'

    if (!seasonId) {
      return NextResponse.json(
        { error: 'seasonId is required' },
        { status: 400 }
      )
    }

    if (type === 'guild') {
      // Guild leaderboard
      const guildScores = await prisma.guildMember.groupBy({
        by: ['guildId'],
        where: {
          guild: {
            seasons: {
              some: { id: seasonId },
            },
          },
          leftAt: null,
        },
        _sum: {
          guildXP: true,
          contributionScore: true,
        },
        orderBy: {
          _sum: {
            guildXP: 'desc',
          },
        },
        take: 100,
      })

      const guildIds = guildScores.map((g) => g.guildId)
      const guilds = await prisma.guild.findMany({
        where: { id: { in: guildIds } },
        select: {
          id: true,
          name: true,
          handle: true,
          logoUrl: true,
        },
      })

      const leaderboard = guildScores.map((score) => {
        const guild = guilds.find((g) => g.id === score.guildId)
        return {
          guild,
          guildXP: score._sum.guildXP || 0,
          contributionScore: score._sum.contributionScore || 0,
        }
      })

      return NextResponse.json(leaderboard)
    } else {
      // Individual leaderboard
      const users = await prisma.user.findMany({
        where: {
          missionProgress: {
            some: { seasonId },
          },
        },
        select: {
          id: true,
          address: true,
          xp: true,
          level: true,
          reputation: true,
          missionProgress: {
            where: { seasonId },
            select: {
              xpAwarded: true,
              guildScoreAwarded: true,
            },
          },
        },
        orderBy: { xp: 'desc' },
        take: 100,
      })

      const leaderboard = users.map((user) => {
        const seasonXP = user.missionProgress.reduce((sum, p) => sum + p.xpAwarded, 0)
        const seasonScore = user.missionProgress.reduce((sum, p) => sum + p.guildScoreAwarded, 0)

        return {
          user: {
            address: user.address,
            xp: user.xp,
            level: user.level,
            reputation: user.reputation,
          },
          seasonXP,
          seasonScore,
        }
      })

      return NextResponse.json(leaderboard)
    }
  } catch (error) {
    console.error('Get leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
