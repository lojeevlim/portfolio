<template>
  <section class="contact" id="contact">
    <div class="section-inner contact-inner" v-reveal>
      <p class="eyebrow">Contact</p>
      <h2>Let's build something together.</h2>
      <p class="body-text">Have a project in mind, or just want to talk shop? My inbox is always open.</p>
      <div class="contact-actions">
        <a href="mailto:lojeevlim@gmail.com" class="btn btn-primary">lojeevlim@gmail.com</a>
        <div class="social-links">
          <a href="https://github.com/lojeevlim" target="_blank" rel="noopener" aria-label="GitHub" title="GitHub"><Icon icon="simple-icons:github" width="20" /></a>
          <a href="https://gitlab.com/lojeelim" target="_blank" rel="noopener" aria-label="GitLab" title="GitLab"><Icon icon="simple-icons:gitlab" width="20" /></a>
          <a href="#" aria-label="LinkedIn" title="LinkedIn"><Icon icon="simple-icons:linkedin" width="20" /></a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { vReveal } from '@/composables/vReveal'
</script>
