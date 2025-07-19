import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { adminNotes, approvedBy } = await request.json();
    if (!adminNotes) {
      return NextResponse.json({ error: 'Admin notes are required for rejection' }, { status: 400 });
    }
    await updateDoc(doc(db, 'items', id), {
      approvalStatus: 'rejected',
      isActive: false,
      adminNotes: adminNotes,
      approvedAt: Timestamp.now(),
      approvedBy: approvedBy || null,
      updatedAt: Timestamp.now(),
    });
    return NextResponse.json({ message: 'Item rejected' });
  } catch (error) {
    console.error(`Error rejecting item ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to reject item', details: errorMessage }, { status: 500 });
  }
}
