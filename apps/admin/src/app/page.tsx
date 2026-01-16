'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, Calendar, Target, Award, FileCheck, Users } from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'seasons', label: 'Seasons', icon: Calendar },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'proofs', label: 'Proof Review', icon: FileCheck },
    { id: 'users', label: 'Users', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-input bg-card">
          <div className="p-6 border-b border-input">
            <h1 className="text-xl font-bold">ArcGuilds Admin</h1>
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-muted-foreground">Manage seasons, missions, badges, and review submissions</p>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-input rounded-lg p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Seasons</h3>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="border border-input rounded-lg p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Pending Proofs</h3>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="border border-input rounded-lg p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Users</h3>
                <p className="text-3xl font-bold">0</p>
              </div>
            </div>
          )}

          {activeTab === 'seasons' && (
            <div className="border border-input rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Seasons</h3>
                <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md">
                  Create Season
                </button>
              </div>
              <p className="text-muted-foreground">Season management interface coming soon</p>
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="border border-input rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Missions</h3>
                <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md">
                  Create Mission
                </button>
              </div>
              <p className="text-muted-foreground">Mission management interface coming soon</p>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="border border-input rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Badges</h3>
                <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md">
                  Create Badge
                </button>
              </div>
              <p className="text-muted-foreground">Badge management interface coming soon</p>
            </div>
          )}

          {activeTab === 'proofs' && (
            <div className="border border-input rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Proof Review Queue</h3>
              <p className="text-muted-foreground">Proof review interface coming soon</p>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="border border-input rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Users</h3>
              <p className="text-muted-foreground">User management interface coming soon</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
