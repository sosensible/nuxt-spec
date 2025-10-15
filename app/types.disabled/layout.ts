/**
 * Shared TypeScript type definitions for the dual layout system
 * This file defines the contracts for frontend and admin layout components
 */

// Layout types
export type LayoutType = 'frontend' | 'admin'

// Responsive breakpoint system
export interface BreakpointState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop'
}

// Navigation item structure
export interface NavigationItem {
  id: string
  label: string
  path: string
  icon?: string
  badge?: string | number
  children?: NavigationItem[]
  isActive?: boolean
  isVisible?: boolean
  order?: number
}

// Layout context shared between layouts
export interface LayoutContext {
  type: LayoutType
  title?: string
  description?: string
  showHeader: boolean
  showFooter: boolean
  showSidebar: boolean
  isLoading: boolean
  breakpoint: BreakpointState
}

// Frontend-specific layout configuration
export interface FrontendLayoutConfig {
  navigation: NavigationItem[]
  hero?: {
    title: string
    subtitle?: string
    showCta: boolean
    ctaText?: string
    ctaLink?: string
  }
  footer?: {
    showSocial: boolean
    showLinks: boolean
    copyright: string
  }
}

// Admin-specific layout configuration
export interface AdminLayoutConfig {
  navigation: NavigationItem[]
  sidebar: {
    isCollapsed: boolean
    isCollapsible: boolean
    width: number
    collapsedWidth: number
  }
  header: {
    showBreadcrumb: boolean
    showUserMenu: boolean
    showNotifications: boolean
    showSearch: boolean
  }
  permissions?: string[]
}

// Layout state management interface
export interface LayoutState {
  context: LayoutContext
  frontend: FrontendLayoutConfig
  admin: AdminLayoutConfig
}

// Layout component props
export interface LayoutComponentProps {
  context?: Partial<LayoutContext>
  config?: Partial<FrontendLayoutConfig> | Partial<AdminLayoutConfig>
}

// Component size variants for design system
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Component color variants based on brand palette
export type ComponentVariant
  = | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'

// Common component interface
export interface ComponentBase {
  size?: ComponentSize
  variant?: ComponentVariant
  disabled?: boolean
  loading?: boolean
  class?: string
}

// Event handlers for layout interactions
export interface LayoutEventHandlers {
  onSidebarToggle?: () => void
  onNavigationChange?: (item: NavigationItem) => void
  onBreakpointChange?: (breakpoint: BreakpointState) => void
  onLayoutChange?: (type: LayoutType) => void
}

// SEO and meta data interface
export interface PageMeta {
  title?: string
  description?: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard?: 'summary' | 'summary_large_image'
  canonical?: string
  robots?: 'index,follow' | 'noindex,nofollow' | 'index,nofollow' | 'noindex,follow'
}
