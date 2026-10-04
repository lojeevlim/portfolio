import { ref } from 'vue'

const theme = ref<'light' | 'dark'>('light')

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
