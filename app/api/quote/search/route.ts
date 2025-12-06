import { NextRequest, NextResponse } from 'next/server';
import { searchQuotes } from '@/lib/quote-utils';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter "q" is required' },
                { status: 400 }
            );
        }

        const quotes = searchQuotes(query, limit);

        // Map internal Quote (text) to API Quote (quote)
        const mappedQuotes = quotes.map(q => ({
            id: q.id,
            quote: q.text,
            page: q.page,
            book: q.book
        }));

        return NextResponse.json({ quotes: mappedQuotes });
    } catch (error) {
        console.error('Error in /api/quote/search:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
