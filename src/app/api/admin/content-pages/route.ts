import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// GET: List all content pages
export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'content-pages'));
    const pages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content pages' }, { status: 500 });
  }
}

// POST: Create a new content page
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const docRef = await addDoc(collection(db, 'content-pages'), {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create content page' }, { status: 500 });
  }
} 