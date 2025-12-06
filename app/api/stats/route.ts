import { NextResponse } from 'next/server';
import { getDatabaseStats } from '@/lib/quote-utils';

export async function GET() {
    try {
        const stats = getDatabaseStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error in /api/stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
