import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
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

    // Reset all attendance records for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.attendance.deleteMany({
      where: { eventDate: today }
    })

    return NextResponse.json({ message: 'All attendance records have been reset' })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json(
      { error: 'Reset failed' },
      { status: 500 }
    )
  }
}