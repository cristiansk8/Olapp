import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    const result = await pool.query('SELECT 1 as test, NOW() as now')
    await pool.end()

    return NextResponse.json({
      success: true,
      result: result.rows[0],
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'),
    })
  }
}
