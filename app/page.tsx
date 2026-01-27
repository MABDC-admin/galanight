'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, FileText } from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: number
  fullName: string
  grade: number
  checked: string | null
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

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

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchStudents(searchQuery)
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery, searchStudents])

  const handleCheckin = async (id: number, name: string) => {
    if (!confirm(`Check in ${name} for JS Prom Night?`)) return

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1d3a] to-[#0f1428]">
      {/* Header */}
      <header className="bg-gradient-to-b from-[#0d1129] to-[#1a1f3d] border-b-4 border-[#d4af37] shadow-[0_4px_20px_rgba(212,175,55,0.3)]">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <h1 className="text-4xl md:text-5xl font-light text-[#d4af37] tracking-wider mb-2" style={{ fontFamily: 'Georgia, serif', textShadow: '0 0 20px rgba(212,175,55,0.5)' }}>
            ✨ JS Prom Night Check-In ✨
          </h1>
          <p className="text-[#c0c0c0] text-lg italic tracking-wide">An Evening of Elegance & Excellence</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Search Control */}
        <div className="bg-[rgba(26,31,61,0.8)] p-6 rounded-2xl border border-[rgba(212,175,55,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]" size={24} />
            <input
              type="text"
              placeholder="Search by last name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xl px-14 py-4 bg-[rgba(13,17,41,0.9)] text-[#e8e8e8] border-2 border-[rgba(212,175,55,0.4)] rounded-xl focus:outline-none focus:border-[#d4af37] focus:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
              style={{ fontFamily: 'Georgia, serif' }}
            />
          </div>

          <div className="text-center">
            <Link 
              href="/reports"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#c0c0c0] to-[#e8e8e8] text-[#0d1129] rounded-xl text-lg font-bold shadow-[0_4px_16px_rgba(192,192,192,0.4)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.6)] hover:bg-gradient-to-r hover:from-[#d4af37] hover:to-[#f4d03f] transition-all"
            >
              <FileText size={20} />
              View Reports
            </Link>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-12 text-[#7a7a7a] text-xl italic">Searching...</div>
          )}

          {!loading && searchQuery.length < 1 && (
            <div className="text-center py-12 text-[#7a7a7a] text-xl italic">Type a last name to search for a student</div>
          )}

          {!loading && searchQuery.length >= 1 && students.length === 0 && (
            <div className="text-center py-12 text-[#7a7a7a] text-xl italic">No students found</div>
          )}

          {students.map((student) => (
            <div
              key={student.id}
              className="bg-gradient-to-r from-[rgba(26,31,61,0.95)] to-[rgba(13,17,41,0.95)] p-6 rounded-2xl border border-[rgba(212,175,55,0.25)] flex justify-between items-center shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:border-[rgba(212,175,55,0.5)] hover:shadow-[0_6px_24px_rgba(212,175,55,0.2)] hover:-translate-y-0.5 transition-all"
            >
              <div>
                <div className="text-2xl text-[#e8e8e8] mb-1 font-medium">{student.fullName}</div>
                <div className="text-lg text-[#d4af37] italic">Grade {student.grade}</div>
              </div>

              {student.checked ? (
                <div className="flex items-center gap-2 px-6 py-3 bg-[rgba(34,197,94,0.2)] text-[#4ade80] rounded-xl text-lg border border-[rgba(34,197,94,0.4)]">
                  ✓ Checked in at {formatTime(student.checked)}
                </div>
              ) : (
                <button
                  onClick={() => handleCheckin(student.id, student.fullName)}
                  className="px-8 py-3 text-xl font-bold bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white rounded-xl shadow-[0_4px_16px_rgba(34,197,94,0.4)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.6)] hover:-translate-y-0.5 transition-all"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Check In ✓
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 px-8 py-5 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white rounded-xl text-lg shadow-[0_8px_32px_rgba(34,197,94,0.5)] animate-[slideIn_0.3s_ease] z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
