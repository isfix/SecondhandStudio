
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
    let query = supabase.from('items').select('*');
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters.size && filters.size !== 'all') {
      query = query.eq('size', filters.size);
    }
    if (filters.condition && filters.condition !== 'all') {
      query = query.eq('condition', filters.condition);
    }
    if (filters.sellerId) {
      query = query.eq('seller_id', filters.sellerId);
    }
    if (filters.approvalStatus) {
      query = query.eq('approval_status', filters.approvalStatus);
    } else {
      query = query.eq('approval_status', 'approved');
    }
    if (filters.itemIds && filters.itemIds.length > 0) {
      query = query.in('id', filters.itemIds);
    }
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching items:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch items', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: No user' }, { status: 401 });
    }
    const body = await request.json();
    // Remove seller_id from the body to prevent spoofing
    const { seller_id, ...itemData } = body;
    const newItem = {
      ...itemData,
      seller_id: user.id,
      images: itemData.images || [],
      approval_status: 'pending',
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('items').insert([newItem]).select().single();
    if (error) throw error;
    return NextResponse.json({ ...data }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : null;
    return NextResponse.json({ error: 'Failed to create item', details: errorMessage, stack: errorStack }, { status: 500 });
  }
}
