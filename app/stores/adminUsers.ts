/**
 * Admin Users Store
 * 
 * Manages the list of users with pagination, search, and CRUD operations
 * Interacts with /api/admin/users endpoints
 */

import { defineStore } from 'pinia'
import type { PagedResponse, UserRecord, ApiError, UpdateUserPayload } from '~/types/admin'

export interface AdminUsersState {
  items: UserRecord[]
  pageSize: number
  currentCursor: string | null
  nextCursor: string | null
  prevCursors: (string | null)[]
  totalCount: number | null
  loading: boolean
  error: string | null
  searchQuery: string
}

export const useAdminUsersStore = defineStore('adminUsers', () => {
  // State
  const items = ref<UserRecord[]>([])
  const pageSize = ref(25)
  const currentCursor = ref<string | null>(null)
  const nextCursor = ref<string | null>(null)
  const prevCursors = ref<(string | null)[]>([])
  const totalCount = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  // Actions

  /**
   * Load users with optional parameters
   */
  async function load(params: { cursor?: string | null; offset?: number | null; q?: string | null } = {}) {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      queryParams.set('pageSize', String(pageSize.value))
      
      if (params.cursor) queryParams.set('cursor', params.cursor)
      if (params.offset !== undefined && params.offset !== null) queryParams.set('offset', String(params.offset))
      if (params.q) queryParams.set('q', params.q)

      const response = await $fetch<PagedResponse<UserRecord> | ApiError>(`/api/admin/users?${queryParams.toString()}`)

      if ('error' in response) {
        error.value = response.error.message
        items.value = []
        totalCount.value = null
        nextCursor.value = null
      } else {
        items.value = response.items
        totalCount.value = response.totalCount ?? null
        nextCursor.value = response.cursor ?? null
        currentCursor.value = params.cursor ?? null
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = message
      items.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Navigate to next page
   */
  async function goNext() {
    if (!nextCursor.value) return
    
    // Push current cursor to history
    prevCursors.value.push(currentCursor.value)
    
    await load({ 
      cursor: nextCursor.value,
      q: searchQuery.value || undefined,
    })
  }

  /**
   * Navigate to previous page
   */
  async function goPrev() {
    if (prevCursors.value.length === 0) return
    
    // Pop previous cursor from history
    const prevCursor = prevCursors.value.pop() ?? null
    
    await load({ 
      cursor: prevCursor,
      q: searchQuery.value || undefined,
    })
  }

  /**
   * Change page size and reset pagination
   */
  async function setPageSize(size: number) {
    pageSize.value = size
    prevCursors.value = []
    currentCursor.value = null
    nextCursor.value = null
    
    await load({ 
      cursor: null,
      q: searchQuery.value || undefined,
    })
  }

  /**
   * Set search query and reload
   */
  async function setSearchQuery(query: string) {
    searchQuery.value = query
    prevCursors.value = []
    currentCursor.value = null
    nextCursor.value = null
    
    await load({ 
      cursor: null,
      q: query || undefined,
    })
  }

  /**
   * Refresh current page
   */
  async function refresh() {
    await load({ 
      cursor: currentCursor.value,
      q: searchQuery.value || undefined,
    })
  }

  /**
   * Update a user
   */
  async function updateUser(id: string, payload: UpdateUserPayload): Promise<boolean> {
    try {
      const response = await $fetch<{ item: UserRecord }>(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: payload,
      })
      
      // Optimistically update the local state with returned data
      const index = items.value.findIndex((item: UserRecord) => item.id === id)
      if (index !== -1) {
        items.value[index] = response.item
      }
      
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = message
      return false
    }
  }

  /**
   * Delete a user
   */
  async function deleteUser(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })
      
      // Optimistically remove from local state
      const index = items.value.findIndex((item: UserRecord) => item.id === id)
      if (index !== -1) {
        items.value.splice(index, 1)
        
        // Decrement total count if we have it
        if (totalCount.value !== null) {
          totalCount.value--
        }
      }
      
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = message
      return false
    }
  }

  // Getters (computed properties)
  const hasNextPage = computed(() => nextCursor.value !== null)
  const hasPrevPage = computed(() => prevCursors.value.length > 0)
  const isEmpty = computed(() => items.value.length === 0 && !loading.value)

  return {
    // State
    items,
    pageSize,
    currentCursor,
    nextCursor,
    prevCursors,
    totalCount,
    loading,
    error,
    searchQuery,
    
    // Getters
    hasNextPage,
    hasPrevPage,
    isEmpty,
    
    // Actions
    load,
    goNext,
    goPrev,
    setPageSize,
    setSearchQuery,
    refresh,
    updateUser,
    deleteUser,
  }
})
