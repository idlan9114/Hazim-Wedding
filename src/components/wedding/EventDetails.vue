<script setup lang="ts">
import { wedding } from '../../config/wedding'
import { vReveal } from '../../directives/reveal'
import WeddingIcon from './WeddingIcon.vue'
</script>

<template>
  <section id="celebration" class="section-space page-shell py-10" aria-labelledby="events-title">
    <div class="text-center">
      <p class="eyebrow mb-4">The beginning of a lifetime</p>
      <h2 id="events-title" class="section-title" lang="ms">Tatacara Majlis</h2>
      <p class="mt-5 text-sm text-muted">{{ wedding.weekday }}, {{ wedding.dateLabel }} · Malaysia time</p>
    </div>
    <ol class="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2" aria-labelledby="events-title" lang="ms">
      <li v-for="(event, index) in wedding.events" :key="event.id" v-reveal="(index % 2) * 180" class="event-card flex flex-col border border-teal/20 bg-cream p-7 last:md:col-span-2 sm:p-10">
        <div class="mb-8 flex items-center justify-between">
          <WeddingIcon :name="event.id === 'ceremony' ? 'rings' : 'sparkle'" :size="30" class="text-teal" />
          <span class="font-display text-lg text-teal/65" aria-hidden="true">0{{ index + 1 }}</span>
        </div>
        <h3 class="font-display text-3xl leading-snug">{{ event.title }}</h3>
        <p class="mb-6 mt-4 flex items-center gap-2 text-xs font-medium text-teal">
          <WeddingIcon name="clock" :size="16" />
          <time :datetime="event.startsAt">{{ event.time }}</time>
        </p>
        <p class="mt-auto border-t border-teal/15 pt-5 text-xs leading-6 text-muted">{{ wedding.venue.name }}</p>
      </li>
    </ol>
  </section>
</template>
