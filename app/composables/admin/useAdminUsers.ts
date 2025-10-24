import { ref } from 'vue'

export function useAdminUsers() {
  const users = ref([] as Array<Record<string, any>>)
  const loading = ref(false)
  const page = ref(1)
  const perPage = ref(25)
  const total = ref(0)
  const error = ref<string | null>(null)

  async function load(p = 1, q = '') {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch('/api/admin/users', {
        method: 'GET',
        params: { page: p, perPage: perPage.value, q },
      })
      users.value = res.data || []
      page.value = res.page || p
      perPage.value = res.perPage || perPage.value
      total.value = res.total || 0
    } catch (err: unknown) {
      error.value = (err as any)?.message || 'Failed to load users'
      users.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    page,
    perPage,
    total,
    error,
    load,
  }
}

export default useAdminUsers
