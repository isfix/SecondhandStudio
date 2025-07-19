import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, deleteDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }
  try {
    const qWishlist = query(collection(db, 'wishlist'), where('userId', '==', userId));
    const snapshot = await getDocs(qWishlist);
    const userWishlist = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(userWishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch wishlist', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, itemId } = await request.json();
    if (!userId || !itemId) {
      return NextResponse.json({ error: 'userId and itemId are required' }, { status: 400 });
    }
    // Check if already in wishlist
    const qWishlist = query(collection(db, 'wishlist'), where('userId', '==', userId), where('itemId', '==', itemId));
    const snapshot = await getDocs(qWishlist);
    if (!snapshot.empty) {
      return NextResponse.json({ error: 'Item already in wishlist' }, { status: 409 });
    }
    const docRef = await addDoc(collection(db, 'wishlist'), { userId, itemId });
    return NextResponse.json({ id: docRef.id, userId, itemId }, { status: 201 });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to add to wishlist', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, itemId } = await request.json();
    if (!userId || !itemId) {
      return NextResponse.json({ error: 'userId and itemId are required' }, { status: 400 });
    }
    const qWishlist = query(collection(db, 'wishlist'), where('userId', '==', userId), where('itemId', '==', itemId));
    const snapshot = await getDocs(qWishlist);
    if (snapshot.empty) {
      return NextResponse.json({ error: 'Item not found in wishlist' }, { status: 404 });
    }
    await Promise.all(snapshot.docs.map(docSnap => deleteDoc(docSnap.ref)));
    return NextResponse.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to remove from wishlist', details: errorMessage }, { status: 500 });
  }
}
