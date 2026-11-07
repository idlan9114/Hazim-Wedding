<script setup lang="ts">
import { wedding } from '../../config/wedding'
import WeddingIcon from './WeddingIcon.vue'
</script>

<template>
  <section id="rsvp" class="section-space page-shell" aria-labelledby="rsvp-title" lang="ms">
    <div class="event-card mx-auto max-w-4xl border border-teal/20 bg-cream px-6 text-center sm:px-12 py-10">
      <div class="mx-auto mb-6 flex h-16 w-14 items-center justify-center rounded-t-full border border-teal/20 bg-paper text-teal" aria-hidden="true">
        <WeddingIcon name="heart" :size="25" />
      </div>
      <p class="eyebrow mb-4">Pengesahan kehadiran</p>
      <h2 id="rsvp-title" class="section-title">Sudi hadir meraikan kami?</h2>
      <p class="mx-auto mt-5 max-w-md text-sm leading-8 text-muted">Kami berbesar hati menjemput anda meraikan hari bahagia kami. Sila sahkan kehadiran anda sebelum <strong class="font-medium text-ink">-{{ wedding.rsvp.deadline }}-</strong>.</p>
      <div class="mx-auto mt-8 flex max-w-sm flex-col items-center gap-3">
        <a :href="wedding.rsvp.formUrl" target="_blank" rel="noopener noreferrer" class="button button-primary w-full sm:w-auto" aria-describedby="rsvp-link-note">
          Sahkan kehadiran <WeddingIcon name="arrow" :size="17" />
        </a>
      </div>
      <p class="mt-8 font-display text-lg italic text-teal">Kehadiran anda amat kami hargai.</p>
    </div>
  </section>
</template>
