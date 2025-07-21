import { NextResponse, type NextRequest } from 'next/server';

// Removed Firebase imports. Migrate logic to Supabase if needed.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }
  try {
    // Removed Firebase query and getDocs.
    // This part of the logic needs to be migrated to Supabase if it's still needed.
    // For now, returning an empty array as a placeholder.
    return NextResponse.json([]);
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
    // Removed Firebase query and getDocs.
    // This part of the logic needs to be migrated to Supabase if it's still needed.
    // For now, returning an error as a placeholder.
    return NextResponse.json({ error: 'Wishlist functionality not fully migrated to Supabase' }, { status: 501 });
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
    // Removed Firebase query and getDocs.
    // This part of the logic needs to be migrated to Supabase if it's still needed.
    // For now, returning an error as a placeholder.
    return NextResponse.json({ error: 'Wishlist functionality not fully migrated to Supabase' }, { status: 501 });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to remove from wishlist', details: errorMessage }, { status: 500 });
  }
}
