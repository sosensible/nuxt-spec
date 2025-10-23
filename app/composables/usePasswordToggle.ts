/**
 * Password visibility toggle composable
 * 
 * Provides state and toggle function for password field visibility
 * 
 * @example
 * ```vue
 * <script setup>
 * const { showPassword, togglePassword } = usePasswordToggle()
 * </script>
 * 
 * <template>
 *   <UInput :type="showPassword ? 'text' : 'password'" />
 *   <button @click="togglePassword">Toggle</button>
 * </template>
 * ```
 */
export function usePasswordToggle() {
  const showPassword = ref(false)

  function togglePassword() {
    showPassword.value = !showPassword.value
  }

  return {
    showPassword: readonly(showPassword),
    togglePassword,
  }
}
