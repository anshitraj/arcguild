import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { verifySignature, createAuthMessage, generateToken } from '@/lib/auth'
import { ethers } from 'ethers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, signature, nonce } = body

    if (!address || !signature || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      )
    }

    // Find session by nonce
    const session = await prisma.session.findUnique({
      where: { nonce },
      include: { user: true },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 401 }
      )
    }

    if (session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Nonce expired' },
        { status: 401 }
      )
    }

    if (session.user.address.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Address mismatch' },
        { status: 401 }
      )
    }

    // Verify signature
    const message = createAuthMessage(address, nonce)
    const isValid = verifySignature(address, signature, message)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Update user last login
    await prisma.user.update({
      where: { id: session.userId },
      data: { lastLogin: new Date() },
    })

    // Delete used session
    await prisma.session.delete({
      where: { id: session.id },
    })

    // Generate JWT token
    const token = generateToken(address)

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Signature verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
