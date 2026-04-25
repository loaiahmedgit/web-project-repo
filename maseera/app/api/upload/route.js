import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'media', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const ext      = (file.name.split('.').pop() || 'bin').toLowerCase();
    const filename = Date.now() + '_' + Math.random().toString(36).slice(2) + '.' + ext;
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ mediaPath: '/media/uploads/' + filename }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/upload]', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
