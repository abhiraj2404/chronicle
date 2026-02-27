import { uploadToCloudinary } from '@/services/cloudinary'
import { Buffer } from 'buffer'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided in request' },
                { status: 400 }
            )
        }

        // Convert the File object to a Node.js Buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Delegate the upload to the dedicated Cloudinary service
        const result = await uploadToCloudinary(buffer)

        return NextResponse.json({ secure_url: result.secure_url }, { status: 200 })
    } catch (error: any) {
        console.error('Error in /api/upload route:', error)
        return NextResponse.json(
            { error: 'Failed to process media upload' },
            { status: 500 }
        )
    }
}
