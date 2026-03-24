import { API_URL } from '@constants'

let currentCsrfToken: string | null = null

export const fetchCsrfToken = async (): Promise<string> => {
  if (currentCsrfToken) {
    return currentCsrfToken
  }

  try {
    const res = await fetch(`${API_URL}/auth/csrf-token`, {
      credentials: 'include',
      method: 'GET',
    })

    if (!res.ok) {
      throw new Error(`CSRF fetch failed: ${res.status}`)
    }

    const data = await res.json()
    currentCsrfToken = data.csrfToken

    if (!currentCsrfToken) {
      throw new Error('CSRF token is empty')
    }

    return currentCsrfToken
  } catch (error) {
    console.error('Ошибка получения CSRF токена:', error)
    throw error
  }
}

export const resetCsrfToken = () => {
  currentCsrfToken = null
}