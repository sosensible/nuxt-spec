/**
 * Admin-specific TypeScript type definitions
 * This file defines types specific to the admin layout and interface
 */

import type { NavigationItem, ComponentSize, ComponentVariant } from './layout'

// Admin dashboard widget types
export interface AdminWidget {
  id: string
  title: string
  type: 'chart' | 'metric' | 'table' | 'list' | 'custom'
  size: 'small' | 'medium' | 'large' | 'full'
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  data?: unknown
  config?: Record<string, unknown>
  isVisible: boolean
  permissions?: string[]
}

// Admin table configuration
export interface AdminTableColumn {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  type?: 'text' | 'number' | 'date' | 'boolean' | 'actions' | 'custom'
  formatter?: (value: unknown, row: Record<string, unknown>) => string
  component?: string
}

export interface AdminTableConfig {
  columns: AdminTableColumn[]
  pagination?: {
    enabled: boolean
    pageSize: number
    showSizeSelect: boolean
    showInfo: boolean
  }
  selection?: {
    enabled: boolean
    multiple: boolean
    showSelectAll: boolean
  }
  actions?: {
    enabled: boolean
    items: AdminActionItem[]
  }
  filters?: AdminFilterConfig[]
  sorting?: {
    enabled: boolean
    defaultSort?: {
      column: string
      direction: 'asc' | 'desc'
    }
  }
}

// Admin form configuration
export interface AdminFormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'custom'
  required?: boolean
  placeholder?: string
  helpText?: string
  validation?: {
    rules: string[]
    messages?: Record<string, string>
  }
  options?: { label: string, value: unknown }[]
  component?: string
  size?: ComponentSize
  disabled?: boolean
  readonly?: boolean
  conditional?: {
    field: string
    value: unknown
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  }
}

export interface AdminFormConfig {
  title?: string
  description?: string
  fields: AdminFormField[]
  layout?: 'vertical' | 'horizontal' | 'grid'
  submitText?: string
  cancelText?: string
  showReset?: boolean
  validation?: {
    validateOnBlur?: boolean
    validateOnInput?: boolean
    showInlineErrors?: boolean
  }
}

// Admin filter system
export interface AdminFilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'range'
  options?: { label: string, value: unknown }[]
  defaultValue?: unknown
  placeholder?: string
  multiple?: boolean
}

// Admin action items (buttons, dropdowns, etc.)
export interface AdminActionItem {
  id: string
  label: string
  icon?: string
  variant?: ComponentVariant
  size?: ComponentSize
  disabled?: boolean
  loading?: boolean
  permissions?: string[]
  action: 'navigate' | 'modal' | 'confirm' | 'custom'
  target?: string
  handler?: (item?: unknown) => void | Promise<void>
  children?: AdminActionItem[]
}

// Admin notification system
export interface AdminNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  timestamp: Date
  isRead: boolean
  isSticky?: boolean
  action?: {
    label: string
    handler: () => void
  }
  data?: Record<string, unknown>
}

// Admin user interface
export interface AdminUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  permissions: string[]
  lastLogin?: Date
  isActive: boolean
  preferences?: {
    theme?: 'light' | 'dark' | 'auto'
    language?: string
    timezone?: string
    sidebarCollapsed?: boolean
    dashboardLayout?: AdminWidget[]
  }
}

// Admin sidebar configuration
export interface AdminSidebarConfig {
  navigation: NavigationItem[]
  user?: AdminUser
  isCollapsed: boolean
  isCollapsible: boolean
  showToggle: boolean
  showUserMenu: boolean
  width: {
    expanded: number
    collapsed: number
  }
  breakpoints: {
    mobile: number
    tablet: number
  }
}

// Admin header configuration
export interface AdminHeaderConfig {
  title?: string
  showBreadcrumb: boolean
  showSearch: boolean
  showNotifications: boolean
  showUserMenu: boolean
  height: number
  actions?: AdminActionItem[]
  breadcrumb?: {
    separator: string
    showHome: boolean
    items: Array<{
      label: string
      path?: string
    }>
  }
}

// Admin page layout configuration
export interface AdminPageConfig {
  title: string
  description?: string
  showHeader: boolean
  showBreadcrumb: boolean
  headerActions?: AdminActionItem[]
  permissions?: string[]
  meta?: {
    refreshInterval?: number
    autoSave?: boolean
    confirmExit?: boolean
  }
}

// Admin data loading states
export interface AdminLoadingState {
  isLoading: boolean
  isRefreshing: boolean
  isSaving: boolean
  isDeleting: boolean
  error?: string | null
  lastUpdated?: Date
}

// Admin permissions and roles
export interface AdminPermission {
  id: string
  name: string
  description?: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'admin' | 'custom'
  conditions?: Record<string, unknown>
}

export interface AdminRole {
  id: string
  name: string
  description?: string
  permissions: string[]
  isSystem: boolean
  isActive: boolean
  users?: number
}

// Admin API response types
export interface AdminApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  meta?: Record<string, unknown>
}

// Admin modal configuration
export interface AdminModalConfig {
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  persistent?: boolean
  showFooter?: boolean
  footerActions?: AdminActionItem[]
  component?: string
  props?: Record<string, unknown>
}

// Admin toast/alert configuration
export interface AdminToastConfig {
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
  persistent?: boolean
  showClose?: boolean
  actions?: AdminActionItem[]
}
