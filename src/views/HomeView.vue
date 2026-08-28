<template>
  <div class="portfolio-page">
    <TopNav :unstuck="navUnstuck" />

    <main>
      <HeroSection />
      <NumbersSection />
      <BlobSection ref="blobSectionRef" />
      <ContactSection />
    </main>

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import '@/assets/portfolio.css'
import TopNav from '@/components/portfolio/TopNav.vue'
import HeroSection from '@/components/portfolio/HeroSection.vue'
import NumbersSection from '@/components/portfolio/NumbersSection.vue'
import BlobSection from '@/components/portfolio/BlobSection.vue'
import ContactSection from '@/components/portfolio/ContactSection.vue'
import SiteFooter from '@/components/portfolio/SiteFooter.vue'

const navUnstuck = ref(false)
const blobSectionRef = ref<InstanceType<typeof BlobSection> | null>(null)

let observer: IntersectionObserver | null = null

onMounted(() => {
  const blobEl = document.getElementById('blob')
  if (!blobEl || !('IntersectionObserver' in window)) return

  // nav releases its sticky pin while the blob section is in view, and
  // selected items clear out automatically once you scroll away from it
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        navUnstuck.value = entry.isIntersecting
        if (!entry.isIntersecting) {
          blobSectionRef.value?.clearActiveItems()
        }
      })
    },
    { threshold: 0.2 },
  )
  observer.observe(blobEl)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>
