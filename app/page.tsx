// Updated Home component with floating refresh button
"use client"
import { useEffect, useState } from "react"
import QuoteDisplay from "@/components/quote-display"
import { Spinner } from "@/components/ui/spinner"
import { RotateCcw } from "lucide-react"

interface Quote {
  id: number
  text: string
  page: number
  book?: string
}

interface Book {
  name: string
  slug: string
  quote_count: number
  endpoint: string
}

export default function Home() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<string>("all")
  const [loadingBooks, setLoadingBooks] = useState(true)

  const API_BASE_URL = "https://hindi-quote-api.onrender.com"

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/books`)
        if (!response.ok) throw new Error("Failed to fetch books")
        const data = await response.json()
        setBooks(data.books || [])
      } catch (error) {
        console.error("Error fetching books:", error)
      } finally {
        setLoadingBooks(false)
      }
    }
    fetchBooks()
  }, [])

  const fetchQuote = async (bookSlug?: string) => {
    setLoading(true)
    try {
      const endpoint = bookSlug && bookSlug !== "all" 
        ? `${API_BASE_URL}/quote/book/${bookSlug}`
        : `${API_BASE_URL}/quote`
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error("Failed to fetch quote")
      const data = await response.json()
      setQuote(data)
    } catch (error) {
      console.error("Error fetching quote:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuote(selectedBook === "all" ? undefined : selectedBook)
  }, [selectedBook])

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBook(e.target.value)
  }

  const handleRefresh = () => {
    fetchQuote(selectedBook === "all" ? undefined : selectedBook)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex items-center justify-center p-4 md:p-8 relative">
      <div className="w-full max-w-3xl">

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <Spinner className="w-8 h-8" />
            <div className="text-center">
              <p className="text-muted-foreground text-sm tracking-wide mb-1">
                Finding quote...
              </p>
              <p className="text-xs text-muted-foreground/70 tracking-widest uppercase">
                It may take up to 1 minute
              </p>
            </div>
          </div>
        ) : quote ? (
          <QuoteDisplay 
            quote={quote} 
            onRefresh={handleRefresh} 
            isBookmarked={bookmarkedIds.includes(quote.id)} 
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">Unable to load quote</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-md">
            <label 
              htmlFor="book-select" 
              className="block text-sm font-medium text-muted-foreground mb-2 text-center"
            >
              Select Book
            </label>
            <select
              id="book-select"
              value={selectedBook}
              onChange={handleBookChange}
              disabled={loadingBooks}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground shadow-sm hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">🎲 Random (All Books)</option>
              {loadingBooks ? (
                <option disabled>Loading books...</option>
              ) : (
                books.map((book) => (
                  <option key={book.slug} value={book.slug}>
                    📖 {book.name} ({book.quote_count} quotes)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Floating Refresh Button */}
      <button
        onClick={handleRefresh}
        className="fixed bottom-5 right-5 bg-primary text-primary-foreground p-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
      >
        <RotateCcw className="w-6 h-6" />
      </button>
    </main>
  )
}