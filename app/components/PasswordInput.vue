<template>
  <UInput
    :model-value="modelValue"
    :type="showPassword ? 'text' : 'password'"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :size="size"
    :aria-label="ariaLabel"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #trailing>
      <UButton
        :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        color="neutral"
        variant="link"
        :padded="false"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        :title="showPassword ? 'Hide password' : 'Show password'"
        @click="togglePassword"
      />
    </template>
  </UInput>
</template>

<script setup lang="ts">
/**
 * Password Input Component
 * 
 * Reusable password input with visibility toggle button.
 * Wraps Nuxt UI's UInput component with password-specific features.
 */

interface Props {
  modelValue: string
  placeholder?: string
  autocomplete?: string
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Enter your password',
  autocomplete: 'current-password',
  size: 'lg',
  ariaLabel: 'Password',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const { showPassword, togglePassword } = usePasswordToggle()
</script>
