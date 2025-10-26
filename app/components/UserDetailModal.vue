<template>
  <UModal v-model:open="open" overlay portal>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h3 class="text-lg font-semibold">User details</h3>
          <p class="text-sm text-gray-500">ID: {{ userId }}</p>
        </div>
        <div class="flex items-center gap-2">
          <UButton variant="ghost" color="primary" size="sm" icon="i-heroicons-pencil" @click="onEdit">Edit</UButton>
          <UButton variant="ghost" color="error" size="sm" icon="i-heroicons-trash" @click="onDelete">Delete</UButton>
        </div>
      </div>
    </template>

    <template #body>
      <div v-if="loading" class="py-6">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-3" />
          <div class="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>

      <UAlert v-else-if="error" color="error" :description="errorMessage" />

      <div v-else class="space-y-4">
        <div>
          <h4 class="text-sm font-medium">{{ detail.item.name || '—' }}</h4>
          <p class="text-xs text-gray-500">{{ detail.item.email || '—' }}</p>
        </div>

        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-gray-500">Status</dt>
            <dd class="font-medium text-gray-800 dark:text-gray-200">{{ detail.item.status }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Email verified</dt>
            <dd class="font-medium text-gray-800 dark:text-gray-200">{{ detail.item.emailVerified ? 'Yes' : 'No' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Created</dt>
            <dd class="font-medium text-gray-800 dark:text-gray-200">{{ detail.item.createdAt || '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Roles</dt>
            <dd class="font-medium text-gray-800 dark:text-gray-200">{{ (detail.item.roles || []).join(', ') || '—' }}
            </dd>
          </div>
        </dl>

        <div>
          <h5 class="text-sm font-medium mb-2">Teams</h5>
          <div v-if="!detail.teams || detail.teams.length === 0" class="text-sm text-gray-500">No teams found</div>
          <ul v-else class="text-sm space-y-1">
            <li v-for="t in detail.teams" :key="t.id" class="flex items-center justify-between">
              <div>
                <div class="font-medium">{{ t.name || t.id }}</div>
                <div class="text-xs text-gray-500">{{ t.description || '' }}</div>
              </div>
              <div class="text-xs text-gray-600">{{ (t.roles || []).join(', ') }}</div>
            </li>
          </ul>
        </div>

        <div>
          <h5 class="text-sm font-medium mb-2">Raw payload</h5>
          <pre class="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded max-h-44 overflow-auto">{{ rawString }}</pre>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton variant="outline" color="neutral" size="sm" @click="open = false">Close</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import type { UserDetailResponse } from '~/types/admin'

const props = withDefaults(defineProps<{ modelValue?: boolean; userId?: string }>(), {
  modelValue: false,
  userId: undefined,
})

const emit = defineEmits(['update:modelValue', 'edit', 'delete'])

const open = ref<boolean>(props.modelValue ?? false)
const userId = ref<string | undefined>(props.userId)

const loading = ref(false)
const error = ref<unknown | null>(null)
const detail = ref<UserDetailResponse>({ item: { id: userId.value ?? '' }, teams: [], raw: {} })

const errorMessage = computed(() => (error.value instanceof Error ? error.value.message : String(error.value)))
const rawString = computed(() => JSON.stringify(detail.value?.raw ?? {}, null, 2))

watch(() => props.modelValue, (v) => { open.value = v ?? false })
watch(open, (v) => emit('update:modelValue', v))
watch(() => props.userId, (v) => { userId.value = v })

async function load() {
  if (!userId.value) return
  loading.value = true
  error.value = null
  try {
    // fetch detail
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await $fetch(`/api/admin/users/${userId.value}`) as any
    detail.value = res
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}

watch([open, () => userId.value], ([isOpen]) => {
  if (isOpen) load()
})

function onEdit() {
  if (!userId.value) return
  emit('edit', userId.value)
}

function onDelete() {
  if (!userId.value) return
  emit('delete', userId.value)
}
</script>
