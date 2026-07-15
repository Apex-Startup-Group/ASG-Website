
import { POST } from './src/app/api/v1/admin/interns/route';
import { NextResponse } from 'next/server';

const mockReq = {
  json: async () => ({
    name: "Gaurav Test",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    college: "SSBT COET",
    course: "B. Tech",
    year: "4th Year",
    domain: "Mobility",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com",
    email: "test@example.com",
    phone: "9876543210"
  })
} as any;

async function run() {
  try {
    // Note: since POST checks for auth user, we can mock createClient in supabase/server
    console.log("Calling POST handler...");
    const res = await POST(mockReq);
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON:", json);
  } catch (err) {
    console.error("Handler Error:", err);
  }
}
run();
