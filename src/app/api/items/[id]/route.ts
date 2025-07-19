
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const itemDoc = await getDoc(doc(db, 'items', id));
    if (!itemDoc.exists()) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ id: itemDoc.id, ...itemDoc.data() });
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteDoc(doc(db, 'items', id));
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting item ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
