"use client"

import { RefreshCw, BookOpen, Bookmark } from "lucide-react"
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
  onRefresh: () => void
  isBookmarked?: boolean
}

export default function QuoteDisplay({ quote, onRefresh, isBookmarked = false }: QuoteDisplayProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => setIsRefreshing(false), 500)
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
          <p className="text-sm md:text-base text-muted-foreground tracking-widest uppercase">Every Day Quote</p>
        </div>

      </div>

      {/* Quote Card */}
      <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow duration-300 mb-8">
        {/* Quote Text */}
        <div className="mb-8 md:mb-10">
          <p className="text-2xl md:text-4xl font-serif text-foreground leading-relaxed text-balance mb-6">
            "{quote.quote}"
          </p>
          <div className="h-1 w-12 bg-primary/60 rounded-full"></div>
        </div>

        {/* Source Section */}
       

        <div className="mb-8 md:mb-10 bg-background/50 rounded-lg p-6 border border-border/30">
  <div className="flex flex-col gap-4">

    {/* Header */}
    <div className="flex items-center gap-3">
      <BookOpen size={18} className="text-primary flex-shrink-0" />
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
        View in PDF
      </a>

    </div>
  </div>
</div>


        {/* Date */}
        <div className="text-xs tracking-widest text-muted-foreground uppercase">{formattedDate}</div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 w-full z-50 flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/80 backdrop-blur p-4">


        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="group relative inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium tracking-wide transition-all duration-300 hover:shadow-lg hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={`transition-transform duration-300 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"}`}
          />
          <span>New Quote</span>
        </button>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-12 md:mt-16 text-xs text-muted-foreground tracking-wide"></div>
    </div>
  )
}
