import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Use ISO string for consistent date comparison in PostgreSQL via Prisma
    const todayStr = today.toISOString().split('T')[0]

    // Get total count
    const totalCheckedIn = await prisma.attendance.count({
      where: { eventDate: new Date(todayStr) }
    })

    const totalStudents = await prisma.student.count()

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
      })

      const gradeTotal = await prisma.student.count({
        where: { grade }
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
    return NextResponse.json({
      error: 'Failed to fetch reports',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
