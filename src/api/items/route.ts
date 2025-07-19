
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters: any = {};
  searchParams.forEach((value, key) => {
    if (key === 'itemIds') {
      filters[key] = searchParams.getAll('itemIds');
    } else if (filters[key]) {
      if (Array.isArray(filters[key])) {
        filters[key].push(value);
      } else {
        filters[key] = [filters[key], value];
      }
    } else {
      filters[key] = value;
    }
  });

  try {
    let q = collection(db, 'items');
    // Add Firestore query filters as needed
    // Example: if (filters.category) q = query(q, where('category', '==', filters.category));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Add validation as needed
    const newItem = {
      ...body,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      approvalStatus: 'pending',
      isActive: true,
    };
    const docRef = await addDoc(collection(db, 'items'), newItem);
    return NextResponse.json({ id: docRef.id, ...newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
