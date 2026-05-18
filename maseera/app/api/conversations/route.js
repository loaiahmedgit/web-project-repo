import { NextResponse } from 'next/server';
import { getConversationList } from '../../../lib/repository/messageRepository.js';

export async function GET(request) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }
    const partners = await getConversationList(userId);
    return NextResponse.json(partners, { status: 200 });
  } catch (error) {
    console.error('[GET /api/conversations]', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
