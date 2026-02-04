import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const dbUrl = process.env.DATABASE_URL;

  // No mostrar el password completo
  const maskedUrl = dbUrl
    ? dbUrl.replace(/:[^:@]+@/, ':****@')
    : 'NOT SET';

  return NextResponse.json({
    databaseUrl: maskedUrl,
    host: dbUrl?.split('@')[1]?.split('/')[0] || 'UNKNOWN',
    port: dbUrl?.split(':')[3]?.split('/')[0] || 'UNKNOWN',
    hasPooling: dbUrl?.includes('pooler') || false,
    isVercel: !!process.env.VERCEL,
  });
}
