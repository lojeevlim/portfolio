<template>
  <section class="numbers" id="numbers">
    <div class="section-inner" v-reveal>
      <div class="section-head">
        <p class="eyebrow">By the numbers</p>
        <h2>Numbers that reflect real work.</h2>
      </div>
      <div class="numbers-grid">
        <div class="number-card"><strong>5+ yrs</strong><span>Professional software engineering experience</span></div>
        <div class="number-card"><strong>2</strong><span>Companies, full-stack roles</span></div>
        <div class="number-card"><strong>3rd</strong><span>Place, Startup Contest 2024</span></div>
        <div class="number-card"><strong>12</strong><span>Core technologies across the stack</span></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { vReveal } from '@/composables/vReveal'
</script>
