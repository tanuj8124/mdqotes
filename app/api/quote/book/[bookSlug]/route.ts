import { NextRequest, NextResponse } from 'next/server';
import { getRandomQuoteFromBook, findBookBySlug, incrementStats, bookNameToSlug, getBooksList } from '@/lib/quote-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ bookSlug: string }> }
) {
    try {
        const { bookSlug: paramSlug } = await params;
        const bookSlug = paramSlug.toLowerCase();
        const searchParams = request.nextUrl.searchParams;
        const avoidRepeat = searchParams.get('unique') === 'true';

        // Parse page range params
        const minPageParam = searchParams.get('minPage');
        const maxPageParam = searchParams.get('maxPage');
        const minPage = minPageParam ? parseInt(minPageParam) : undefined;
        const maxPage = maxPageParam ? parseInt(maxPageParam) : undefined;

        incrementStats();

        // Find the book by matching slug
        const bookName = findBookBySlug(bookSlug);

        if (!bookName) {
            const books = getBooksList();
            return NextResponse.json(
                {
                    error: 'Book not found',
                    available_books: books.map(book => ({
                        name: book.name,
                        slug: book.slug
                    }))
                },
                { status: 404 }
            );
        }

        const quote = getRandomQuoteFromBook(bookName, avoidRepeat, minPage, maxPage);

        if (!quote) {
            return NextResponse.json(
                { error: `No quotes available for book: ${bookName}` },
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
        console.error('Error in /api/quote/book/[bookSlug]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
