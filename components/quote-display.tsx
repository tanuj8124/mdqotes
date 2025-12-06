"use client"

import { RefreshCw, BookOpen, Bookmark, Copy, Check, FileText, Search, X, ChevronUp, ChevronDown } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { bookmarkQuote, removeBookmark } from "@/lib/bookmarks"

interface Quote {
  id: number
  quote: string
  page: number
  book: string
}

interface QuoteDisplayProps {
  quote: Quote
  prevQuote: Quote | null
  nextQuote: Quote | null
  onRefresh: () => void
  onNext: () => void
  onPrevious: () => void
  onQuoteSelect?: (quote: Quote) => void
  isBookmarked?: boolean
}

export default function QuoteDisplay({ quote, prevQuote, nextQuote, onRefresh, onNext, onPrevious, onQuoteSelect, isBookmarked = false }: QuoteDisplayProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Quote[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(`/api/quote/search?q=${encodeURIComponent(query)}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.quotes)
        setShowResults(true)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectResult = (quote: Quote) => {
    if (onQuoteSelect) {
      onQuoteSelect(quote)
      setSearchQuery("")
      setShowResults(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleCopyQuote = async () => {
    try {
      await navigator.clipboard.writeText(quote.quote)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy quote:', err)
    }
  }

  const handleBookmarkToggle = async () => {
    setBookmarkLoading(true)
    try {
      if (bookmarked) {
        const success = await removeBookmark(quote.id)
        if (success) setBookmarked(false)
      } else {
        const success = await bookmarkQuote(quote.id)
        if (success) setBookmarked(true)
      }
    } finally {
      setBookmarkLoading(false)
    }
  }

  const now = new Date()
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-12 md:mb-16">
        <div className="text-center flex-1">
          <h1 className="text-3xl md:text-5xl font-light text-foreground mb-2 tracking-tight font-serif">
            Madhyasth Darshan
          </h1>
          <p className="text-sm md:text-base text-muted-foreground tracking-widest uppercase">Quotes On The GO</p>
        </div>

      </div>

      {/* Search Box */}
      <div className="relative max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search quotes by keyword..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("")
                setShowResults(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelectResult(result)}
                className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
              >
                <p className="text-sm text-foreground line-clamp-1 font-medium">"{result.quote}"</p>
                <p className="text-xs text-muted-foreground mt-1">{result.book}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quote Card */}
      <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow duration-300 mb-8 relative flex gap-4 md:gap-8">
        {/* Quote Content */}
        <div className="flex-1">
          {/* Quote Text */}
          <div className="mb-8 md:mb-10">
            {/* Previous Quote Preview - Clickable for Navigation */}
            {prevQuote && (
              <button
                onClick={onPrevious}
                className="w-full text-left mb-6 pb-4 border-b border-border/30 group hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ChevronUp className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  <p className="text-xs text-muted-foreground/50 uppercase tracking-wider group-hover:text-primary transition-colors">Previous</p>
                </div>
                <p className="text-sm text-muted-foreground/60 leading-relaxed line-clamp-2 italic group-hover:text-foreground/80 transition-colors">
                  "{prevQuote.quote}"
                </p>
              </button>
            )}

            {/* Main Quote */}
            <p className="text-2xl md:text-4xl font-serif text-foreground leading-relaxed text-balance mb-6">
              "{quote.quote}"
            </p>

            {/* Next Quote Preview - Clickable for Navigation */}
            {nextQuote && (
              <button
                onClick={onNext}
                className="w-full text-left mt-6 pt-4 border-t border-border/30 group hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ChevronDown className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  <p className="text-xs text-muted-foreground/50 uppercase tracking-wider group-hover:text-primary transition-colors">Next</p>
                </div>
                <p className="text-sm text-muted-foreground/60 leading-relaxed line-clamp-2 italic group-hover:text-foreground/80 transition-colors">
                  "{nextQuote.quote}"
                </p>
              </button>
            )}

            <div className="h-1 w-12 bg-primary/60 rounded-full mt-6"></div>
          </div>

          {/* Source Section */}


          <div className="mb-8 md:mb-10 bg-background/50 rounded-lg p-6 border border-border/30">
            <div className="flex flex-col gap-4">

              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <BookOpen size={18} className="text-primary flex-shrink-0" />
                <button
                  onClick={handleCopyQuote}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors text-xs font-medium"
                  title="Copy quote to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="h-px bg-border/20" />

              {/* Content */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">

                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
                    Page
                  </p>
                  <p className="text-foreground font-serif">{quote.page}</p>
                </div>

                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
                    Book
                  </p>
                  <p className="text-foreground font-serif break-all">{quote.book}</p>
                </div>

                {/* Button */}
                <a
                  href={`/pdfjs/web/viewer.html?file=/${quote.book}.pdf#search=${encodeURIComponent(
                    quote.quote
                  )}&highlight=all&phrase=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 
                   hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium"
                >
                  <BookOpen size={16} />
                  View in Book
                </a>

              </div>

              {/* Read Book Button */}
              <a
                href={`/pdfjs/web/viewer.html?file=/${quote.book}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors text-sm font-medium"
              >
                <FileText size={16} />
                Read Full Book
              </a>
            </div>
          </div>
        </div>

        {/* Vertical Navigation Buttons */}
        <div className="hidden md:flex flex-col justify-center gap-4 border-l border-border/30 pl-4 md:pl-8">
          <button
            onClick={onPrevious}
            className="p-3 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-all hover:scale-110 active:scale-95"
            title="Previous quote"
          >
            <ChevronUp size={24} />
          </button>

          <button
            onClick={onNext}
            className="p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
            title="Next quote"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </div>



      {/* Footer Note */}
      <div className="text-center mt-12 md:mt-16 text-xs text-muted-foreground tracking-wide"></div>
    </div>
  )
}
