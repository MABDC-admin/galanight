'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RotateCcw, Users, Calendar, AlertTriangle, Search, Upload, Check } from 'lucide-react'
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
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const router = useRouter()

  // Set isClient to true on mount to ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

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

  const searchStudents = async (query: string) => {
    if (!query) {
      setStudents([])
      return
    }
    setSearching(true)
    try {
      const response = await fetch(`/api/students/search?q=${query}&key=gala2026`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchStudents(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleFileUpload = async (studentId: number, file: File) => {
    setUploadingId(studentId)
    const formData = new FormData()

    try {
      showToast('Removing background...', 'success')
      const { removeBackground } = await import('@imgly/background-removal')
      const blob = await removeBackground(file)
      const processedFile = new File([blob], 'avatar.png', { type: 'image/png' })

      formData.append('file', processedFile)
      formData.append('studentId', studentId.toString())

      const response = await fetch('/api/admin/students/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: formData
      })

      if (response.ok) {
        showToast('Photo uploaded successfully!', 'success')
        searchStudents(searchQuery)
      } else {
        const data = await response.json()
        showToast(data.error || 'Upload failed', 'error')
      }
    } catch (error) {
      showToast('Upload failed', 'error')
    } finally {
      setUploadingId(null)
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
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

      {/* Sparkle Effects - Rendered only on client */}
      {isClient && (
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
      )}

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

        {/* Student Management Section */}
        <div className="backdrop-blur-xl bg-black/40 border border-[#d4af37]/30 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl text-[#d4af37] font-semibold">Student Directory</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                placeholder="Search to edit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50"
              />
            </div>
          </div>

          <div className="space-y-3">
            {searching ? (
              <div className="text-center py-8 text-white/30">Searching...</div>
            ) : students.length > 0 ? (
              students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-black/40 flex items-center justify-center relative">
                      {/* Grey circle backdrop */}
                      <div className="absolute w-6 h-6 bg-[#333333] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.fullName} className="relative z-10 w-full h-full object-cover" />
                      ) : (
                        <div className="relative z-10 w-full h-full flex items-center justify-center text-white/30">
                          <span className="text-sm font-bold">{getInitials(student.fullName)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{student.fullName}</div>
                      <div className="text-white/40 text-sm">Grade {student.grade}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer group">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(student.id, file)
                        }}
                        disabled={uploadingId === student.id}
                      />
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${uploadingId === student.id
                        ? 'bg-white/10 text-white/40 cursor-wait'
                        : 'bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 border border-[#d4af37]/20'
                        }`}>
                        {uploadingId === student.id ? 'Uploading...' : (
                          <>
                            <Upload size={16} />
                            Upload Photo
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              ))
            ) : searchQuery ? (
              <div className="text-center py-8 text-white/30">No students found</div>
            ) : (
              <div className="text-center py-8 text-white/30 italic">Search for a student to upload their photo</div>
            )}
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
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl text-lg shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}