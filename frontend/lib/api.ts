/**
 * API Service Layer for NutriFusion Frontend
 * Handles all communication with the backend API
 */

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Token Management
const TOKEN_KEY = 'nutrifusion_token'
const USER_KEY = 'nutrifusion_user'

/**
 * Store authentication token in localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * Get authentication token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

/**
 * Remove authentication token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Store user data in localStorage
 */
export const setUser = (user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

/**
 * Get user data from localStorage
 */
export const getUser = (): any | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  }
  return null
}

// API Response Types
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'user' | 'practitioner'
}

interface AuthResponse {
  success: boolean
  token: string
  message?: string
  data: {
    _id: string
    name?: string
    email: string
    role: 'user' | 'practitioner'
    verified?: boolean
    authorityLevel?: string
  }
}

/**
 * Make authenticated API request
 */
const makeRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Request failed',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('API Request Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// ============================================
// Authentication APIs
// ============================================

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
  // Use the appropriate endpoint based on role
  const endpoint = userData.role === 'practitioner' 
    ? '/auth/register/practitioner' 
    : '/auth/register/user';
    
  const response = await makeRequest<AuthResponse>(endpoint, {
    method: 'POST',
    body: JSON.stringify(userData),
  })

  if (response.success && response.data) {
    setToken(response.data.token)
    setUser(response.data.data)
  }

  return response
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
  const response = await makeRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  if (response.success && response.data) {
    setToken(response.data.token)
    setUser(response.data.data)
  }

  return response
}

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  removeToken()
  // Optionally call backend logout endpoint if it exists
  // await makeRequest('/auth/logout', { method: 'POST' })
}

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<ApiResponse<any>> => {
  return await makeRequest('/auth/me', {
    method: 'GET',
  })
}

/**
 * Verify if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null
}

// ============================================
// Health Profile APIs
// ============================================

/**
 * Get user's health profile
 */
export const getHealthProfile = async (): Promise<ApiResponse<any>> => {
  return await makeRequest('/health-profiles/me', {
    method: 'GET',
  })
}

/**
 * Create or update health profile
 */
export const updateHealthProfile = async (profileData: any): Promise<ApiResponse<any>> => {
  return await makeRequest('/health-profiles', {
    method: 'POST',
    body: JSON.stringify(profileData),
  })
}

// ============================================
// Recommendations APIs
// ============================================

/**
 * Get food recommendations
 */
export const getFoodRecommendations = async (params?: {
  limit?: number
  llm?: boolean
}): Promise<ApiResponse<any>> => {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.llm) queryParams.append('llm', 'true')
  
  const queryString = queryParams.toString()
  const endpoint = `/recommendations/foods${queryString ? `?${queryString}` : ''}`
  
  return await makeRequest(endpoint, {
    method: 'GET',
  })
}

/**
 * Get recipe recommendations
 */
export const getRecipeRecommendations = async (params?: {
  limit?: number
  llm?: boolean
}): Promise<ApiResponse<any>> => {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.llm) queryParams.append('llm', 'true')
  
  const queryString = queryParams.toString()
  const endpoint = `/recommendations/recipes${queryString ? `?${queryString}` : ''}`
  
  return await makeRequest(endpoint, {
    method: 'GET',
  })
}

// ============================================
// Diet Plans APIs
// ============================================

/**
 * Get user's diet plans
 */
export const getDietPlans = async (): Promise<ApiResponse<any>> => {
  return await makeRequest('/diet-plans', {
    method: 'GET',
  })
}

/**
 * Create a new diet plan
 */
export const createDietPlan = async (planData: any): Promise<ApiResponse<any>> => {
  return await makeRequest('/diet-plans', {
    method: 'POST',
    body: JSON.stringify(planData),
  })
}

// ============================================
// Practitioner APIs
// ============================================

/**
 * Get practitioner's patients list
 */
export const getPatients = async (): Promise<ApiResponse<any>> => {
  return await makeRequest('/practitioners/patients', {
    method: 'GET',
  })
}

/**
 * Get patient details
 */
export const getPatientDetails = async (patientId: string): Promise<ApiResponse<any>> => {
  return await makeRequest(`/practitioners/patients/${patientId}`, {
    method: 'GET',
  })
}

/**
 * Override AI recommendation
 */
export const overrideRecommendation = async (
  userId: string,
  overrideData: any
): Promise<ApiResponse<any>> => {
  return await makeRequest('/overrides', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      ...overrideData,
    }),
  })
}

// ============================================
// Foods & Recipes APIs
// ============================================

/**
 * Get all foods
 */
export const getFoods = async (params?: {
  page?: number
  limit?: number
  search?: string
}): Promise<ApiResponse<any>> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.search) queryParams.append('search', params.search)
  
  const queryString = queryParams.toString()
  const endpoint = `/foods${queryString ? `?${queryString}` : ''}`
  
  return await makeRequest(endpoint, {
    method: 'GET',
  })
}

/**
 * Get all recipes
 */
export const getRecipes = async (params?: {
  page?: number
  limit?: number
  search?: string
}): Promise<ApiResponse<any>> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.search) queryParams.append('search', params.search)
  
  const queryString = queryParams.toString()
  const endpoint = `/recipes${queryString ? `?${queryString}` : ''}`
  
  return await makeRequest(endpoint, {
    method: 'GET',
  })
}

// ============================================
// Debug & Configuration APIs (Layer 3)
// ============================================

/**
 * Get debug information for a recommendation
 */
export const getDebugInfo = async (recommendationId: string): Promise<ApiResponse<any>> => {
  return await makeRequest(`/debug/${recommendationId}`, {
    method: 'GET',
  })
}

/**
 * Get system configuration
 */
export const getSystemConfig = async (): Promise<ApiResponse<any>> => {
  return await makeRequest('/config', {
    method: 'GET',
  })
}

/**
 * Update system configuration weights
 */
export const updateSystemConfig = async (configData: any): Promise<ApiResponse<any>> => {
  return await makeRequest('/config', {
    method: 'PUT',
    body: JSON.stringify(configData),
  })
}

// Export API base URL for reference
export { API_BASE_URL }
