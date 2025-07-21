
import { NextResponse, type NextRequest } from 'next/server';
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
    let q = supabase.from('items');
    // Add Firestore query filters as needed
    // Example: if (filters.category) q = query(q, where('category', '==', filters.category));
    const { data, error } = await q.select('*');
    if (error) throw error;
    return NextResponse.json(data);
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvalStatus: 'pending',
      isActive: true,
    };
    const { data, error } = await supabase.from('items').insert([newItem]).select();
    if (error) throw error;
    return NextResponse.json({ id: data[0].id, ...newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
