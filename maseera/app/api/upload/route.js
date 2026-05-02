import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext      = (file.name.split('.').pop() || 'bin').toLowerCase();
    const filename = Date.now() + '_' + Math.random().toString(36).slice(2) + '.' + ext;

    const blob = await put('uploads/' + filename, file, { access: 'public' });

    return NextResponse.json({ mediaPath: blob.url }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/upload]', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
