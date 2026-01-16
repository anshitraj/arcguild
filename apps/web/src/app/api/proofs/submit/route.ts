import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@arcguilds/database'
import { requireAuth } from '@/lib/middleware'
import { createHash } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const formData = await request.formData()
    const seasonId = formData.get('seasonId') as string
    const missionTemplateId = formData.get('missionTemplateId') as string
    const payloadStr = formData.get('payload') as string
    const attachment = formData.get('attachment') as File | null

    if (!seasonId || !missionTemplateId || !payloadStr) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Verify mission exists and is enabled
    const mission = await prisma.missionTemplate.findUnique({
      where: { id: missionTemplateId },
      include: {
        seasonMissions: {
          where: { seasonId },
        },
      },
    })

    if (!mission || mission.seasonMissions.length === 0) {
      return NextResponse.json(
        { error: 'Mission not found or not enabled' },
        { status: 404 }
      )
    }

    if (mission.type !== 'OFFCHAIN_PROOF' && mission.type !== 'ADMIN_APPROVED') {
      return NextResponse.json(
        { error: 'Mission does not require proof submission' },
        { status: 400 }
      )
    }

    const payload = JSON.parse(payloadStr)
    let attachmentUrl: string | null = null
    let attachmentHash: string | null = null

    // Handle file upload
    if (attachment) {
      const bytes = await attachment.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const hash = createHash('sha256').update(buffer).digest('hex')
      attachmentHash = hash

      // Check for duplicate
      const existing = await prisma.proofSubmission.findFirst({
        where: {
          missionTemplateId,
          attachmentHash: hash,
          status: { not: 'REJECTED' },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Duplicate proof detected' },
          { status: 409 }
        )
      }

      // Save file
      const uploadsDir = join(process.cwd(), 'uploads', 'proofs')
      await mkdir(uploadsDir, { recursive: true })
      const filename = `${Date.now()}-${hash.slice(0, 8)}.${attachment.name.split('.').pop()}`
      const filepath = join(uploadsDir, filename)
      await writeFile(filepath, buffer)
      attachmentUrl = `/uploads/proofs/${filename}`
    }

    // Get user's guild for this season
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
    })

    const guildMember = await prisma.guildMember.findFirst({
      where: {
        userId: user.id,
        guildId: season?.guildId,
        leftAt: null,
      },
    })

    // Create proof submission
    const proof = await prisma.proofSubmission.create({
      data: {
        seasonId,
        missionTemplateId,
        userId: user.id,
        guildId: guildMember?.guildId || null,
        payload,
        attachmentUrl,
        attachmentHash,
        status: 'PENDING',
      },
    })

    return NextResponse.json(proof, { status: 201 })
  } catch (error) {
    console.error('Submit proof error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
