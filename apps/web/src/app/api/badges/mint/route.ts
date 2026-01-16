import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { requireAuth } from '@/lib/middleware'
import { ethers } from 'ethers'

const BADGE_FACTORY_ADDRESS = process.env.BADGE_FACTORY_ADDRESS || ''
const BADGE_FACTORY_ABI = [
  'function mintBadge(address to, uint256 badgeTypeId, string calldata tokenURI) external returns (uint256)',
  'function createBadgeType(string calldata name, string calldata imageURI, bool isSBT, uint256 guildId, bytes32 conditionsHash) external returns (uint256)',
]

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { badgeTemplateId, txHash, tokenId, contractAddress } = body

    if (!badgeTemplateId) {
      return NextResponse.json(
        { error: 'badgeTemplateId is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { address: auth.address.toLowerCase() },
      include: {
        badges: {
          where: { badgeTemplateId },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already has badge
    if (user.badges.length > 0) {
      return NextResponse.json(
        { error: 'Already has this badge' },
        { status: 409 }
      )
    }

    const badgeTemplate = await prisma.badgeTemplate.findUnique({
      where: { id: badgeTemplateId },
    })

    if (!badgeTemplate) {
      return NextResponse.json(
        { error: 'Badge template not found' },
        { status: 404 }
      )
    }

    // Verify conditions (reuse check logic)
    // For now, we'll trust the frontend check, but in production you'd re-verify here

    // If txHash and tokenId provided, user already minted onchain
    // Otherwise, we need to mint via contract (requires admin/minter role)
    let finalTokenId = tokenId
    let finalTxHash = txHash
    let finalContractAddress = contractAddress || BADGE_FACTORY_ADDRESS

    // If not provided, attempt to mint (requires backend to have minter role)
    if (!finalTokenId && !finalTxHash && BADGE_FACTORY_ADDRESS) {
      try {
        // This would require the backend to have a wallet with minter role
        // For now, we'll just create the database record
        // In production, you'd call the contract here:
        // const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC_URL)
        // const wallet = new ethers.Wallet(process.env.MINTER_PRIVATE_KEY, provider)
        // const badgeFactory = new ethers.Contract(BADGE_FACTORY_ADDRESS, BADGE_FACTORY_ABI, wallet)
        // const tx = await badgeFactory.mintBadge(user.address, badgeTemplate.id, badgeTemplate.imageUrl)
        // const receipt = await tx.wait()
        // finalTokenId = receipt.events[0].args.tokenId.toString()
        // finalTxHash = receipt.hash
      } catch (error) {
        console.error('Contract minting error:', error)
        // Continue with database record even if contract mint fails
      }
    }

    // Create user badge
    const userBadge = await prisma.userBadge.create({
      data: {
        userId: user.id,
        badgeTemplateId,
        tokenId: finalTokenId || null,
        txHash: finalTxHash || null,
        contractAddress: finalContractAddress || null,
        earnedReason: 'Conditions met',
        proofData: {},
      },
    })

    return NextResponse.json(userBadge, { status: 201 })
  } catch (error) {
    console.error('Mint badge error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
