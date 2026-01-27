'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'

interface ReportData {
  summary: {
    total: number
    totalStudents: number
    gradeTotals: Array<{ grade: number; count: number }>
  }
  gradeData: Array<{
    grade: number
    total: number
    checkedIn: number
    students: Array<{
      id: number
      fullName: string
      checkinTime: Date
    }>
  }>
  recentCheckins: Array<{
    fullName: string
    grade: number
    checkinTime: Date
  }>
}

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
    const interval = setInterval(fetchReports, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1d3a] to-[#0f1428] flex items-center justify-center">
        <div className="text-2xl text-[#d4af37] animate-pulse">Loading reports...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1d3a] to-[#0f1428] flex items-center justify-center">
        <div className="text-2xl text-[#e8e8e8]">Failed to load reports</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1d3a] to-[#0f1428]">
      {/* Header */}
      <header className="bg-gradient-to-b from-[#0d1129] to-[#1a1f3d] border-b-4 border-[#d4af37] shadow-[0_4px_20px_rgba(212,175,55,0.3)]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl md:text-5xl font-light text-[#d4af37] tracking-wider text-center mb-2" style={{ fontFamily: 'Georgia, serif', textShadow: '0 0 20px rgba(212,175,55,0.5)' }}>
            📊 JS Prom Night Reports
          </h1>
          <p className="text-[#c0c0c0] text-lg italic tracking-wide text-center">Attendance Overview</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-[rgba(192,192,192,0.2)] text-[#c0c0c0] rounded-xl text-lg border border-[rgba(192,192,192,0.3)] hover:bg-[rgba(212,175,55,0.2)] hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
        >
          <ArrowLeft size={20} />
          Back to Check-In
        </Link>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {/* Grand Total */}
          <div className="md:col-span-3 lg:col-span-1 bg-gradient-to-br from-[rgba(26,31,61,0.95)] to-[rgba(13,17,41,0.95)] p-6 rounded-2xl border-2 border-[#d4af37] text-center shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <div className="text-6xl font-bold text-[#d4af37] mb-2" style={{ textShadow: '0 0 10px rgba(212,175,55,0.5)' }}>
              {data.summary.total}
            </div>
            <div className="text-xl text-[#c0c0c0] italic mb-1">Total Checked In</div>
            <div className="text-sm text-[#7a7a7a]">out of {data.summary.totalStudents}</div>
          </div>

          {/* Grade Totals */}
          {data.gradeData.map((grade) => (
            <div key={grade.grade} className="bg-gradient-to-br from-[rgba(26,31,61,0.95)] to-[rgba(13,17,41,0.95)] p-6 rounded-2xl border border-[rgba(212,175,55,0.3)] text-center shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
              <div className="text-5xl font-bold text-[#d4af37] mb-2">{grade.checkedIn}</div>
              <div className="text-lg text-[#c0c0c0] italic">Grade {grade.grade}</div>
              <div className="text-sm text-[#7a7a7a]">of {grade.total}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Grade Sections */}
          <div className="lg:col-span-2 space-y-8">
            {data.gradeData.filter(g => g.checkedIn > 0).map((grade) => (
              <div key={grade.grade} className="bg-gradient-to-br from-[rgba(26,31,61,0.95)] to-[rgba(13,17,41,0.95)] p-7 rounded-2xl border border-[rgba(212,175,55,0.25)] shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-[rgba(212,175,55,0.3)]">
                  <h3 className="text-3xl text-[#d4af37] font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                    Grade {grade.grade}
                  </h3>
                  <div className="px-6 py-2 bg-[rgba(212,175,55,0.2)] text-[#c0c0c0] rounded-full text-lg border border-[rgba(212,175,55,0.4)]">
                    {grade.checkedIn} student{grade.checkedIn !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="space-y-3">
                  {grade.students.map((student) => (
                    <div key={student.id} className="flex justify-between items-center p-4 bg-[rgba(13,17,41,0.7)] rounded-xl border border-[rgba(192,192,192,0.15)] hover:bg-[rgba(26,31,61,0.8)] hover:border-[rgba(212,175,55,0.3)] transition-all">
                      <div className="text-xl text-[#e8e8e8]">{student.fullName}</div>
                      <div className="text-lg text-[#4ade80] italic">{formatTime(student.checkinTime)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {data.summary.total === 0 && (
              <div className="text-center py-16 text-[#7a7a7a] text-2xl italic">
                No students have checked in yet
              </div>
            )}
          </div>

          {/* Recent Check-ins Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[rgba(26,31,61,0.95)] to-[rgba(13,17,41,0.95)] p-6 rounded-2xl border border-[rgba(212,175,55,0.3)] shadow-[0_4px_16px_rgba(0,0,0,0.3)] sticky top-6">
              <h3 className="text-2xl text-[#d4af37] font-medium mb-5 pb-3 border-b-2 border-[rgba(212,175,55,0.3)]" style={{ fontFamily: 'Georgia, serif' }}>
                Recent Check-Ins
              </h3>

              <div className="space-y-3">
                {data.recentCheckins.length === 0 ? (
                  <div className="text-center py-8 text-[#7a7a7a] italic">No check-ins yet</div>
                ) : (
                  data.recentCheckins.map((checkin, index) => (
                    <div key={index} className="p-4 bg-[rgba(13,17,41,0.7)] rounded-xl border border-[rgba(192,192,192,0.15)]">
                      <div className="text-lg text-[#e8e8e8] mb-1">{checkin.fullName}</div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#d4af37]">Grade {checkin.grade}</span>
                        <span className="text-[#4ade80] flex items-center gap-1">
                          <Clock size={14} />
                          {formatTime(checkin.checkinTime)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
