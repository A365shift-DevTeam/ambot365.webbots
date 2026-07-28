import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    const filename = `${Date.now()}-${sanitizedName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Try Supabase Storage if configured
    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
      try {
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(filename, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          });

        if (!error && data) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('uploads').getPublicUrl(filename);

          return NextResponse.json({ success: true, url: publicUrl });
        }
      } catch (err) {
        console.warn('Supabase storage upload notice:', err);
      }
    }

    // 2. Fallback: Save to local public/uploads directory on disk
    try {
      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }
      const filePath = path.join(publicUploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    } catch {
      // 3. Fallback: Base64 data URL
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
      return NextResponse.json({ success: true, url: base64 });
    }
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}
