import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getAuthToken } from './auth'

export async function requireAuth(request: NextRequest) {
  const token = getAuthToken(request)
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const payload = verifyToken(token)
  
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }

  return payload
}
