import { NextRequest, NextResponse } from 'next/server';
import { getNextQuote } from '@/lib/quote-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const currentId = parseInt(id);
        const searchParams = request.nextUrl.searchParams;
        const bookName = searchParams.get('book') || undefined;

        if (isNaN(currentId)) {
            return NextResponse.json(
                { error: 'Invalid quote ID' },
                { status: 400 }
            );
        }

        const quote = getNextQuote(currentId, bookName);

        if (!quote) {
            return NextResponse.json(
                { error: 'No next quote available' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            quote: quote.text,
            page: quote.page,
            id: quote.id,
            book: quote.book
        });
    } catch (error) {
        console.error('Error in /api/quote/next/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
