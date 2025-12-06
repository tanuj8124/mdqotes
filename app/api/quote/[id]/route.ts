import { NextRequest, NextResponse } from 'next/server';
import { getQuoteById } from '@/lib/quote-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const quoteId = parseInt(params.id);

        if (isNaN(quoteId)) {
            return NextResponse.json(
                { error: 'Invalid quote ID' },
                { status: 400 }
            );
        }

        const quote = getQuoteById(quoteId);

        if (!quote) {
            return NextResponse.json(
                { error: 'Quote not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            quote: quote.text,
            page: quote.page,
            id: quote.id,
            book: quote.book,
            pdf_link: `/pdfjs/web/viewer.html?file=../../${quote.book}.pdf#page=${quote.page}`
        });
    } catch (error) {
        console.error('Error in /api/quote/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
