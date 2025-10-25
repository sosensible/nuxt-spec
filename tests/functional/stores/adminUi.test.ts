import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminUi } from '../../../app/stores/adminUi'

describe('adminUi store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('open and close delete confirm', () => {
    const store = useAdminUi()
    store.openDeleteConfirm('u1')
    expect(store.selectedUserId).toBe('u1')
    expect(store.showDeleteConfirm).toBe(true)
    store.closeDeleteConfirm()
    expect(store.selectedUserId).toBeNull()
    expect(store.showDeleteConfirm).toBe(false)
  })
})
