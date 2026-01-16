import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { requireAuth } from '@/lib/middleware'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const guild = await prisma.guild.findFirst({
      where: {
        OR: [
          { id: params.id },
          { handle: params.id },
        ],
      },
    })

    if (!guild) {
      return NextResponse.json(
        { error: 'Guild not found' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { address: auth.address.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const membership = await prisma.guildMember.findUnique({
      where: {
        guildId_userId: {
          guildId: guild.id,
          userId: user.id,
        },
      },
    })

    if (!membership || membership.leftAt) {
      return NextResponse.json(
        { error: 'Not a member' },
        { status: 404 }
      )
    }

    // Don't allow leader to leave
    if (membership.role === 'LEADER') {
      return NextResponse.json(
        { error: 'Leader cannot leave guild' },
        { status: 403 }
      )
    }

    await prisma.guildMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Leave guild error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
