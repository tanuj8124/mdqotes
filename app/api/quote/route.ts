import { NextRequest, NextResponse } from 'next/server';
import { getRandomQuote, incrementStats } from '@/lib/quote-utils';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const avoidRepeat = searchParams.get('unique') === 'true';

        incrementStats();
        const quote = getRandomQuote(avoidRepeat);

        if (!quote) {
            return NextResponse.json(
                { error: 'No quotes available' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            quote: quote.text,
            page: quote.page,
            id: quote.id,
            book: quote.book
        });
    } catch (error) {
        console.error('Error in /api/quote:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
