import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Test 1: Conexión básica
    const result = await prisma.$queryRaw`SELECT 1 as test`;

    // Test 2: Contar tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    // Test 3: Consultar homePageContent
    let homeContent = null;
    try {
      homeContent = await prisma.homePageContent.findFirst({
        where: { isActive: true },
        select: { logoUrl: true },
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        step: 'homePageContent query',
        error: error.message,
        code: error.code,
      });
    }

    return NextResponse.json({
      success: true,
      tables: tables,
      homeContentLogo: homeContent?.logoUrl || 'NOT_FOUND',
      tablesCount: Array.isArray(tables) ? tables.length : 0,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      step: 'connection',
      error: error.message,
      code: error.code,
    });
  }
}
