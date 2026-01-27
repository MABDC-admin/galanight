import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (query.length < 1) {
      return NextResponse.json([])
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const students = await prisma.student.findMany({
      where: {
        fullName: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        attendance: {
          where: {
            eventDate: today
          }
        }
      },
      orderBy: [
        { grade: 'asc' },
        { fullName: 'asc' }
      ]
    })

    const results = students.map((student: any) => ({
      id: student.id,
      fullName: student.fullName,
      grade: student.grade,
      avatarUrl: student.avatarUrl,
      checked: student.attendance.length > 0 ? student.attendance[0].checkinTime : null
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
