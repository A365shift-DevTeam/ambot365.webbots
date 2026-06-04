import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: "Vercel Blob token is missing. Please add BLOB_READ_WRITE_TOKEN to your .env.local file." 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    const filename = `${Date.now()}-${sanitizedName}`;
    
    const blob = await put(`uploads/${filename}`, file, {
      access: 'public',
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
