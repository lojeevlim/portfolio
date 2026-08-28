<template>
  <nav class="top-nav" :class="{ unstuck }">
    <div class="top-nav-inner">
      <a href="#top" class="nav-logo"><span class="nav-logo-mark"></span>Lojee.dev</a>
      <!-- <ul class="nav-links">
        <li><a href="#contact">Contact</a></li>
      </ul> -->
      <div class="nav-right">
        <button
          class="theme-toggle"
          type="button"
          aria-label="Toggle light and dark mode"
          title="Toggle theme"
          @click="toggleTheme"
        >
          <Icon icon="lucide:sun" class="theme-icon sun" width="15" />
          <Icon icon="lucide:moon" class="theme-icon moon" width="15" />
        </button>
        <a href="#contact" class="nav-cta btn-primary">Get in Touch</a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useTheme } from '@/composables/useTheme'

defineProps<{
  unstuck: boolean
}>()

const { toggleTheme } = useTheme()
</script>
