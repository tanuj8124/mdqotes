"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Trash2 } from "lucide-react"
import { getBookmarks, removeBookmark } from "@/lib/bookmarks"
import { Spinner } from "@/components/ui/spinner"

interface BookmarkedQuote {
  id: number
  text: string
  page: number
  pdf_link: string
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    setLoading(true)
    try {
      const data = await getBookmarks()
      setBookmarks(data)
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (quoteId: number) => {
    setDeleting(quoteId)
    try {
      const success = await removeBookmark(quoteId)
      if (success) {
        setBookmarks(bookmarks.filter((q) => q.id !== quoteId))
      }
    } finally {
      setDeleting(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Quote</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-light text-foreground mb-2 tracking-tight font-serif">
            My Bookmarks
          </h1>
          <p className="text-muted-foreground tracking-wide">{bookmarks.length} saved quotes</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner className="w-8 h-8" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border/50 rounded-2xl">
            <BookOpen size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-lg mb-6">No bookmarks yet</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
            >
              Go to Quote
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookmarks.map((quote) => (
              <div
                key={quote.id}
                className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 hover:shadow-md transition-shadow"
              >
                {/* Quote Text */}
                <p className="text-xl md:text-2xl font-serif text-foreground mb-4 leading-relaxed">"{quote.text}"</p>

                {/* Meta Information */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Quote ID</p>
                      <p className="text-foreground font-serif">{quote.id}</p>
                    </div>
                    <div className="h-8 w-px bg-border/30"></div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Page</p>
                      <p className="text-foreground font-serif">{quote.page}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={quote.pdf_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium"
                    >
                      <BookOpen size={16} />
                      View PDF
                    </a>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      disabled={deleting === quote.id}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors disabled:opacity-50"
                      title="Remove bookmark"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
