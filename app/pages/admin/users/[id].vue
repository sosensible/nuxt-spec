<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-50">User details</h1>
        <p class="text-gray-600 dark:text-gray-400">Detailed information for user ID {{ userId }}</p>
      </div>

      <div class="flex items-center gap-2">
        <UButton to="/admin/users" variant="soft" color="neutral" icon="i-heroicons-arrow-left">Back</UButton>
        <UButton variant="outline" color="neutral" icon="i-heroicons-arrow-path" @click="() => refresh()">Refresh
        </UButton>
      </div>
    </div>

    <div v-if="pending" class="animate-pulse">
      <div class="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-3" />
      <div class="h-40 bg-gray-200 dark:bg-gray-800 rounded" />
    </div>

    <UAlert v-else-if="error" color="error" title="Failed to load user" :description="error.message || String(error)">
      <template #actions>
        <UButton label="Retry" @click="() => refresh()" />
      </template>
    </UAlert>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard class="col-span-2 p-6">
        <div class="flex items-start gap-4">
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-50">{{ data?.item?.name || '—' }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ data?.item?.email || '—' }}</p>

            <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-gray-500">Status</dt>
                <dd class="font-medium text-gray-800 dark:text-gray-200">{{ data?.item?.status }}</dd>
              </div>
              <div>
                <dt class="text-gray-500">Email verified</dt>
                <dd class="font-medium text-gray-800 dark:text-gray-200">{{ data?.item?.emailVerified ? 'Yes' : 'No' }}
                </dd>
              </div>
              <div>
                <dt class="text-gray-500">Created</dt>
                <dd class="font-medium text-gray-800 dark:text-gray-200">{{ data?.item?.createdAt || '—' }}</dd>
              </div>
              <div>
                <dt class="text-gray-500">Roles</dt>
                <dd class="font-medium text-gray-800 dark:text-gray-200">{{ (data?.item?.roles || []).join(', ') || '—'
                  }}
                </dd>
              </div>
            </dl>

            <div class="mt-6">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Custom attributes</h3>
              <pre
                class="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto max-h-48">{{ formattedPrefs }}</pre>
            </div>
          </div>
        </div>
      </UCard>

      <div class="space-y-4">
        <UCard class="p-4">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Teams</h3>
          <div v-if="(data?.teams || []).length === 0" class="text-sm text-gray-600 dark:text-gray-400">No teams found
          </div>
          <ul v-else class="space-y-2">
            <li v-for="t in data?.teams" :key="t.id" class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">{{ t.name || t.id }}</div>
                <div class="text-xs text-gray-500">{{ t.description || '' }}</div>
              </div>
              <div class="text-xs text-gray-600">{{ (t.roles || []).join(', ') }}</div>
            </li>
          </ul>
        </UCard>

        <UCard class="p-4">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Raw Appwrite payload</h3>
          <pre class="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto max-h-64">{{ formattedRaw }}</pre>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { UserDetailResponse } from '~/types/admin'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const userId = route.params.id as string

const { data, pending, error, refresh } = await useAsyncData<UserDetailResponse | null>(`admin-user-${userId}`, () => $fetch(`/api/admin/users/${userId}`), {
  immediate: true,
})

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

const formattedPrefs = computed(() => safeStringify(data.value?.item.customAttributes ?? {}))
const formattedRaw = computed(() => safeStringify(data.value?.raw ?? {}))
</script>
