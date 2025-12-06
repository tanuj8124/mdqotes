import fs from 'fs';
import path from 'path';

export interface Quote {
  id: number;
  text: string;
  page: number;
  book: string;
}

export interface Book {
  name: string;
  slug: string;
  quote_count: number;
  min_page: number;
  max_page: number;
  endpoint: string;
}

export interface Stats {
  total_requests: number;
  quote_requests: number;
  book_quote_requests: number;
}

// Global cache for quotes and stats
let quotesDatabase: Quote[] = [];
let booksList: string[] = [];
const servedQuotes = new Set<number>();
const servedQuotesByBook: Record<string, Set<number>> = {};

const QUOTES_FILE = path.join(process.cwd(), 'data', 'quotes_database.json');
const STATS_FILE = path.join(process.cwd(), 'data', 'stats.json');

/**
 * Load quotes database from file (cached)
 */
export function loadQuotesDatabase(): Quote[] {
  if (quotesDatabase.length > 0) {
    return quotesDatabase;
  }

  try {
    if (!fs.existsSync(QUOTES_FILE)) {
      throw new Error('quotes_database.json not found!');
    }

    const data = fs.readFileSync(QUOTES_FILE, 'utf8');
    quotesDatabase = JSON.parse(data);

    if (!Array.isArray(quotesDatabase) || quotesDatabase.length === 0) {
      throw new Error('quotes_database.json is empty or invalid!');
    }

    // Extract unique book names
    booksList = [...new Set(quotesDatabase.map(q => q.book))].filter(Boolean);

    console.log(`✅ Loaded ${quotesDatabase.length} quotes from database`);
    console.log(`📚 Found ${booksList.length} books`);

    return quotesDatabase;
  } catch (error) {
    console.error('❌ Error loading quotes database:', error);
    throw error;
  }
}

/**
 * Get list of available books
 */
export function getBooksList(): Book[] {
  const quotes = loadQuotesDatabase();

  return booksList.map(book => {
    const bookQuotes = quotes.filter(q => q.book === book);
    const count = bookQuotes.length;

    // Calculate min and max pages
    const pages = bookQuotes.map(q => q.page).filter(p => p > 0);
    const min_page = pages.length > 0 ? Math.min(...pages) : 0;
    const max_page = pages.length > 0 ? Math.max(...pages) : 0;

    const slug = bookNameToSlug(book);
    return {
      name: book,
      slug: slug,
      quote_count: count,
      min_page,
      max_page,
      endpoint: `/api/quote/book/${slug}`
    };
  });
}

/**
 * Get random quote from all books
 */
export function getRandomQuote(avoidRepeat = false): Quote | null {
  const quotes = loadQuotesDatabase();

  if (quotes.length === 0) {
    return null;
  }

  // Reset served quotes if all have been shown
  if (avoidRepeat && servedQuotes.size >= quotes.length) {
    servedQuotes.clear();
    console.log('🔄 All quotes served, resetting...');
  }

  let quote: Quote;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quote = quotes[randomIndex];
    attempts++;

    if (!avoidRepeat || !servedQuotes.has(quote.id) || attempts >= maxAttempts) {
      break;
    }
  } while (servedQuotes.has(quote.id));

  if (avoidRepeat) {
    servedQuotes.add(quote.id);
  }

  return quote;
}

/**
 * Get random quote from specific book
 */
/**
 * Get random quote from specific book with optional page range
 */
export function getRandomQuoteFromBook(
  bookName: string,
  avoidRepeat = false,
  minPage?: number,
  maxPage?: number
): Quote | null {
  const quotes = loadQuotesDatabase();
  let bookQuotes = quotes.filter(q => q.book === bookName);

  // Filter by page range if provided
  if (minPage !== undefined || maxPage !== undefined) {
    bookQuotes = bookQuotes.filter(q => {
      const page = q.page;
      if (minPage !== undefined && page < minPage) return false;
      if (maxPage !== undefined && page > maxPage) return false;
      return true;
    });
  }

  if (bookQuotes.length === 0) {
    return null;
  }

  // Initialize tracking for this book if needed
  if (!servedQuotesByBook[bookName]) {
    servedQuotesByBook[bookName] = new Set();
  }

  // Reset served quotes if all have been shown for this book
  if (avoidRepeat && servedQuotesByBook[bookName].size >= bookQuotes.length) {
    servedQuotesByBook[bookName].clear();
    console.log(`🔄 All quotes from "${bookName}" served, resetting...`);
  }

  let quote: Quote;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    const randomIndex = Math.floor(Math.random() * bookQuotes.length);
    quote = bookQuotes[randomIndex];
    attempts++;

    if (!avoidRepeat || !servedQuotesByBook[bookName].has(quote.id) || attempts >= maxAttempts) {
      break;
    }
  } while (servedQuotesByBook[bookName].has(quote.id));

  if (avoidRepeat) {
    servedQuotesByBook[bookName].add(quote.id);
  }

  return quote;
}

