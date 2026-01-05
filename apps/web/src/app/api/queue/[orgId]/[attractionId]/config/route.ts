import { NextRequest, NextResponse } from 'next/server';
import { createQueueConfig, updateQueueConfig } from '@/lib/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; attractionId: string }> }
) {
  try {
    const { orgId, attractionId } = await params;
    const body = await request.json();

    const result = await createQueueConfig(orgId, attractionId, {
      name: body.name,
      isActive: body.isActive,
      capacityPerBatch: body.capacityPerBatch,
      batchIntervalMinutes: body.batchIntervalMinutes,
      maxWaitMinutes: body.maxWaitMinutes,
      maxQueueSize: body.maxQueueSize,
      allowRejoin: body.allowRejoin,
      requireCheckIn: body.requireCheckIn,
      notificationLeadMinutes: body.notificationLeadMinutes,
      expiryMinutes: body.expiryMinutes,
    });

    if (result.error) {
      return NextResponse.json(
        { message: result.error.message || 'Failed to create queue config' },
        { status: result.error.statusCode || 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Queue config POST error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; attractionId: string }> }
) {
  try {
    const { orgId, attractionId } = await params;
    const body = await request.json();

    const result = await updateQueueConfig(orgId, attractionId, {
      name: body.name,
      isActive: body.isActive,
      isPaused: body.isPaused,
      capacityPerBatch: body.capacityPerBatch,
      batchIntervalMinutes: body.batchIntervalMinutes,
      maxWaitMinutes: body.maxWaitMinutes,
      maxQueueSize: body.maxQueueSize,
      allowRejoin: body.allowRejoin,
      requireCheckIn: body.requireCheckIn,
      notificationLeadMinutes: body.notificationLeadMinutes,
      expiryMinutes: body.expiryMinutes,
    });

    if (result.error) {
      return NextResponse.json(
        { message: result.error.message || 'Failed to update queue config' },
        { status: result.error.statusCode || 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Queue config PATCH error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
