import { ref } from 'vue'

const baseUrl = '/api'

export interface ApiError {
  error: string
  message?: string
}

export function useApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function get<T>(endpoint: string): Promise<T> {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${baseUrl}${endpoint}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Request failed')
      }
      return await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function post<T>(endpoint: string, body?: unknown): Promise<T> {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Request failed')
      }
      return await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function del<T>(endpoint: string): Promise<T> {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Request failed')
      }
      return await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    get,
    post,
    del
  }
}
