import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: NextRequest) {
  try {
    const decodedToken = JSON.parse(request.headers.get('X-Decoded-Token') as string);
    const userId = decodedToken.uid;

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
