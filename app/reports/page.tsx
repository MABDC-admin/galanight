'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Clock, Download, User, Mail } from 'lucide-react'
import Link from 'next/link'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
      avatarUrl: string | null
      checkinTime: Date
    }>
  }>
  recentCheckins: Array<{
    fullName: string
    grade: number
    avatarUrl: string | null
    checkinTime: Date
  }>
}

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailLoading, setEmailLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Set isClient to true on mount to ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    fetchReports()
    const interval = setInterval(fetchReports, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchReports = async () => {
    try {
      const key = new URLSearchParams(window.location.search).get('key')
      const response = await fetch(`/api/reports${key ? `?key=${key}` : ''}`)
      const result = await response.json()

      if (response.ok && !result.error) {
        setData(result)
      } else {
        console.error('Report error:', result.error || 'Unknown error')
        setData(null)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const formatFullDateTime = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const generatePDF = () => {
    if (!data) return null

    const doc = new jsPDF()
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Title
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text('MABDC Gala Night Attendance Report', 105, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(today, 105, 28, { align: 'center' })

    // Summary
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    doc.text(`Total Checked In: ${data?.summary?.total ?? 0} / ${data?.summary?.totalStudents ?? 0}`, 14, 42)

    // Grade summary line
    let summaryY = 50
    doc.setFontSize(10)
    const gradeSummary = (data?.gradeData ?? [])
      .map(g => `G${g.grade}: ${g.checkedIn}/${g.total}`)
      .join('   |   ')
    doc.text(gradeSummary, 14, summaryY)

    let currentY = 60

      // For each grade with checked-in students
      (data?.gradeData ?? []).filter(g => g.checkedIn > 0).forEach((grade) => {
        // Check if we need a new page
        if (currentY > 250) {
          doc.addPage()
          currentY = 20
        }

        // Grade header
        doc.setFontSize(12)
        doc.setTextColor(40, 40, 40)
        doc.text(`Grade ${grade.grade} (${grade.checkedIn} checked in)`, 14, currentY)
        currentY += 6

        // Table for this grade
        const tableData = grade.students.map((student, index) => [
          (index + 1).toString(),
          student.fullName,
          formatFullDateTime(student.checkinTime)
        ])

        autoTable(doc, {
          startY: currentY,
          head: [['#', 'Student Name', 'Check-in Time']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 90 },
            2: { cellWidth: 60 }
          },
          margin: { left: 14, right: 14 }
        })

        currentY = (doc as any).lastAutoTable.finalY + 10
      })

    // Footer with generation time
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        105,
        290,
        { align: 'center' }
      )
    }

    return doc
  }

  const exportToPDF = () => {
    const doc = generatePDF()
    if (!doc) return
    doc.save(`MABDC_Gala_Attendance_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const sendToEmail = async () => {
    const doc = generatePDF()
    if (!doc) return

    setEmailLoading(true)
    try {
      // Convert PDF to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1]

      const key = new URLSearchParams(window.location.search).get('key')
      const response = await fetch(`/api/reports/email${key ? `?key=${key}` : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportData: data,
          email: 'sottodennis@gmail.com',
          pdfAttachment: pdfBase64,
          filename: `MABDC_Gala_Attendance_${new Date().toISOString().split('T')[0]}.pdf`
        })
      })

      const result = await response.json()
      if (response.ok) {
        showToast('Report sent to email successfully!', 'success')
      } else {
        showToast(result.error || 'Failed to send email', 'error')
      }
    } catch (error) {
      showToast('Error sending email', 'error')
    } finally {
      setEmailLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: '#000' }}>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md scale-110" style={{ backgroundImage: 'url(/bg.png)' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="text-2xl text-[#d4af37] animate-pulse">Loading reports...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: '#000' }}>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md scale-110" style={{ backgroundImage: 'url(/bg.png)' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="text-2xl text-white/80">Failed to load reports</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000' }}>
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md scale-110" style={{ backgroundImage: 'url(/bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />

      {/* Shimmer Overlay */}
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
      <div className="glow-orb" style={{ width: '150px', height: '150px', bottom: '20%', left: '30%', animationDelay: '4s' }} />

      {/* Header */}
      <header className="relative z-10 pt-8 pb-6">
        <h1 className="text-5xl md:text-6xl text-center text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f4e4bc] to-[#d4af37] tracking-wider font-light animate-reveal-up animate-title-shimmer" style={{ fontFamily: 'Georgia, serif', filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4))' }}>
          Reports Dashboard
        </h1>
        <p className="text-center text-[#a0a0a0] text-lg mt-2 tracking-widest uppercase">Attendance Overview</p>
        <div className="w-64 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-4"></div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-6 py-3 backdrop-blur-xl bg-white/5 text-white/80 rounded-2xl text-lg border border-white/10 hover:bg-white/10 hover:border-[#d4af37]/30 hover:text-[#d4af37] transition-all duration-300"
          >
            <ArrowLeft size={20} />
            Back to Check-In
          </Link>

          <button
            onClick={exportToPDF}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-black rounded-2xl text-lg font-semibold shadow-[0_4px_24px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_32px_rgba(212,175,55,0.5)] hover:scale-105 transition-all duration-300"
          >
            <Download size={20} />
            Download PDF
          </button>

          <button
            onClick={sendToEmail}
            disabled={emailLoading}
            className={`group inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-300 ${emailLoading
              ? 'bg-white/10 text-white/40 cursor-wait'
              : 'bg-white/10 text-white hover:bg-white/20 hover:border-[#d4af37]/30 border border-white/10'
              }`}
          >
            <Mail size={20} className={emailLoading ? 'animate-pulse' : ''} />
            {emailLoading ? 'Sending...' : 'Send to Email'}
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl text-lg shadow-lg z-50 transition-all animate-reveal-up ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white`}>
            {toast.message}
          </div>
        )}

        {/* Summary Cards - Hero Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {/* Grand Total - Featured Card */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 via-transparent to-[#d4af37]/10"></div>
            <div className="relative backdrop-blur-xl bg-black/40 border-2 border-[#d4af37]/50 rounded-2xl p-6 text-center h-full flex flex-col justify-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f4e4bc] to-[#d4af37]" style={{ filter: 'drop-shadow(0 0 15px rgba(212,175,55,0.3))' }}>
                {data?.summary?.total ?? 0}
              </div>
              <div className="text-sm text-white/50 mt-1">of {data?.summary?.totalStudents ?? 0}</div>
              <div className="text-xs text-[#d4af37] uppercase tracking-widest mt-2">Total</div>
            </div>
          </div>

          {/* Grade Totals */}
          {(data?.gradeData ?? []).map((grade) => (
            <div key={grade.grade} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4af37]/20 to-[#f4e4bc]/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-300"></div>
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 group-hover:border-[#d4af37]/30 rounded-2xl p-4 text-center transition-all duration-300">
                <div className="text-3xl font-bold text-[#d4af37]">{grade?.checkedIn ?? 0}</div>
                <div className="text-xs text-white/40 mt-1">of {grade?.total ?? 0}</div>
                <div className="text-sm text-white/70 mt-2">Grade {grade?.grade}</div>
                {/* Mini progress */}
                <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e4bc] rounded-full transition-all duration-500"
                    style={{ width: `${(grade?.total ?? 0) > 0 ? ((grade?.checkedIn ?? 0) / (grade?.total ?? 1)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grade Sections with Students */}
        <div className="space-y-6">
          {(data?.gradeData ?? []).filter(g => g.checkedIn > 0).map((grade) => (
            <div key={grade.grade} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4af37]/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                {/* Grade Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#c5a028] flex items-center justify-center text-black text-xl font-bold">
                      {grade?.grade}
                    </div>
                    <div>
                      <h3 className="text-2xl text-white font-medium">Grade {grade?.grade}</h3>
                      <p className="text-white/40 text-sm">Students checked in</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#d4af37]">{grade?.checkedIn ?? 0}</div>
                      <div className="text-white/40 text-sm">of {grade?.total ?? 0}</div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                        <circle
                          cx="32" cy="32" r="28" fill="none" stroke="#d4af37" strokeWidth="4"
                          strokeDasharray={`${(grade?.total ?? 0) > 0 ? ((grade?.checkedIn ?? 0) / (grade?.total ?? 1)) * 176 : 0} 176`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-sm font-bold text-[#d4af37]">{Math.round((grade?.total ?? 0) > 0 ? ((grade?.checkedIn ?? 0) / (grade?.total ?? 1)) * 100 : 0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Students Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(grade?.students ?? []).map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:bg-white/5 hover:border-[#d4af37]/20 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden flex items-center justify-center bg-black/20 relative">
                            {/* Grey circle backdrop */}
                            <div className="absolute w-5 h-5 bg-[#333333] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

                            {student?.avatarUrl ? (
                              <img src={student.avatarUrl} alt={student.fullName} className="relative z-10 w-full h-full object-cover" />
                            ) : (
                              <div className="relative z-10 w-full h-full flex items-center justify-center text-white/30">
                                <span className="text-xs font-bold">{getInitials(student?.fullName ?? '??')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <span className="text-white/90 truncate block">{student?.fullName ?? 'Unknown'}</span>
                          <span className="text-white/30 text-[10px] flex items-center gap-1">
                            <Clock size={10} /> {student?.checkinTime ? formatTime(student.checkinTime) : '--:--'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 text-[#22c55e] text-sm font-medium">
                        <Clock size={14} />
                        {student?.checkinTime ? formatTime(student.checkinTime) : '--:--'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {(data?.summary?.total ?? 0) === 0 && (
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-16 text-center border border-white/10">
              <div className="text-white/30 text-2xl">No students have checked in yet</div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
