<script setup lang="ts">
import { wedding } from '../../config/wedding'
import WeddingIcon from './WeddingIcon.vue'
</script>

<template>
  <section id="invitation" class="section-space border-y border-ink/10 bg-mist/35 text-center py-10" aria-labelledby="invitation-title">
    <div class="page-shell max-w-3xl">
      <WeddingIcon name="sparkle" :size="28" class="mx-auto mb-7 text-teal" />
      <p class="eyebrow mb-5">Bismillahirrahmanirrahim</p>
      <h2 id="invitation-title" class="section-title">A day made sweeter<br />with you there.</h2>
      <p class="mb-5 mt-7 text-sm font-medium">{{ wedding.invitation.greeting }}</p>
      <p class="mx-auto max-w-xl text-sm leading-8 text-muted">{{ wedding.invitation.message }}</p>
      <blockquote class="mt-10 font-display text-xl italic leading-relaxed text-teal">“{{ wedding.invitation.quote }}”<cite class="mt-3 block font-sans text-[10px] not-italic uppercase tracking-[0.18em] text-muted">{{ wedding.invitation.quoteAttribution }}</cite></blockquote>
    </div>
  </section>
</template>
