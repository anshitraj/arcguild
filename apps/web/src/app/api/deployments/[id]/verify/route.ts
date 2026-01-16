import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { requireAuth } from '@/lib/middleware'
import { ethers } from 'ethers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const deployment = await prisma.contractDeployment.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    if (deployment.user.address.toLowerCase() !== auth.address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (!deployment.deploymentTx || !deployment.contractAddress) {
      return NextResponse.json(
        { error: 'Deployment transaction or address missing' },
        { status: 400 }
      )
    }

    // Verify onchain
    const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network')
    const receipt = await provider.getTransactionReceipt(deployment.deploymentTx)

    if (!receipt || receipt.status !== 1) {
      await prisma.contractDeployment.update({
        where: { id: params.id },
        data: { status: 'FAILED', errorMessage: 'Transaction failed' },
      })
      return NextResponse.json({ verified: false, status: 'FAILED' })
    }

    const deployedAddress = receipt.contractAddress
    if (deployedAddress?.toLowerCase() !== deployment.contractAddress.toLowerCase()) {
      await prisma.contractDeployment.update({
        where: { id: params.id },
        data: { status: 'FAILED', errorMessage: 'Address mismatch' },
      })
      return NextResponse.json({ verified: false, status: 'FAILED' })
    }

    // Update status
    const updated = await prisma.contractDeployment.update({
      where: { id: params.id },
      data: { status: 'SUCCESS' },
    })

    // Award XP if not already awarded
    if (!deployment.xpAwarded) {
      const xpReward = 100
      await prisma.user.update({
        where: { id: deployment.userId },
        data: {
          xp: { increment: xpReward },
          totalDeployments: { increment: 1 },
        },
      })

      await prisma.xPTransaction.create({
        data: {
          userId: deployment.userId,
          amount: xpReward,
          source: 'CONTRACT_DEPLOY',
          sourceId: deployment.id,
          description: `Deployed ${deployment.contractName}`,
        },
      })

      await prisma.contractDeployment.update({
        where: { id: params.id },
        data: { xpAwarded: xpReward },
      })
    }

    return NextResponse.json({ verified: true, deployment: updated })
  } catch (error) {
    console.error('Verify deployment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
