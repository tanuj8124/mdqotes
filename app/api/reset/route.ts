import { NextRequest, NextResponse } from 'next/server';
import { resetServedQuotes, findBookBySlug, loadQuotesDatabase } from '@/lib/quote-utils';

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const bookSlug = searchParams.get('book');

        if (bookSlug) {
            // Reset specific book
            const bookName = findBookBySlug(bookSlug);

            if (!bookName) {
                return NextResponse.json(
                    { error: 'Book not found' },
                    { status: 404 }
                );
            }

            resetServedQuotes(bookSlug);

            const quotes = loadQuotesDatabase();
            const totalQuotes = quotes.filter(q => q.book === bookName).length;

            return NextResponse.json({
                message: `Served quotes tracker reset for book: ${bookName}`,
                book: bookName,
                total_quotes: totalQuotes
            });
        }

        // Reset all trackers
        resetServedQuotes();

        const quotes = loadQuotesDatabase();
        return NextResponse.json({
            message: 'All served quotes trackers reset successfully',
            total_quotes: quotes.length
        });
    } catch (error) {
        console.error('Error in /api/reset:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
