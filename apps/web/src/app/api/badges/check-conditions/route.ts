import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { requireAuth } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { badgeTemplateId } = body

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
      return NextResponse.json({
        eligible: false,
        reason: 'Already has this badge',
      })
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

    const conditions = badgeTemplate.mintConditions as any[]

    // Check each condition
    for (const condition of conditions) {
      switch (condition.type) {
        case 'MISSION_COMPLETE':
          const missionProgress = await prisma.missionProgress.findFirst({
            where: {
              userId: user.id,
              missionTemplateId: condition.missionTemplateId,
              completed: true,
            },
          })
          if (!missionProgress) {
            return NextResponse.json({
              eligible: false,
              reason: `Mission ${condition.missionTemplateId} not completed`,
            })
          }
          break

        case 'XP_THRESHOLD':
          if (user.xp < condition.threshold) {
            return NextResponse.json({
              eligible: false,
              reason: `XP threshold not met (${user.xp}/${condition.threshold})`,
            })
          }
          break

        case 'REPUTATION_THRESHOLD':
          if (user.reputation < condition.threshold) {
            return NextResponse.json({
              eligible: false,
              reason: `Reputation threshold not met (${user.reputation}/${condition.threshold})`,
            })
          }
          break

        case 'CONTRACT_DEPLOYED':
          const deployment = await prisma.contractDeployment.findFirst({
            where: {
              userId: user.id,
              status: 'SUCCESS',
              ...(condition.template && { template: condition.template }),
            },
          })
          if (!deployment) {
            return NextResponse.json({
              eligible: false,
              reason: 'No contract deployment found',
            })
          }
          break

        case 'ADMIN_APPROVAL':
          // This requires manual approval, so we can't auto-check
          return NextResponse.json({
            eligible: false,
            reason: 'Requires admin approval',
          })

        default:
          return NextResponse.json({
            eligible: false,
            reason: `Unknown condition type: ${condition.type}`,
          })
      }
    }

    return NextResponse.json({ eligible: true })
  } catch (error) {
    console.error('Check badge conditions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
