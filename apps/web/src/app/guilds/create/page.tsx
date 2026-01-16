'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ApiClient } from '@arcguilds/sdk'

const api = new ApiClient({ baseUrl: typeof window !== 'undefined' ? window.location.origin : '' })

export default function CreateGuildPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    handle: '',
    name: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    website: '',
    twitter: '',
    discord: '',
    tags: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      alert('Please connect your wallet')
      return
    }

    setLoading(true)

    try {
      // Get auth token (you'd need to implement auth flow)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Please sign in first')
        return
      }

      const response = await fetch('/api/guilds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create guild')
      }

      const guild = await response.json()
      router.push(`/guilds/${guild.handle}`)
    } catch (error: any) {
      alert(error.message || 'Failed to create guild')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Link href="/guilds" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Guilds
        </Link>

        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Create Guild</h1>

          {!isConnected && (
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm">Please connect your wallet to create a guild</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Handle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="my-guild"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value.toLowerCase() })}
                pattern="[a-z0-9-]+"
              />
              <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, and hyphens only</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="My Awesome Guild"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows={4}
                placeholder="Tell us about your guild..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Logo URL</label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="https://..."
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Banner URL</label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="https://..."
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="defi, nft, dao"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated tags</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Twitter</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="@username"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discord</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="invite-code"
                  value={formData.discord}
                  onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading || !isConnected}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Guild'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
