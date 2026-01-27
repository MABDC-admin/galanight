'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('admin_token', data.token)
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Invalid password')
      }
    } catch (err) {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000' }}>
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md scale-110" style={{ backgroundImage: 'url(/bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
      
      {/* Shimmer Overlay */}
      <div className="shimmer-overlay" />
      
      {/* Sparkle Effects */}
      <div className="sparkle-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Glow Orbs */}
      <div className="glow-orb" style={{ width: '300px', height: '300px', top: '10%', left: '5%', animationDelay: '0s' }} />
      <div className="glow-orb" style={{ width: '200px', height: '200px', top: '60%', right: '10%', animationDelay: '2s' }} />

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="text-center mb-8">
              <Lock className="w-12 h-12 text-[#d4af37] mx-auto mb-4" />
              <h1 className="text-3xl font-light text-[#d4af37] tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
                Admin Access
              </h1>
              <p className="text-white/50 mt-2">Enter password to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 text-white border border-white/10 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:bg-black/40 transition-all"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-black font-semibold rounded-xl hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}