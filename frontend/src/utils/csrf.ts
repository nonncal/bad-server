import { API_URL } from "@constants"

export const fetchCsrfToken = async () => {
  try {
    const res = await fetch(`${API_URL}/auth/csrf-token`, {credentials: "include"})
    const data = await res.json()
    return data.csrfToken
  } catch (error) {
    console.error('Ошибка CSRF токена', error)
  }
}