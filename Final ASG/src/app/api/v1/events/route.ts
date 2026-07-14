import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { createClient as createServerSupabase } from '@/lib/supabase/server';

// Simple route handler for events. GET is public (reads using server client using cookies),
// POST requires an authenticated user who is present in the `admins` table.

export async function GET() {
  try {
    // Use service client for reliable reads in server context
    const { data, error } = await supabaseService.from('events').select('*').order('date', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ events: data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: userData } = await serverSupabase.auth.getUser();

    if (!userData?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is an admin in `admins` table
    const { data: admins, error: adminErr } = await supabaseService.from('admins').select('*').eq('id', userData.user.id).limit(1);
    if (adminErr) return NextResponse.json({ error: adminErr.message }, { status: 500 });
    if (!admins || admins.length === 0) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();

    // Basic insert -- ensure your DB schema columns align with the body
    const { data: inserted, error: insertErr } = await supabaseService.from('events').insert([body]).select();
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    return NextResponse.json({ event: inserted?.[0] || null }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
