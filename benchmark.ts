
import { getRandomQuote, incrementStats, loadQuotesDatabase } from './lib/quote-utils';

function benchmark() {
    console.time('Load Database First Time');
    loadQuotesDatabase();
    console.timeEnd('Load Database First Time');

    console.time('Load Database Cached');
    loadQuotesDatabase();
    console.timeEnd('Load Database Cached');

    console.time('Get Random Quote');
    getRandomQuote();
    console.timeEnd('Get Random Quote');

    console.time('Increment Stats');
    incrementStats();
    console.timeEnd('Increment Stats');
}

benchmark();
