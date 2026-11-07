<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { wedding } from '../../config/wedding'

const now = ref(Date.now())
const target = new Date(wedding.date).getTime()
const remaining = computed(() => Math.max(0, target - now.value))
const units = computed(() => [
  { label: 'Days', value: Math.floor(remaining.value / 86400000) },
  { label: 'Hours', value: Math.floor(remaining.value / 3600000) % 24 },
  { label: 'Minutes', value: Math.floor(remaining.value / 60000) % 60 },
  { label: 'Seconds', value: Math.floor(remaining.value / 1000) % 60 },
])
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <section class="bg-teal py-14 text-paper sm:py-16" aria-labelledby="countdown-title">
    <div class="page-shell text-center">
      <p class="eyebrow mb-4 text-paper/75">Every moment brings us closer</p>
      <h2 id="countdown-title" class="font-display text-3xl sm:text-4xl">{{ remaining > 0 ? 'Counting down to forever' : 'Our forever has begun' }}</h2>
      <div class="countdown-grid mx-auto mt-9 grid max-w-xl grid-cols-4" role="timer" aria-label="Time remaining until the wedding">
        <div v-for="unit in units" :key="unit.label" class="border-r border-paper/20 px-2 last:border-r-0 sm:px-5">
          <span class="countdown-number block font-display leading-none tabular-nums">{{ String(unit.value).padStart(2, '0') }}</span>
          <span class="mt-3 block text-[9px] uppercase tracking-[0.15em] text-paper/75 sm:text-[10px]">{{ unit.label }}</span>
        </div>
      </div>
      <p class="mt-7 text-xs text-paper/75">{{ wedding.dateLabel }}</p>
    </div>
  </section>
</template>
