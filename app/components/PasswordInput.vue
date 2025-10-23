<template>
  <UInput :model-value="modelValue" :type="showPassword ? 'text' : 'password'" :placeholder="placeholder"
    :autocomplete="autocomplete" :size="size" :aria-label="ariaLabel"
    @update:model-value="$emit('update:modelValue', $event)">
    <template #trailing>
      <UButton :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" color="neutral" variant="link" :padded="false"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        :title="showPassword ? 'Hide password' : 'Show password'" @click="togglePassword" />
    </template>
  </UInput>
</template>

<script setup lang="ts">
/**
 * Password Input Component
 *
 * Reusable password input with visibility toggle button.
 * Wraps Nuxt UI's UInput component with password-specific features.
 * Includes an eye icon button to toggle password visibility.
 *
 * @component
 * @example
 * <PasswordInput
 *   v-model="password"
 *   placeholder="Enter password"
 *   autocomplete="new-password"
 * />
 */

interface Props {
  /** The password value (v-model) */
  modelValue: string
  /** Placeholder text for the input */
  placeholder?: string
  /** HTML autocomplete attribute value */
  autocomplete?: string
  /** Size of the input field */
  size?: 'sm' | 'md' | 'lg'
  /** ARIA label for accessibility */
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
