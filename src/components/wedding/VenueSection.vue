<script setup lang="ts">
import { wedding } from '../../config/wedding'
import WeddingIcon from './WeddingIcon.vue'
import venuePhoto from '../../assets/images/kuasa kaseh.jpg'
</script>

<template>
  <section id="venue" class="page-shell pb-20 sm:pb-24" aria-labelledby="venue-title">
    <div class="venue-panel mx-auto grid max-w-4xl overflow-hidden border border-teal/20 bg-mist/40 md:grid-cols-[0.85fr_1.15fr]">
      <div class="relative h-60 overflow-hidden border-b border-teal/15 md:h-auto md:border-r md:border-b-0">
        <img :src="venuePhoto" alt="Kuasa Kaseh Kota Masai event hall entrance and sign" width="399" height="501" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover object-[center_55%]" />
      </div>
      <div class="p-7 sm:p-10">
        <p class="eyebrow mb-4" lang="ms">Tempat majlis</p>
        <h2 id="venue-title" class="font-display text-3xl leading-tight">{{ wedding.venue.name }}</h2>
        <address class="mt-4 text-sm not-italic leading-7 text-muted">{{ wedding.venue.address }}</address>
        <p class="mb-6 mt-3 text-xs leading-6 text-muted" lang="ms">{{ wedding.venue.note }}</p>
        <div class="flex justify-end">
          <a :href="wedding.venue.mapUrl" target="_blank" rel="noopener noreferrer" class="button button-outline">Open Google Maps <WeddingIcon name="arrow" :size="16" /><span class="sr-only">(opens in a new tab)</span></a>
        </div>
      </div>
    </div>
  </section>
</template>
