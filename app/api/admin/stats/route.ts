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
    const totalStudents = await prisma.student.count()
    const checkedInStudents = await prisma.student.count({
      where: { checked: { not: null } }
    })

    const gradeData = await prisma.student.groupBy({
      by: ['grade'],
      _count: { id: true },
      where: { checked: { not: null } }
    })

    const allGrades = await prisma.student.groupBy({
      by: ['grade'],
      _count: { id: true }
    })

    const gradeStats = allGrades.map((grade: any) => ({
      grade: grade.grade,
      checkedIn: gradeData.find((g: any) => g.grade === grade.grade)?._count.id || 0,
      total: grade._count.id
    }))

    return NextResponse.json({
      totalCheckedIn: checkedInStudents,
      totalStudents,
      gradeData: gradeStats.sort((a: any, b: any) => a.grade - b.grade)
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}