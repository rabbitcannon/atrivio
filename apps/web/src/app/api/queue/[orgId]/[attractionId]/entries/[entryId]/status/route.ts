import { type NextRequest, NextResponse } from 'next/server';
import { updateQueueEntryStatus } from '@/lib/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; attractionId: string; entryId: string }> }
) {
  try {
    const { orgId, attractionId, entryId } = await params;
    const body = await request.json();

    const result = await updateQueueEntryStatus(
      orgId,
      attractionId,
      entryId,
      body.status,
      body.notes
    );

    if (result.error) {
      return NextResponse.json(
        { message: result.error.message || 'Failed to update entry status' },
        { status: result.error.statusCode || 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (_error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
