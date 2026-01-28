import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check if DATABASE_URL is present
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured in environment variables')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Use ISO string for consistent date comparison in PostgreSQL via Prisma
    const todayStr = today.toISOString().split('T')[0]

    // Get total count
    const totalCheckedIn = await prisma.attendance.count({
      where: { eventDate: new Date(todayStr) }
    }).catch(e => {
      console.error('Database query failed (attendance.count):', e.message)
      return 0
    })

    const totalStudents = await prisma.student.count().catch(e => {
      console.error('Database query failed (student.count):', e.message)
      return 0
    })

    // Get checked-in students by grade
    const gradeData = []
    for (let grade = 7; grade <= 12; grade++) {
      const students = await prisma.student.findMany({
        where: {
          grade,
          attendance: {
            some: {
              eventDate: new Date(todayStr)
            }
          }
        },
        include: {
          attendance: {
            where: {
              eventDate: new Date(todayStr)
            }
          }
        },
        orderBy: {
          fullName: 'asc'
        }
      }).catch(e => {
        console.error(`Database query failed (student.findMany for grade ${grade}):`, e.message)
        return []
      })

      const gradeTotal = await prisma.student.count({
        where: { grade }
      }).catch(e => {
        console.error(`Database query failed (student.count for grade ${grade}):`, e.message)
        return 0
      })

      gradeData.push({
        grade,
        total: gradeTotal,
        checkedIn: students.length,
        students: students.map((s: any) => ({
          id: s.id,
          fullName: s.fullName,
          avatarUrl: s.avatarUrl,
          checkinTime: s.attendance[0]?.checkinTime
        }))
      })
    }

    // Get recent check-ins
    const recentCheckins = await prisma.attendance.findMany({
      where: { eventDate: new Date(todayStr) },
      include: {
        student: true
      },
      orderBy: {
        checkinTime: 'desc'
      },
      take: 10
    }).catch(e => {
      console.error('Database query failed (attendance.findMany recent):', e.message)
      return []
    })

    return NextResponse.json({
      summary: {
        total: totalCheckedIn,
        totalStudents,
        gradeTotals: []
      },
      gradeData,
      recentCheckins: recentCheckins.map((r: any) => ({
        fullName: r.student?.fullName || 'Unknown Student',
        grade: r.student?.grade || 0,
        avatarUrl: r.student?.avatarUrl || null,
        checkinTime: r.checkinTime
      }))
    })
  } catch (error: any) {
    console.error('CRITICAL REPORTS ERROR:', error.message, error.stack)
    // Always return a valid structure even on error to prevent UI crashes, 
    // though the UI now has optional chaining anyway.
    return NextResponse.json({
      error: 'Failed to fetch reports',
      details: error.message,
      summary: { total: 0, totalStudents: 0, gradeTotals: [] },
      gradeData: [],
      recentCheckins: []
    }, { status: 500 })
  }
}
