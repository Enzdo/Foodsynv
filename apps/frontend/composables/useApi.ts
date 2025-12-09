/**
 * Composable for API communication with the backend
 */
export function useApi() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase

  async function get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }

  async function post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }

  async function put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }

  async function del<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }

  async function healthCheck(): Promise<{ status: string; timestamp: string }> {
    return get('/health')
  }

  return {
    get,
    post,
    put,
    del,
    healthCheck,
  }
}
