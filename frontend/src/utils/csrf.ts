export const fetchCsrfToken = async () => {
  try {
    const res = await fetch('/api/csrf-token', {credentials: "include"})
    const data = await res.json()
    return data.csrfToken
  } catch (error) {
    console.error('Ошибка CSRF токена', error)
  }
}