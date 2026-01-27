import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await prisma.attendance.create({
      data: {
        eventDate: today,
        studentId: parseInt(id)
      }
    })

    return NextResponse.json({ message: 'Checked in successfully', attendance })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Already checked in' }, { status: 400 })
    }
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
  }
}
