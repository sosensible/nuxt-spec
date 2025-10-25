// Frontend TypeScript examples for consuming the server-side proxy
// Uses the types in `../contracts/types.d.ts`

import type { PagedResponse, UserRecord, UpdateUserPayload, ApiError } from './types';

// Simple fetch wrapper for the proxy GET /api/admin/users
export async function fetchUsers(params: { pageSize?: number; cursor?: string; offset?: number; q?: string }): Promise<PagedResponse<UserRecord> | ApiError> {
  const url = new URL('/api/admin/users', window.location.origin);
  if (params.pageSize) url.searchParams.set('pageSize', String(params.pageSize));
  if (params.cursor) url.searchParams.set('cursor', params.cursor);
  if (params.offset !== undefined) url.searchParams.set('offset', String(params.offset));
  if (params.q) url.searchParams.set('q', params.q);

  const res = await fetch(url.toString(), { credentials: 'same-origin' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { code: res.status, message: res.statusText } }));
    return err as ApiError;
  }
  const body = await res.json();
  return body as PagedResponse<UserRecord>;
}

// Update user via proxy PATCH /api/admin/users/:id
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<{ item?: UserRecord } | ApiError> {
  const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });
  if (!res.ok) return (await res.json()) as ApiError;
  return (await res.json()) as { item: UserRecord };
}

// Delete user via proxy DELETE /api/admin/users/:id
export async function deleteUser(id: string): Promise<null | ApiError> {
  const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  if (res.status === 204) return null;
  return (await res.json()) as ApiError;
}

// Example composable / helper to manage paged list with cursor navigation
export function createPagedUsersStore(initialPageSize = 25) {
  // cursors: stack for previous pages; currentCursor is the cursor used to load current page
  const state = {
    items: [] as UserRecord[],
    pageSize: initialPageSize,
    currentCursor: '' as string | null,
    nextCursor: '' as string | null,
    prevCursors: [] as (string | null)[],
    totalCount: null as number | null,
    loading: false,
    error: null as string | null,
  };

  async function load(params: { cursor?: string | null; offset?: number | null; q?: string | null } = {}) {
    state.loading = true;
    state.error = null;
    try {
      const resp = await fetchUsers({ pageSize: state.pageSize, cursor: params.cursor || undefined, offset: params.offset ?? undefined, q: params.q ?? undefined });
      if ('error' in resp) {
        state.error = resp.error.message;
      } else {
        state.items = resp.items;
        state.totalCount = resp.totalCount ?? null;
        // Save nextCursor from response (may be null)
        state.nextCursor = resp.cursor ?? null;
        // Set currentCursor
        state.currentCursor = params.cursor ?? null;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      state.error = msg;
    } finally {
      state.loading = false;
    }
  }

  async function goNext() {
    // If nextCursor is present, push currentCursor to prevCursors and load next
    state.prevCursors.push(state.currentCursor);
    await load({ cursor: state.nextCursor });
  }

  async function goPrev() {
    // Pop last cursor and load it; if null, load first page
    const prev = state.prevCursors.pop() ?? null;
    await load({ cursor: prev });
  }

  async function setPageSize(size: number) {
    state.pageSize = size;
    // reset cursors when page size changes
    state.prevCursors = [];
    state.currentCursor = null;
    state.nextCursor = null;
    await load({ cursor: null });
  }

  // Initialize
  void load({ cursor: null });

  return {
    state,
    load,
    goNext,
    goPrev,
    setPageSize,
    updateUser,
    deleteUser,
  };
}
