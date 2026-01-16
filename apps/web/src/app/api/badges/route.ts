import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const guildId = searchParams.get('guildId')
    const seasonId = searchParams.get('seasonId')

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { address: userId.toLowerCase() },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const badges = await prisma.userBadge.findMany({
        where: {
          userId: user.id,
          ...(seasonId && { seasonId }),
        },
        include: {
          badgeTemplate: {
            include: {
              guild: {
                select: { id: true, name: true, handle: true },
              },
            },
          },
        },
        orderBy: { mintedAt: 'desc' },
      })

      return NextResponse.json(badges)
    }

    // Get badge templates
    const where: any = {}
    if (guildId) where.guildId = guildId

    const templates = await prisma.badgeTemplate.findMany({
      where,
      include: {
        guild: {
          select: { id: true, name: true, handle: true },
        },
        _count: {
          select: { userBadges: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Get badges error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
