import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
    try {
        console.log('Upload request received');
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.split(' ')[1]

        if (!token) {
            console.log('No token provided');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify token
        try {
            console.log('Verifying token...');
            const payload = JSON.parse(Buffer.from(token, 'base64').toString());
            if (!payload.admin || payload.exp < Date.now()) {
                throw new Error('Invalid token')
            }
            console.log('Token verified');
        } catch (e: any) {
            console.log('Token verification failed:', e.message);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const studentId = formData.get('studentId') as string

        if (!file || !studentId) {
            console.log('Missing file or studentId');
            return NextResponse.json({ error: 'Missing file or student ID' }, { status: 400 })
        }

        console.log(`Processing upload for student ${studentId}: ${file.name}`);
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const extension = file.name.split('.').pop()
        const filename = `${studentId}_${Date.now()}.${extension}`
        const storageDir = join(process.cwd(), 'public', 'avatars')
        const path = join(storageDir, filename)

        // Ensure directory exists
        console.log(`Ensuring directory exists: ${storageDir}`);
        await mkdir(storageDir, { recursive: true })

        console.log(`Writing file to: ${path}`);
        await writeFile(path, buffer)
        const avatarUrl = `/avatars/${filename}`

        console.log(`Updating database for student ${studentId}...`);
        await prisma.student.update({
            where: { id: parseInt(studentId) },
            data: { avatarUrl }
        })

        console.log('Upload successful');
        return NextResponse.json({ message: 'Avatar uploaded successfully', avatarUrl })
    } catch (error: any) {
        console.error('Upload error detail:', error)
        return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
    }
}
