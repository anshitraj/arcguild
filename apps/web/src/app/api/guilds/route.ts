import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    const where: any = {
      status: 'ACTIVE',
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { handle: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags }
    }

    const guilds = await prisma.guild.findMany({
      where,
      include: {
        creator: {
          select: { address: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(guilds)
  } catch (error) {
    console.error('Get guilds error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { handle, name, description, logoUrl, bannerUrl, tags, website, twitter, discord } = body

    if (!handle || !name) {
      return NextResponse.json(
        { error: 'Handle and name are required' },
        { status: 400 }
      )
    }

    // Validate handle format
    if (!/^[a-z0-9-]+$/.test(handle)) {
      return NextResponse.json(
        { error: 'Handle must be lowercase alphanumeric with hyphens only' },
        { status: 400 }
      )
    }

    // Check if handle exists
    const existing = await prisma.guild.findUnique({
      where: { handle },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Handle already taken' },
        { status: 409 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { address: auth.address.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create guild
    const guild = await prisma.guild.create({
      data: {
        handle,
        name,
        description,
        logoUrl,
        bannerUrl,
        tags: tags || [],
        website,
        twitter,
        discord,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: { address: true },
        },
      },
    })

    // Auto-join creator as leader
    await prisma.guildMember.create({
      data: {
        guildId: guild.id,
        userId: user.id,
        role: 'LEADER',
      },
    })

    return NextResponse.json(guild, { status: 201 })
  } catch (error) {
    console.error('Create guild error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
