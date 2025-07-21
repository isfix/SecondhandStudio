import { NextResponse, type NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { adminNotes, approvedBy } = await request.json();
    const { error } = await supabase
      .from('items')
      .update({
        approval_status: 'approved',
        is_active: true,
        admin_notes: adminNotes || null,
        approved_at: new Date().toISOString(),
        approved_by: approvedBy || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ message: 'Item approved' });
  } catch (error) {
    console.error(`Error approving item ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to approve item', details: errorMessage }, { status: 500 });
  }
}
