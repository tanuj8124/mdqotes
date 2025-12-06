// Updated Home component with floating refresh button
"use client"
import { useEffect, useState } from "react"
import QuoteDisplay from "@/components/quote-display"
import { Spinner } from "@/components/ui/spinner"
import { RotateCcw } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface Quote {
  id: number
  quote: string
  page: number
  book: string
}

interface Book {
  name: string
  slug: string
  quote_count: number
  min_page: number
  max_page: number
  endpoint: string
}

export default function Home() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [prevQuote, setPrevQuote] = useState<Quote | null>(null)
  const [nextQuote, setNextQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<string>("all")
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [totalRequests, setTotalRequests] = useState<number>(0)

  // Page Range State
  const [pageRange, setPageRange] = useState<[number, number]>([0, 1000])
  const [bookPageLimits, setBookPageLimits] = useState<{ min: number, max: number } | null>(null)

  const API_BASE_URL = "/api"

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
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch current count from external API
        const res = await fetch("https://api.counterapi.dev/v1/mdqotes_app/quotes_read")
        if (res.ok) {
          const data = await res.json()
          setTotalRequests(data.count)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  const incrementCounter = async () => {
    try {
      // Increment counter on external API
      const res = await fetch("https://api.counterapi.dev/v1/mdqotes_app/quotes_read/up")
      if (res.ok) {
        const data = await res.json()
        setTotalRequests(data.count)
      }
    } catch (error) {
      console.error("Error incrementing counter:", error)
    }
  }


  const fetchPreviousAndNextPreviews = async (currentQuote: Quote) => {
    try {
      const bookParam = selectedBook !== "all" ? `?book=${currentQuote.book}` : ""

      // Fetch previous quote preview
      const prevResponse = await fetch(`${API_BASE_URL}/quote/previous/${currentQuote.id}${bookParam}`)
      if (prevResponse.ok) {
        const prevData = await prevResponse.json()
        setPrevQuote(prevData)
      }

      // Fetch next quote preview
      const nextResponse = await fetch(`${API_BASE_URL}/quote/next/${currentQuote.id}${bookParam}`)
      if (nextResponse.ok) {
        const nextData = await nextResponse.json()
        setNextQuote(nextData)
      }
    } catch (error) {
      console.error("Error fetching preview quotes:", error)
    }
  }

  const fetchQuote = async (bookSlug?: string) => {
    setLoading(true)
    try {
      let endpoint = `${API_BASE_URL}/quote`

      if (bookSlug && bookSlug !== "all") {
        endpoint = `${API_BASE_URL}/quote/book/${bookSlug}`

        // Add page range params if set and valid
        if (bookPageLimits) {
          endpoint += `?minPage=${pageRange[0]}&maxPage=${pageRange[1]}`
        }
      }

      const response = await fetch(endpoint)
      if (!response.ok) throw new Error("Failed to fetch quote")
      const data = await response.json()
      setQuote(data)
      fetchPreviousAndNextPreviews(data)
      incrementCounter()
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
    const slug = e.target.value
    setSelectedBook(slug)

    if (slug === "all") {
      setBookPageLimits(null)
    } else {
      const book = books.find(b => b.slug === slug)
      if (book) {
        setBookPageLimits({ min: book.min_page, max: book.max_page })
        setPageRange([book.min_page, book.max_page])
      }
    }
  }


  const fetchNextQuote = async () => {
    if (!quote) return
    setLoading(true)
    try {
      const bookParam = selectedBook !== "all" ? `?book=${quote.book}` : ""
      const response = await fetch(`${API_BASE_URL}/quote/next/${quote.id}${bookParam}`)
      if (!response.ok) throw new Error("Failed to fetch next quote")
      const data = await response.json()
      setQuote(data)
      fetchPreviousAndNextPreviews(data)
      incrementCounter()
    } catch (error) {
      console.error("Error fetching next quote:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreviousQuote = async () => {
    if (!quote) return
    setLoading(true)
    try {
      const bookParam = selectedBook !== "all" ? `?book=${quote.book}` : ""
      const response = await fetch(`${API_BASE_URL}/quote/previous/${quote.id}${bookParam}`)
      if (!response.ok) throw new Error("Failed to fetch previous quote")
      const data = await response.json()
      setQuote(data)
      fetchPreviousAndNextPreviews(data)
      incrementCounter()
    } catch (error) {
      console.error("Error fetching previous quote:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchQuote(selectedBook === "all" ? undefined : selectedBook)
  }

  const handleNext = () => {
    fetchNextQuote()
  }

  const handlePrevious = () => {
    fetchPreviousQuote()
  }

  const handleQuoteSelect = (quote: Quote) => {
    setQuote(quote)
    fetchPreviousAndNextPreviews(quote)
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
            </div>
          </div>
        ) : quote ? (
          <QuoteDisplay
            quote={quote}
            prevQuote={prevQuote}
            nextQuote={nextQuote}
            onRefresh={handleRefresh}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onQuoteSelect={handleQuoteSelect}
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

            {/* Page Range Slider */}
            {selectedBook !== "all" && bookPageLimits && (
              <div className="mt-6 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                  <span>Page {pageRange[0]}</span>
                  <span>Page Range Filter</span>
                  <span>Page {pageRange[1]}</span>
                </div>
                <Slider
                  defaultValue={[bookPageLimits.min, bookPageLimits.max]}
                  value={[pageRange[0], pageRange[1]]}
                  min={bookPageLimits.min}
                  max={bookPageLimits.max}
                  step={1}
                  minStepsBetweenThumbs={10}
                  onValueChange={(value) => setPageRange([value[0], value[1]])}
                  className="py-2"
                />
              </div>
            )}

            <p className="w-full text-xs  mt-4 font-medium text-muted-foreground text-center" >Quotes Read : {totalRequests} Times</p>
          </div>
        </div>
      </div>
      {/* Floating Refresh Button */}
      <button
        onClick={handleRefresh}
        className="fixed bottom-5 right-5 bg-primary text-primary-foreground p-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-50"
        title="Refresh Quote"
      >
        <RotateCcw size={24} />
      </button>
    </main>
  )
}