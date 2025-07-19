import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { adminNotes, approvedBy } = await request.json();
    await updateDoc(doc(db, 'items', id), {
      approvalStatus: 'approved',
      isActive: true,
      adminNotes: adminNotes || null,
      approvedAt: Timestamp.now(),
      approvedBy: approvedBy || null,
      updatedAt: Timestamp.now(),
    });
    return NextResponse.json({ message: 'Item approved' });
  } catch (error) {
    console.error(`Error approving item ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to approve item', details: errorMessage }, { status: 500 });
  }
}
