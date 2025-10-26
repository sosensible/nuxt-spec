/**
 * usePagedUsers Composable
 * 
 * Manages paginated user list with cursor navigation, search, and filtering
 * Calls GET /api/admin/users endpoint
 */

import type { PagedResponse, UserRecord, ApiError, UpdateUserPayload } from '~/types/admin'

export interface PagedUsersState {
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

export interface PagedUsersActions {
  load: (params?: { cursor?: string | null; offset?: number | null; q?: string | null }) => Promise<void>
  goNext: () => Promise<void>
  goPrev: () => Promise<void>
  setPageSize: (size: number) => Promise<void>
  setSearchQuery: (query: string) => Promise<void>
  refresh: () => Promise<void>
  updateUser: (id: string, payload: UpdateUserPayload) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
}

export function usePagedUsers(initialPageSize = 25) {
  const state = reactive<PagedUsersState>({
    items: [],
    pageSize: initialPageSize,
    currentCursor: null,
    nextCursor: null,
    prevCursors: [],
    totalCount: null,
    loading: false,
    error: null,
    searchQuery: '',
  })

  /**
   * Load users with optional parameters
   */
  async function load(params: { cursor?: string | null; offset?: number | null; q?: string | null } = {}) {
    state.loading = true
    state.error = null

    try {
      const queryParams = new URLSearchParams()
      queryParams.set('pageSize', String(state.pageSize))
      
      if (params.cursor) queryParams.set('cursor', params.cursor)
      if (params.offset !== undefined && params.offset !== null) queryParams.set('offset', String(params.offset))
      if (params.q) queryParams.set('q', params.q)

      const response = await $fetch<PagedResponse<UserRecord> | ApiError>(`/api/admin/users?${queryParams.toString()}`)

      if ('error' in response) {
        state.error = response.error.message
        state.items = []
        state.totalCount = null
        state.nextCursor = null
      } else {
        state.items = response.items
        state.totalCount = response.totalCount ?? null
        state.nextCursor = response.cursor ?? null
        state.currentCursor = params.cursor ?? null
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      state.error = message
      state.items = []
    } finally {
      state.loading = false
    }
  }

  /**
   * Navigate to next page
   */
  async function goNext() {
    if (!state.nextCursor) return
    
    // Push current cursor to history
    state.prevCursors.push(state.currentCursor)
    
    await load({ 
      cursor: state.nextCursor,
      q: state.searchQuery || undefined,
    })
  }

  /**
   * Navigate to previous page
   */
  async function goPrev() {
    if (state.prevCursors.length === 0) return
    
    // Pop previous cursor from history
    const prevCursor = state.prevCursors.pop() ?? null
    
    await load({ 
      cursor: prevCursor,
      q: state.searchQuery || undefined,
    })
  }

  /**
   * Change page size and reset pagination
   */
  async function setPageSize(size: number) {
    state.pageSize = size
    state.prevCursors = []
    state.currentCursor = null
    state.nextCursor = null
    
    await load({ 
      cursor: null,
      q: state.searchQuery || undefined,
    })
  }

  /**
   * Set search query and reload
   */
  async function setSearchQuery(query: string) {
    state.searchQuery = query
    state.prevCursors = []
    state.currentCursor = null
    state.nextCursor = null
    
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
      cursor: state.currentCursor,
      q: state.searchQuery || undefined,
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
      const index = state.items.findIndex((item: UserRecord) => item.id === id)
      if (index !== -1) {
        state.items[index] = response.item
      }
      
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      state.error = message
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
      const index = state.items.findIndex((item: UserRecord) => item.id === id)
      if (index !== -1) {
        state.items.splice(index, 1)
        
        // Decrement total count if we have it
        if (state.totalCount !== null) {
          state.totalCount--
        }
      }
      
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      state.error = message
      return false
    }
  }

  // Initialize
  load({ cursor: null })

  return {
    state: readonly(state),
    load,
    goNext,
    goPrev,
    setPageSize,
    setSearchQuery,
    refresh,
    updateUser,
    deleteUser,
  }
}
