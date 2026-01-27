import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get total count
    const totalCheckedIn = await prisma.attendance.count({
      where: { eventDate: today }
    })

    const totalStudents = await prisma.student.count()

    // Get per-grade totals
    const gradeTotals = await prisma.$queryRaw<Array<{ grade: number; count: bigint }>>`
      SELECT s.grade, COUNT(a.id)::int as count
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id AND a.event_date = ${today}::date
      WHERE a.id IS NOT NULL
      GROUP BY s.grade
      ORDER BY s.grade
    `

    // Get checked-in students by grade
    const gradeData = []
    for (let grade = 7; grade <= 12; grade++) {
      const students = await prisma.student.findMany({
        where: {
          grade,
          attendance: {
            some: {
              eventDate: today
            }
          }
        },
        include: {
          attendance: {
            where: {
              eventDate: today
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
        students: students.map(s => ({
          id: s.id,
          fullName: s.fullName,
          checkinTime: s.attendance[0]?.checkinTime
        }))
      })
    }

    // Get recent check-ins
    const recentCheckins = await prisma.attendance.findMany({
      where: { eventDate: today },
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
        gradeTotals: gradeTotals.map(g => ({ 
          grade: g.grade, 
          count: Number(g.count) 
        }))
      },
      gradeData,
      recentCheckins: recentCheckins.map(r => ({
        fullName: r.student.fullName,
        grade: r.student.grade,
        checkinTime: r.checkinTime
      }))
    })
  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
