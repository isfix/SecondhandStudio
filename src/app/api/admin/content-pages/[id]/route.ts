import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// GET: Get a single content page by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const pageDoc = await getDoc(doc(db, 'content-pages', id));
    if (!pageDoc.exists()) {
      return NextResponse.json({ error: 'Content page not found' }, { status: 404 });
    }
    return NextResponse.json({ id: pageDoc.id, ...pageDoc.data() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content page' }, { status: 500 });
  }
}

// PATCH: Update a content page by ID
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await request.json();
    await updateDoc(doc(db, 'content-pages', id), {
      ...data,
      updatedAt: Date.now(),
    });
    return NextResponse.json({ message: 'Content page updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update content page' }, { status: 500 });
  }
}

// DELETE: Delete a content page by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteDoc(doc(db, 'content-pages', id));
    return NextResponse.json({ message: 'Content page deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete content page' }, { status: 500 });
  }
} 