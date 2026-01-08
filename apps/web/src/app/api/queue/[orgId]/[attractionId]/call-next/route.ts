import { type NextRequest, NextResponse } from 'next/server';
import { callNextBatch } from '@/lib/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; attractionId: string }> }
) {
  try {
    const { orgId, attractionId } = await params;
    const body = await request.json();

    const result = await callNextBatch(orgId, attractionId, body.count);

    if (result.error) {
      return NextResponse.json(
        { message: result.error.message || 'Failed to call next batch' },
        { status: result.error.statusCode || 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (_error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
