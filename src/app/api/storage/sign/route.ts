import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // This should NOT be exposed to the client

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: NextRequest) {
  try {
    // For production, verify the Firebase Auth token here using the Admin SDK.
    // For development, allow unauthenticated requests but log a warning.
    let userId = 'anonymous';
    const decodedTokenHeader = request.headers.get('X-Decoded-Token');
    if (decodedTokenHeader) {
      try {
        const decodedToken = JSON.parse(decodedTokenHeader);
        userId = decodedToken.uid;
      } catch (e) {
        console.warn('Invalid X-Decoded-Token header, using anonymous user.');
      }
    } else {
      console.warn('No X-Decoded-Token header, using anonymous user.');
    }

    const { path } = await request.json();

    const { data, error } = await supabase.storage
      .from('images')
      .createSignedUploadUrl(path);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating signed URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create signed URL', details: errorMessage }, { status: 500 });
  }
}