/**
 * Get quote by ID
 */
export function getQuoteById(id: number): Quote | null {
  const quotes = loadQuotesDatabase();
  return quotes.find(q => q.id === id) || null;
}

/**
 * Get next quote by ID (sequential)
 */
export function getNextQuote(currentId: number, bookName?: string): Quote | null {
  const quotes = loadQuotesDatabase();
  const filteredQuotes = bookName
    ? quotes.filter(q => q.book === bookName)
    : quotes;

  const currentIndex = filteredQuotes.findIndex(q => q.id === currentId);

  if (currentIndex === -1 || currentIndex === filteredQuotes.length - 1) {
    // If not found or is last quote, return first quote (wrap around)
    return filteredQuotes[0] || null;
  }

  return filteredQuotes[currentIndex + 1];
}

/**
 * Search quotes by text
 */
export function searchQuotes(query: string, limit: number = 10): Quote[] {
  const quotes = loadQuotesDatabase();
  const lowerQuery = query.toLowerCase();

  return quotes
    .filter(q => q.text.toLowerCase().includes(lowerQuery))
    .slice(0, limit);
}

/**
 * Get previous quote by ID (sequential)
 */
export function getPreviousQuote(currentId: number, bookName?: string): Quote | null {
  const quotes = loadQuotesDatabase();
  const filteredQuotes = bookName
    ? quotes.filter(q => q.book === bookName)
    : quotes;

  const currentIndex = filteredQuotes.findIndex(q => q.id === currentId);

  if (currentIndex === -1 || currentIndex === 0) {
    // If not found or is first quote, return last quote (wrap around)
    return filteredQuotes[filteredQuotes.length - 1] || null;
  }

  return filteredQuotes[currentIndex - 1];
}

/**
 * Convert book name to URL-friendly slug
 */
export function bookNameToSlug(bookName: string): string {
  return bookName
    .toLowerCase()
    .replace(/\.pdf$/, '') // Remove .pdf extension
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-') // Convert underscores to hyphens
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Find book name by slug
 */
export function findBookBySlug(slug: string): string | null {
  loadQuotesDatabase();
  return booksList.find(book => bookNameToSlug(book) === slug.toLowerCase()) || null;
}

/**
 * Load stats from file
 */
export function loadStats(): Stats {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading stats file:', err);
  }

  return {
    total_requests: 0,
    quote_requests: 0,
    book_quote_requests: 0
  };
}

/**
 * Save stats to file
 */
export function saveStats(stats: Stats): void {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (err) {
    console.error('Error saving stats file:', err);
  }
}

/**
 * Increment request stats
 */
export function incrementStats(): Stats {
  const stats = loadStats();
  stats.total_requests++;
  stats.quote_requests++;
  saveStats(stats);
  return stats;
}

/**
 * Get database statistics
 */
export function getDatabaseStats() {
  const quotes = loadQuotesDatabase();

  const bookStats = booksList.map(book => ({
    name: book,
    slug: bookNameToSlug(book),
    total_quotes: quotes.filter(q => q.book === book).length,
    served_quotes: (servedQuotesByBook[book] || new Set()).size
  }));

  return {
    total_quotes: quotes.length,
    total_books: booksList.length,
    served_quotes_overall: servedQuotes.size,
    remaining_quotes_overall: quotes.length - servedQuotes.size,
    books: bookStats
  };
}

/**
 * Reset served quotes tracker
 */
export function resetServedQuotes(bookSlug?: string): void {
  if (bookSlug) {
    const bookName = findBookBySlug(bookSlug);
    if (bookName && servedQuotesByBook[bookName]) {
      servedQuotesByBook[bookName].clear();
    }
  } else {
    servedQuotes.clear();
    Object.keys(servedQuotesByBook).forEach(book => {
      servedQuotesByBook[book].clear();
    });
  }
}
