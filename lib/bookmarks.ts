// Bookmark API utilities
const API_BASE = "https://hindi-quote-api.onrender.com"

// Get or create userId from localStorage
export function getUserId(): string {
  if (typeof window === "undefined") return ""

  let userId = localStorage.getItem("madhyasth_user_id")
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("madhyasth_user_id", userId)
  }
  return userId
}

export async function bookmarkQuote(quoteId: number): Promise<boolean> {
  try {
    const userId = getUserId()
    const response = await fetch(`${API_BASE}/bookmark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, quoteId }),
    })

    if (response.status === 409) {
      // Already bookmarked
      return true
    }

    return response.ok
  } catch (error) {
    console.error("Error bookmarking quote:", error)
    return false
  }
}

export async function removeBookmark(quoteId: number): Promise<boolean> {
  try {
    const userId = getUserId()
    const response = await fetch(`${API_BASE}/bookmark/${userId}/${quoteId}`, {
      method: "DELETE",
    })
    return response.ok
  } catch (error) {
    console.error("Error removing bookmark:", error)
    return false
  }
}

export async function getBookmarks(
  userId?: string,
): Promise<Array<{ id: number; text: string; page: number; pdf_link: string }>> {
  try {
    const id = userId || getUserId()
    const response = await fetch(`${API_BASE}/bookmarks/${id}`)
    if (!response.ok) return []

    const data = await response.json()
    return data.bookmarks || []
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return []
  }
}
