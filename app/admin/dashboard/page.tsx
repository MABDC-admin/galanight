'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RotateCcw, Users, Calendar, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCheckedIn: 0,
    totalStudents: 0,
    gradeData: [] as Array<{ grade: number; checkedIn: number; total: number }>
  })
  const [loading, setLoading] = useState(true)
  const [resetLoading, setResetLoading] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }

    setResetLoading(true)
    try {
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        showToast('All attendance records have been reset successfully!', 'success')
        setConfirmReset(false)
        fetchStats()
      } else {
        showToast(data.error || 'Reset failed', 'error')
      }
    } catch (error) {
      showToast('Reset failed', 'error')
    } finally {
      setResetLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: '#000' }}>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md scale-110" style={{ backgroundImage: 'url(/bg.png)' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-2xl text-[#d4af37] animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000' }}>
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md scale-110" style={{ backgroundImage: 'url(/bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
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

      {/* Header */}
      <header className="relative z-10 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl text-[#d4af37] tracking-wider font-light" style={{ fontFamily: 'Georgia, serif' }}>
              Admin Dashboard
            </h1>
            <p className="text-[#a0a0a0] text-lg mt-1">Manage attendance records</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={logout}
              className="px-4 py-2 text-white/80 hover:text-[#d4af37] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="backdrop-blur-xl bg-black/40 border border-[#d4af37]/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-[#d4af37]" />
              <div>
                <div className="text-3xl font-bold text-[#d4af37]">{stats.totalCheckedIn}</div>
                <div className="text-white/50">Students Checked In</div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-black/40 border border-[#d4af37]/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Calendar className="w-10 h-10 text-[#d4af37]" />
              <div>
                <div className="text-3xl font-bold text-[#d4af37]">{stats.totalStudents}</div>
                <div className="text-white/50">Total Students</div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-black/40 border border-[#d4af37]/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-[#d4af37]">
                {stats.totalStudents > 0 ? Math.round((stats.totalCheckedIn / stats.totalStudents) * 100) : 0}%
              </div>
              <div className="text-white/50">Attendance Rate</div>
            </div>
          </div>
        </div>

        {/* Reset Section */}
        <div className="backdrop-blur-xl bg-black/40 border border-red-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl text-red-400 font-semibold mb-2">Reset Attendance Records</h2>
              <p className="text-white/70 mb-6">
                This will clear all check-in records and reset attendance status for all students. 
                This action cannot be undone.
              </p>
              
              {!confirmReset ? (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset All Records
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    disabled={resetLoading}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {resetLoading ? 'Resetting...' : 'Confirm Reset'}
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grade Breakdown */}
        <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl text-[#d4af37] font-semibold mb-6">Grade Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.gradeData.map((grade) => (
              <div key={grade.grade} className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-[#d4af37]">{grade.checkedIn}</div>
                <div className="text-white/50 text-sm">Grade {grade.grade}</div>
                <div className="text-white/30 text-xs mt-1">{grade.total} total</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 backdrop-blur-xl bg-white/5 text-white/80 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-[#d4af37]/30 hover:text-[#d4af37] transition-all"
          >
            <ArrowLeft size={20} />
            Back to Check-In
          </Link>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl text-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}