import { ethers } from 'ethers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthPayload {
  address: string
  nonce: string
}

export function generateNonce(): string {
  // Generate random hex string (32 bytes = 64 hex chars)
  const array = new Uint8Array(32)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  } else {
    // Fallback for Node.js
    const crypto = require('crypto')
    return crypto.randomBytes(32).toString('hex')
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function createAuthMessage(address: string, nonce: string): string {
  return `Welcome to ArcGuilds!\n\nSign this message to authenticate.\n\nAddress: ${address}\nNonce: ${nonce}`
}

export function verifySignature(
  address: string,
  signature: string,
  message: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === address.toLowerCase()
  } catch {
    return false
  }
}

export function generateToken(address: string): string {
  return jwt.sign({ address }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { address: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { address: string }
    return decoded
  } catch {
    return null
  }
}

export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.substring(7)
}
