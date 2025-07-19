
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';

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
    let qFilters = [];
    if (filters.category && filters.category !== 'all') {
      qFilters.push(where('category', '==', filters.category));
    }
    if (filters.size && filters.size !== 'all') {
      qFilters.push(where('size', '==', filters.size));
    }
    if (filters.condition && filters.condition !== 'all') {
      qFilters.push(where('condition', '==', filters.condition));
    }
    if (filters.sellerId) {
      qFilters.push(where('sellerId', '==', filters.sellerId));
    }
    if (filters.approvalStatus) {
      qFilters.push(where('approvalStatus', '==', filters.approvalStatus));
    } else {
      qFilters.push(where('approvalStatus', '==', 'approved'));
    }
    // Add more filters as needed
    let itemsQuery = qFilters.length > 0 ? query(q, ...qFilters) : q;
    const snapshot = await getDocs(itemsQuery);
    const allItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(allItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch items', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Auth should be checked on the client; for advanced security, use Firebase Admin SDK in a server function
  try {
    const body = await request.json();
    // Add server-side validation as needed
    const newItem = {
      ...body,
      approvalStatus: 'pending',
      isActive: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, 'items'), newItem);
    return NextResponse.json({ id: docRef.id, ...newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create item', details: errorMessage }, { status: 500 });
  }
}
