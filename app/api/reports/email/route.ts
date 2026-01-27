import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Resend API key is not configured in .env' }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    const { reportData, email, pdfAttachment, filename } = await request.json()

    if (!reportData || !email) {
      return NextResponse.json({ error: 'Missing report data or email' }, { status: 400 })
    }

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Create a premium HTML summary of the report
    const html = `
      <div style="background-color: #000; color: #fff; font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #d4af37; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d4af37; font-size: 32px; letter-spacing: 2px; margin: 0; text-transform: uppercase; font-weight: 300;">MABDC Gala Night</h1>
          <div style="width: 100px; height: 1px; background: linear-gradient(to right, transparent, #d4af37, transparent); margin: 15px auto;"></div>
          <p style="color: #a0a0a0; font-size: 14px; letter-spacing: 3px; margin: 0; text-transform: uppercase;">Attendance Report</p>
        </div>

        <div style="background: rgba(255,255,255,0.05); padding: 30px; border-radius: 12px; margin-bottom: 30px; border: 1px solid rgba(212,175,55,0.2); text-align: center;">
          <p style="color: #d4af37; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Recorded on</p>
          <p style="color: #fff; font-size: 20px; margin: 0;">${today}</p>
          
          <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 25px;">
            <div style="display: inline-block; margin: 0 20px;">
              <p style="color: #d4af37; font-size: 36px; font-weight: bold; margin: 0;">${reportData.summary.total}</p>
              <p style="color: #a0a0a0; font-size: 11px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Checked In</p>
            </div>
            <div style="display: inline-block; margin: 0 20px;">
              <p style="color: #fff; font-size: 36px; font-weight: bold; margin: 0;">${reportData.summary.totalStudents}</p>
              <p style="color: #a0a0a0; font-size: 11px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Total Guests</p>
            </div>
          </div>
        </div>

        <h3 style="color: #d4af37; border-bottom: 1px solid rgba(212,175,55,0.3); padding-bottom: 10px; margin-bottom: 20px; font-weight: normal; letter-spacing: 1px;">Grade Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; color: #a0a0a0; font-size: 11px;">
              <th style="padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.1); text-transform: uppercase; letter-spacing: 1px;">Grade</th>
              <th style="padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.1); text-transform: uppercase; letter-spacing: 1px; text-align: center;">Status</th>
              <th style="padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.1); text-transform: uppercase; letter-spacing: 1px; text-align: right;">Capacity</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.gradeData.map((g: any) => `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 15px 10px; color: #fff; font-weight: bold;">Grade ${g.grade}</td>
                <td style="padding: 15px 10px; color: #22c55e; font-weight: bold; text-align: center;">${g.checkedIn}</td>
                <td style="padding: 15px 10px; color: #a0a0a0; text-align: right;">${g.total} students</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 40px; text-align: center;">
          <div style="padding: 20px; border: 1px dashed rgba(212,175,55,0.3); border-radius: 8px;">
            <p style="color: #d4af37; font-size: 24px; margin: 0; font-weight: bold;">${Math.round((reportData.summary.total / reportData.summary.totalStudents) * 100)}%</p>
            <p style="color: #a0a0a0; font-size: 11px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Overall Attendance Rate</p>
          </div>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #555; text-align: center; letter-spacing: 1px; text-transform: uppercase;">
          Confidential Report • MABDC Gala Attendance System
        </div>
      </div>
    `

    const fromEmail = process.env.SMTP_FROM_EMAIL || "onboarding@resend.dev";

    const { data, error } = await resend.emails.send({
      from: `MABDC Gala <${fromEmail}>`,
      to: [email],
      subject: `Attendance Report - ${today}`,
      html: html,
      attachments: pdfAttachment ? [
        {
          filename: filename || 'Attendance_Report.pdf',
          content: pdfAttachment,
        }
      ] : undefined
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Email sent successfully', id: data?.id })
  } catch (err: any) {
    console.error('Email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
