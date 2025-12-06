import { NextResponse } from 'next/server';
import { loadQuotesDatabase, getBooksList } from '@/lib/quote-utils';

export async function GET() {
    try {
        const quotes = loadQuotesDatabase();
        const books = getBooksList();

        return NextResponse.json({
            status: 'healthy',
            quotes_loaded: quotes.length > 0,
            total_quotes: quotes.length,
            total_books: books.length
        });
    } catch (error) {
        console.error('Error in /api/health:', error);
        return NextResponse.json(
            {
                status: 'unhealthy',
                quotes_loaded: false,
                total_quotes: 0,
                total_books: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
