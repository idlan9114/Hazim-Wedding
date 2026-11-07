<script setup lang="ts">
import { wedding } from '../../config/wedding'
import { vReveal } from '../../directives/reveal'
import WeddingIcon from './WeddingIcon.vue'
</script>

<template>
  <section id="our-story" class="section-space page-shell text-center py-10" aria-labelledby="couple-title">
    <p class="eyebrow mb-4">Two hearts, one beginning</p>
    <h2 id="couple-title" class="section-title">Meet the happy couple</h2>
    <div class="couple-grid mx-auto mt-12 grid max-w-4xl items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
      <template v-for="(person, index) in [wedding.groom, wedding.bride]" :key="person.role">
        <span v-if="index === 1" class="font-display text-5xl italic text-teal/60" aria-hidden="true">&</span>
        <article v-reveal="index * 220" class="px-3 py-4">
          <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-t-full border border-teal/20 bg-mist/35 font-display text-4xl text-teal" aria-hidden="true">{{ person.firstName[0] }}</div>
          <p class="eyebrow mb-3">{{ person.role }}</p>
          <h3 class="font-display text-3xl sm:text-4xl">{{ person.fullName }}</h3>
        </article>
      </template>
    </div>
    <WeddingIcon name="heart" :size="19" class="mx-auto mt-10 text-teal/70" />
  </section>
</template>
