
import { NextResponse, type NextRequest } from 'next/server';

// Removed Firebase imports. Migrate logic to Supabase if needed.

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // const itemDoc = await getDoc(doc(db, 'items', id)); // Original Firebase line commented out
    // if (!itemDoc.exists()) { // Original Firebase line commented out
    //   return NextResponse.json({ error: 'Item not found' }, { status: 404 }); // Original Firebase line commented out
    // } // Original Firebase line commented out
    // return NextResponse.json({ id: itemDoc.id, ...itemDoc.data() }); // Original Firebase line commented out
    // Placeholder for Supabase logic if needed
    return NextResponse.json({ message: 'Supabase GET endpoint for item ' + id + ' is not yet implemented' });
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // await deleteDoc(doc(db, 'items', id)); // Original Firebase line commented out
    // return NextResponse.json({ message: 'Item deleted successfully' }); // Original Firebase line commented out
    // Placeholder for Supabase logic if needed
    return NextResponse.json({ message: 'Supabase DELETE endpoint for item ' + id + ' is not yet implemented' });
  } catch (error) {
    console.error(`Error deleting item ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
