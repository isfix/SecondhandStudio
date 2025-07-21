import { NextResponse, type NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { adminNotes, approvedBy } = await request.json();
    if (!adminNotes) {
      return NextResponse.json({ error: 'Admin notes are required for rejection' }, { status: 400 });
    }
    const { error } = await supabase
      .from('items')
      .update({
        approval_status: 'rejected',
        is_active: false,
        admin_notes: adminNotes,
        approved_at: new Date().toISOString(),
        approved_by: approvedBy || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ message: 'Item rejected' });
  } catch (error) {
    console.error(`Error rejecting item ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to reject item', details: errorMessage }, { status: 500 });
  }
}
