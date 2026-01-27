import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token
    try {
      const payload = JSON.parse(atob(token))
      if (!payload.admin || payload.exp < Date.now()) {
        throw new Error('Invalid token')
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const totalStudents = await prisma.student.count()
    const checkedInStudents = await prisma.attendance.count({
      where: { eventDate: today }
    })

    const gradeStats = []
    for (let grade = 7; grade <= 12; grade++) {
      const total = await prisma.student.count({ where: { grade } })
      const checkedIn = await prisma.student.count({
        where: {
          grade,
          attendance: {
            some: { eventDate: today }
          }
        }
      })
      gradeStats.push({ grade, checkedIn, total })
    }

    return NextResponse.json({
      totalCheckedIn: checkedInStudents,
      totalStudents,
      gradeData: gradeStats
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}