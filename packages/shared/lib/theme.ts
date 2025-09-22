// Theme utilities and consistent styling patterns
// Use these utilities to ensure consistent theming across components

export const themeStyles = {
  // Page layouts
  page: {
    background: "bg-background",
    fullScreen: "min-h-screen bg-background",
    container: "container mx-auto px-4 py-8",
  },

  // Cards and containers
  card: {
    default: "bg-card border border-border rounded-lg shadow-sm",
    elevated: "bg-card border border-border rounded-lg shadow-lg",
    interactive: "bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow",
  },

  // Text styles
  text: {
    primary: "text-foreground",
    secondary: "text-muted-foreground", 
    accent: "text-accent-foreground",
    heading: "text-foreground font-semibold",
    subheading: "text-muted-foreground",
    error: "text-destructive",
    success: "text-green-600 dark:text-green-400",
  },

  // Interactive elements
  button: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border text-foreground hover:bg-accent hover:text-accent-foreground",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-accent",
  },

  // Form elements
  input: {
    default: "bg-background border border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring",
    error: "bg-background border border-destructive text-foreground focus:ring-2 focus:ring-destructive",
  },

  // Status indicators
  status: {
    info: "bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
    success: "bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100", 
    warning: "bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100",
    error: "bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
  },

  // Loading states
  loading: {
    spinner: "animate-spin rounded-full border-2 border-primary border-t-transparent",
    skeleton: "bg-muted animate-pulse rounded",
    overlay: "bg-background/80 backdrop-blur-sm",
  },

  // Modal/Dialog overlays
  overlay: {
    backdrop: "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
    modal: "bg-card border border-border rounded-lg shadow-2xl",
  },

  // Navigation elements
  nav: {
    header: "bg-card border-b border-border",
    link: "text-muted-foreground hover:text-foreground transition-colors",
    activeLink: "text-foreground font-medium",
  },
} as const;

// Utility function to combine theme classes
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Common component patterns
export const commonPatterns = {
  // Header with title and actions
  pageHeader: (title: string) => `
    <div class="${themeStyles.nav.header}">
      <div class="${themeStyles.page.container}">
        <h1 class="text-2xl font-bold ${themeStyles.text.primary}">${title}</h1>
      </div>
    </div>
  `,

  // Info banner pattern
  infoBanner: (content: string) => `
    <div class="${themeStyles.status.info} p-4 rounded-lg">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-5 h-5 mt-0.5">ℹ️</div>
        <div class="text-sm">${content}</div>
      </div>
    </div>
  `,

  // Loading state pattern
  loadingState: (message: string) => `
    <div class="flex items-center gap-3 p-4 ${themeStyles.card.default}">
      <div class="${themeStyles.loading.spinner} h-4 w-4"></div>
      <span class="${themeStyles.text.secondary}">${message}</span>
    </div>
  `,
};

// Theme validation (for development)
export function validateThemeUsage(className: string): boolean {
  const hardcodedColors = [
    'text-gray-', 'bg-gray-', 'border-gray-',
    'text-white', 'bg-white', 
    'text-black', 'bg-black',
    'bg-blue-50', 'text-blue-700',
  ];

  const hasHardcodedColors = hardcodedColors.some(color => className.includes(color));
  
  if (hasHardcodedColors && process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ Hardcoded color detected in className: ${className}`);
    console.warn('Consider using theme variables instead for proper dark mode support');
  }

  return !hasHardcodedColors;
}