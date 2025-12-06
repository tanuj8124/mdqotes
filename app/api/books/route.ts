import { NextResponse } from 'next/server';
import { getBooksList } from '@/lib/quote-utils';

export async function GET() {
    try {
        const books = getBooksList();

        return NextResponse.json({
            total_books: books.length,
            books: books
        });
    } catch (error) {
        console.error('Error in /api/books:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
