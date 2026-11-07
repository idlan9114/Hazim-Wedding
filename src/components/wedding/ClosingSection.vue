<script setup lang="ts">
import { wedding } from '../../config/wedding'
import WeddingIcon from './WeddingIcon.vue'
</script>

<template>
  <footer class="page-shell pb-28 pt-20 text-center sm:pt-24">
    <WeddingIcon name="sparkle" :size="27" class="mx-auto mb-7 text-teal" />
    <p class="eyebrow mb-5">With love and gratitude</p>
    <h2 class="section-title">See you on our special day.</h2>
    <p class="mx-auto mt-6 max-w-sm text-sm leading-7 text-muted">{{ wedding.closingMessage }}</p>
    <p class="mt-9 font-display text-4xl italic text-teal">{{ wedding.groom.firstName }} & {{ wedding.bride.firstName }}</p>
    <p class="mt-5 text-[10px] uppercase tracking-[0.2em] text-muted">{{ wedding.dateLabel }}</p>
    <div class="mx-auto mb-6 mt-12 h-px w-20 bg-teal/25"></div>
    <a href="#home" class="inline-flex min-h-11 items-center gap-2 text-xs text-muted">Back to the beginning <WeddingIcon name="arrow" :size="14" /></a>
  </footer>
</template>
