
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'healthy',
        app: 'healthy'
      }
    };

    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error) {
    const healthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'unhealthy',
        app: 'degraded'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(healthCheck, { status: 503 });
  }
}
