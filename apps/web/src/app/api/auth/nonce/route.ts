import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { generateNonce } from '@/lib/auth'
import { ethers } from 'ethers'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')

    if (!address || !ethers.isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      )
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          address: address.toLowerCase(),
        },
      })
    }

    // Create session with nonce
    const nonce = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    await prisma.session.create({
      data: {
        userId: user.id,
        nonce,
        expiresAt,
      },
    })

    return NextResponse.json({ nonce })
  } catch (error) {
    console.error('Nonce generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
