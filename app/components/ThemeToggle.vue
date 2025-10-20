<script setup lang="ts">
/**
 * ThemeToggle Component
 * 
 * A button component that toggles between light and dark themes.
 * Uses Nuxt UI's useColorMode() composable for theme management.
 * 
 * Features:
 * - Displays appropriate icon (sun/moon) based on current theme
 * - Accessible with ARIA attributes (role, aria-checked, aria-label)
 * - Keyboard navigable (Enter/Space keys supported by UButton)
 * - Smooth theme transitions provided by Nuxt UI
 * - Supports system preference detection
 * 
 * @example
 * <ThemeToggle />
 */

const colorMode = useColorMode()

// Computed properties for dark mode state
const isDark = computed(() => colorMode.value === 'dark')

// Icon based on current color mode
const toggleIcon = computed(() =>
  isDark.value ? 'i-heroicons-moon' : 'i-heroicons-sun'
)

// Toggle between light and dark modes
const toggle = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// Accessible label
const ariaLabel = computed(() =>
  `Switch to ${isDark.value ? 'light' : 'dark'} mode`
)
</script>

<template>
  <UButton
:icon="toggleIcon" variant="ghost" color="neutral" role="switch" :aria-label="ariaLabel"
    :aria-checked="isDark" @click="toggle" />
</template>
