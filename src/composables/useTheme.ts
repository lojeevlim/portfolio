import { ref } from 'vue'

const theme = ref<'light' | 'dark'>(
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
)

const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', theme.value)
}

applyTheme()

export const useTheme = () => {
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme()
  }

  return { theme, toggleTheme }
}
