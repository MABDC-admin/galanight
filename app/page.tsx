'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Check } from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: number
  fullName: string
  grade: number
  checked: string | null
}

interface ReportData {
  summary: {
    total: number
    totalStudents: number
  }
  gradeData: Array<{
    grade: number
    total: number
    checkedIn: number
  }>
  recentCheckins: Array<{
    fullName: string
    grade: number
    checkinTime: Date
  }>
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [activeTab, setActiveTab] = useState<'reports' | 'checkins'>('reports')

  const searchStudents = useCallback(async (query: string) => {
    if (query.length < 1) {
      setStudents([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/students/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports?key=gala2026')
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  useEffect(() => {
    fetchReports()
    const interval = setInterval(fetchReports, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchStudents(searchQuery)
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery, searchStudents])

  const handleCheckin = async (id: number, name: string) => {
    if (!confirm(`Check in ${name} for MABDC Gala Night?`)) return

    try {
      const response = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      const data = await response.json()
      
      if (response.ok) {
        showToast(data.message || 'Checked in successfully')
        searchStudents(searchQuery)
        fetchReports()
      } else {
        showToast(data.error || 'Check-in failed')
      }
    } catch (error) {
      showToast('Check-in failed')
    }
  }

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md scale-110"
        style={{ backgroundImage: 'url(/bg.png)' }}
      />
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
      <div className="glow-orb" style={{ width: '150px', height: '150px', bottom: '20%', left: '30%', animationDelay: '4s' }} />

      {/* Reports Dashboard Button - Top Right */}
      <Link 
        href="/reports?key=gala2026"
        className="fixed top-6 right-6 z-50 group overflow-hidden rounded-xl transition-all duration-300 hover:scale-105"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#f4e4bc] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative backdrop-blur-xl bg-black/60 border border-[#d4af37]/50 rounded-xl px-5 py-3 group-hover:bg-transparent transition-all">
          <span className="text-sm font-bold tracking-wider text-[#d4af37] group-hover:text-black transition-colors">
            REPORTS DASHBOARD
          </span>
        </div>
      </Link>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-6">
        <h1 className="text-5xl md:text-6xl text-center text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f4e4bc] to-[#d4af37] tracking-wider font-light" style={{ fontFamily: 'Georgia, serif', filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4))' }}>
          MABDC Gala Night
        </h1>
        <p className="text-center text-[#a0a0a0] text-lg mt-2 tracking-widest uppercase">Student Check-In System</p>
        <div className="w-64 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-4"></div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel - Search and Students */}
          <div className="lg:col-span-7 space-y-6">
            {/* Search Bar - Glassmorphism */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4af37] to-[#f4e4bc] rounded-2xl opacity-30 group-hover:opacity-50 blur transition-all"></div>
              <div className="relative backdrop-blur-xl bg-white/5 rounded-2xl p-1">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#d4af37]" size={22} />
                  <input
                    type="text"
                    placeholder="Search student by last name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-lg px-14 py-4 bg-black/30 text-white border border-white/10 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:bg-black/40 transition-all placeholder-white/40"
                  />
                </div>
              </div>
            </div>

            {/* Student List - Card Based */}
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin">
              {loading && (
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 text-center">
                  <div className="animate-pulse text-[#d4af37] text-lg">Searching...</div>
                </div>
              )}

              {!loading && searchQuery.length < 1 && (
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-12 text-center border border-white/5">
                  <Search size={48} className="mx-auto text-[#d4af37]/30 mb-4" />
                  <div className="text-white/50 text-lg">Type a last name to search</div>
                </div>
              )}

              {!loading && searchQuery.length >= 1 && students.length === 0 && (
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-12 text-center border border-white/5">
                  <div className="text-white/50 text-lg">No students found</div>
                </div>
              )}

              {students.map((student) => (
                <div
                  key={student.id}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01] ${
                    student.checked 
                      ? 'hover:shadow-[0_8px_32px_rgba(34,197,94,0.15)]' 
                      : 'hover:shadow-[0_8px_32px_rgba(212,175,55,0.15)]'
                  }`}
                >
                  {/* Gradient border effect */}
                  <div className={`absolute inset-0 rounded-2xl ${
                    student.checked 
                      ? 'bg-gradient-to-r from-[#22c55e]/20 to-[#16a34a]/20' 
                      : 'bg-gradient-to-r from-[#d4af37]/20 to-[#f4e4bc]/20'
                  }`}></div>
                  
                  <div className={`relative backdrop-blur-xl rounded-2xl p-5 border ${
                    student.checked 
                      ? 'bg-[#0a1a0f]/80 border-[#22c55e]/30' 
                      : 'bg-black/40 border-[#d4af37]/20'
                  }`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-xl text-white font-medium truncate">{student.fullName}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[#d4af37] text-sm font-medium">Grade {student.grade}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          {student.checked ? (
                            <span className="text-[#22c55e] text-sm flex items-center gap-1.5">
                              <Check size={14} /> Checked In
                            </span>
                          ) : (
                            <span className="text-white/40 text-sm">Pending</span>
                          )}
                        </div>
                      </div>

                      {!student.checked && (
                        <button
                          onClick={() => handleCheckin(student.id, student.fullName)}
                          className="flex-shrink-0 px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-black rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_24px_rgba(212,175,55,0.4)] hover:scale-105 transition-all duration-200"
                        >
                          CHECK IN
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Reports Dashboard */}
          <div className="lg:col-span-5 space-y-6">
            {/* Grand Total - Hero Card */}
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 via-transparent to-[#d4af37]/10"></div>
              <div className="relative backdrop-blur-xl bg-black/40 border-2 border-[#d4af37]/40 rounded-2xl p-6 text-center">
                <div className="text-sm text-[#d4af37] uppercase tracking-widest mb-2">Grand Total</div>
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f4e4bc] to-[#d4af37]" style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.3))' }}>
                  {reportData?.summary.total || 0}
                  <span className="text-2xl text-white/30 mx-2">/</span>
                  <span className="text-2xl text-white/50">{reportData?.summary.totalStudents || 0}</span>
                </div>
                <div className="text-white/50 text-sm mt-2">Students Checked In</div>
                
                {/* Progress bar */}
                <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e4bc] rounded-full transition-all duration-500"
                    style={{ width: `${reportData ? (reportData.summary.total / reportData.summary.totalStudents) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Slider Widget - Live Reports & Recent Check-ins */}
            <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="tabs flex border-b border-white/10">
                <button 
                  onClick={() => setActiveTab('reports')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'reports' 
                      ? 'text-[#d4af37] border-b-2 border-[#d4af37]' 
                      : 'text-white/70 border-b-2 border-transparent hover:text-[#d4af37]'
                  }`}
                >
                  Live Reports
                </button>
                <button 
                  onClick={() => setActiveTab('checkins')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'checkins' 
                      ? 'text-[#22c55e] border-b-2 border-[#22c55e]' 
                      : 'text-white/70 border-b-2 border-transparent hover:text-[#22c55e]'
                  }`}
                >
                  Recent Check-ins
                </button>
              </div>
              <div className="p-5">
                {/* Live Reports Tab */}
                {activeTab === 'reports' && (
                  <div className="space-y-2">
                    {reportData?.gradeData.slice().reverse().map((grade) => (
                      <div key={grade.grade} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-white/80 font-medium">Grade {grade.grade}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#d4af37] font-bold">{grade.checkedIn}</span>
                          <span className="text-white/30">/</span>
                          <span className="text-white/50">{grade.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Check-ins Tab */}
                {activeTab === 'checkins' && (
                  <div className="space-y-3">
                    {reportData?.recentCheckins.slice(0, 5).map((checkin, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex-1 min-w-0">
                          <div className="text-white/90 text-sm truncate">{checkin.fullName}</div>
                          <div className="text-white/40 text-xs">Grade {checkin.grade}</div>
                        </div>
                        <span className="text-[#22c55e] text-sm font-medium">{formatTime(checkin.checkinTime)}</span>
                      </div>
                    ))}
                    {(!reportData?.recentCheckins || reportData.recentCheckins.length === 0) && (
                      <div className="text-white/30 text-center py-4 text-sm">No check-ins yet</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification - Material Design */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 bg-[#22c55e] text-white rounded-2xl text-lg shadow-[0_8px_32px_rgba(34,197,94,0.4)] z-50 animate-[slideUp_0.3s_ease]">
          <div className="flex items-center gap-3">
            <Check size={20} />
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}
