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

    const body = await request.json()
    const { inviteCode } = body

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

    if (!guild.isPublic && guild.inviteCode !== inviteCode) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 403 }
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

    // Check if already a member
    const existing = await prisma.guildMember.findUnique({
      where: {
        guildId_userId: {
          guildId: guild.id,
          userId: user.id,
        },
      },
    })

    if (existing && !existing.leftAt) {
      return NextResponse.json(
        { error: 'Already a member' },
        { status: 409 }
      )
    }

    // Create or update membership
    if (existing) {
      await prisma.guildMember.update({
        where: { id: existing.id },
        data: {
          leftAt: null,
          joinedAt: new Date(),
        },
      })
    } else {
      await prisma.guildMember.create({
        data: {
          guildId: guild.id,
          userId: user.id,
          role: 'MEMBER',
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Join guild error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
