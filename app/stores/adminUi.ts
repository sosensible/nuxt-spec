import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminUi = defineStore('adminUi', () => {
  const selectedUserId = ref<string | null>(null)
  const showDeleteConfirm = ref(false)
  const busyMessage = ref<string | null>(null)

  function openDeleteConfirm(id: string) {
    selectedUserId.value = id
    showDeleteConfirm.value = true
  }

  function closeDeleteConfirm() {
    selectedUserId.value = null
    showDeleteConfirm.value = false
  }

  function setBusy(message?: string) {
    busyMessage.value = message ?? null
  }

  return {
    selectedUserId,
    showDeleteConfirm,
    busyMessage,
    openDeleteConfirm,
    closeDeleteConfirm,
    setBusy,
  }
})
