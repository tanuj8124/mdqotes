"use client"

import { useEffect, useState } from "react"
import QuoteDisplay from "@/components/quote-display"
import { Spinner } from "@/components/ui/spinner"

interface Quote {
  id: number
  text: string
  page: number
  pdf_link: string
}

export default function Home() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([])

  const fetchQuote = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://hindi-quote-api.onrender.com/quote")
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
    fetchQuote()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <Spinner className="w-8 h-8" />
            <div className="text-center">
              <p className="text-muted-foreground text-sm tracking-wide mb-1">Finding quote...</p>
              <p className="text-xs text-muted-foreground/70 tracking-widest uppercase">It may take up to 1 minute</p>
            </div>
          </div>
        ) : quote ? (
          <QuoteDisplay quote={quote} onRefresh={fetchQuote} isBookmarked={bookmarkedIds.includes(quote.id)} />
        ) : (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">Unable to load quote</p>
            <button
              onClick={fetchQuote}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
