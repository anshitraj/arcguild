import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { requireAuth } from '@/lib/middleware'
import { ethers } from 'ethers'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const seasonId = searchParams.get('seasonId')

    const where: any = {}
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { address: userId.toLowerCase() },
      })
      if (user) where.userId = user.id
    }
    if (seasonId) where.seasonId = seasonId

    const deployments = await prisma.contractDeployment.findMany({
      where,
      include: {
        user: {
          select: { address: true },
        },
      },
      orderBy: { deployedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(deployments)
  } catch (error) {
    console.error('Get deployments error:', error)
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
    const { template, contractName, constructorArgs, seasonId, deploymentTx, contractAddress } = body

    if (!template || !contractName) {
      return NextResponse.json(
        { error: 'Template and contract name are required' },
        { status: 400 }
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

    // Verify deployment if tx hash provided
    let status = 'PENDING'
    if (deploymentTx && contractAddress) {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network')
        const receipt = await provider.getTransactionReceipt(deploymentTx)
        
        if (receipt && receipt.status === 1) {
          // Verify contract address matches
          const deployedAddress = receipt.contractAddress
          if (deployedAddress?.toLowerCase() === contractAddress.toLowerCase()) {
            status = 'SUCCESS'
          }
        } else {
          status = 'FAILED'
        }
      } catch (error) {
        console.error('Deployment verification error:', error)
        status = 'FAILED'
      }
    }

    const deployment = await prisma.contractDeployment.create({
      data: {
        userId: user.id,
        seasonId: seasonId || null,
        template,
        contractName,
        contractAddress: contractAddress || null,
        deploymentTx: deploymentTx || null,
        status,
        constructorArgs: constructorArgs || {},
      },
    })

    // Award XP if successful
    if (status === 'SUCCESS') {
      const xpReward = 100 // Base XP for deployment
      await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: xpReward },
          totalDeployments: { increment: 1 },
        },
      })

      await prisma.xPTransaction.create({
        data: {
          userId: user.id,
          amount: xpReward,
          source: 'CONTRACT_DEPLOY',
          sourceId: deployment.id,
          description: `Deployed ${contractName}`,
        },
      })
    }

    return NextResponse.json(deployment, { status: 201 })
  } catch (error) {
    console.error('Create deployment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
