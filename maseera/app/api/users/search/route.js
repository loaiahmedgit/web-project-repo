import { NextResponse } from 'next/server';
import { searchUsers } from '@/lib/repository';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    if (!q || q.length < 1) return NextResponse.json([]);
    const users = await searchUsers(q);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}