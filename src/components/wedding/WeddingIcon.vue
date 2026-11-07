<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })
const paths: Record<string, string> = {
  arrow: 'M7 17 17 7M7 7h10v10',
  down: 'm6 9 6 6 6-6',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  music: 'M9 18V5l12-2v13M9 9l12-2M9 18a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3ZM21 16a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3Z',
  pause: 'M8 4v16M16 4v16',
  close: 'm6 6 12 12M6 18 18 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  check: 'm5 12 4 4L19 6',
  sparkle: 'm12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z',
  rings: 'M15 14a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM21 14a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM9 3l3-2 3 2-3 4-3-4Z',
}
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path :d="paths[name] ?? paths.heart" />
  </svg>
</template>
