<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { wedding } from '../../config/wedding'

const emit = defineEmits<{ opening: []; open: [] }>()
const opening = ref(false)
let openingTimer: ReturnType<typeof setTimeout> | undefined

const botanicalStem = 'M18 282C45 235 65 181 91 130S133 49 155 18'
const botanicalLeaves = 'M38 244C15 235 9 214 12 197C35 204 44 222 38 244ZM51 217C78 218 97 201 103 181C79 180 60 195 51 217ZM66 181C41 175 30 155 33 135C57 141 69 160 66 181ZM82 148C108 149 127 131 132 112C109 113 91 128 82 148ZM101 111C79 103 71 84 76 65C97 72 107 91 101 111ZM119 79C143 80 160 65 165 46C143 46 127 60 119 79ZM142 38C128 27 127 11 135 0C149 10 152 25 142 38Z'

function openInvitation() {
  if (opening.value) return
  opening.value = true
  emit('opening')
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    emit('open')
    return
  }
  openingTimer = setTimeout(() => emit('open'), 900)
}

onUnmounted(() => clearTimeout(openingTimer))
</script>

<template>
  <section class="invitation-envelope" :class="{ 'is-opening': opening }" aria-label="Wedding invitation envelope">
    <div class="envelope-bottom">
      <svg class="envelope-botanical envelope-botanical-bottom" viewBox="0 0 180 300" aria-hidden="true">
        <path :d="botanicalStem" fill="none" />
        <path :d="botanicalLeaves" />
      </svg>
    </div>
    <div class="envelope-top">
      <svg class="envelope-botanical envelope-botanical-top" viewBox="0 0 180 300" aria-hidden="true">
        <path :d="botanicalStem" fill="none" />
        <path :d="botanicalLeaves" />
      </svg>
      <svg class="envelope-outline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 0 36 L 50 50 L 100 36" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" />
      </svg>
    </div>

    <button
      type="button"
      class="envelope-trigger"
      :disabled="opening"
      :aria-busy="opening"
      aria-label="Open wedding invitation"
      aria-describedby="envelope-help"
      @click="openInvitation"
    >
      <span class="envelope-seal" aria-hidden="true">{{ wedding.groom.firstName.charAt(0) }}<span>&amp;</span>{{ wedding.bride.firstName.charAt(0) }}</span>
    </button>
    <p id="envelope-help" class="sr-only">{{ opening ? 'Opening your invitation…' : 'Tap to open your invitation' }}</p>
  </section>
</template>

<style scoped>
.invitation-envelope {
  --envelope-paper:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Cpath fill='%23ffffff' opacity='.045' filter='url(%23grain)' d='M0 0h180v180H0z'/%3E%3C/svg%3E"),
    radial-gradient(ellipse at 0% 0%, color-mix(in srgb, var(--color-mist) 8%, transparent), transparent 55%),
    linear-gradient(120deg, var(--color-teal), var(--color-teal-deep));
  position: fixed;
  inset: 0;
  z-index: 40;
  width: min(100%, 1280px);
  margin-inline: auto;
  overflow: hidden;
  perspective: 1600px;
  color: white;
  text-align: center;
}
.envelope-top, .envelope-bottom { position: absolute; inset: 0; pointer-events: none; }
.envelope-bottom { z-index: 1; background: var(--envelope-paper); clip-path: polygon(0 36%, 50% 50%, 100% 36%, 100% 100%, 0 100%); }
.envelope-top { z-index: 2; transform-origin: center top; backface-visibility: hidden; }
.envelope-top::before { content: ''; position: absolute; inset: 0; background: var(--envelope-paper); clip-path: polygon(0 0, 100% 0, 100% 36%, 50% 50%, 0 36%); }
.envelope-bottom::before, .envelope-top::after { content: ''; position: absolute; inset: 14px; border: 1px solid rgb(255 255 255 / 40%); }
.envelope-top::after { clip-path: polygon(0 0, 100% 0, 100% 36%, 50% 50%, 0 36%); }
.envelope-botanical { position: absolute; width: clamp(150px, 24vw, 250px); height: auto; overflow: visible; fill: rgb(255 255 255 / 22%); stroke: currentColor; stroke-width: 1; stroke-linecap: round; stroke-linejoin: round; opacity: 0.2; }
.envelope-botanical-top { top: -45px; left: -20px; transform: rotate(180deg); }
.envelope-botanical-bottom { right: -20px; bottom: -45px; }
.envelope-outline { position: absolute; inset: 0; width: 100%; height: 100%; }
.envelope-names { position: absolute; top: 19%; left: 0; width: 100%; margin: 0; padding-inline: 1.5rem; font-family: var(--font-display); font-size: clamp(1.6rem, 5.5vw, 3rem); font-weight: 400; line-height: 1.3; letter-spacing: -0.025em; }
.envelope-names > span { padding-inline: 0.15em; font-style: italic; }
.envelope-trigger { position: absolute; inset: 0; z-index: 3; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; color: inherit; touch-action: manipulation; }
.envelope-trigger:focus-visible { outline: 2px solid white; outline-offset: -10px; }
.envelope-trigger:focus-visible .envelope-seal { outline: 2px solid white; outline-offset: 5px; }
.envelope-trigger:disabled { opacity: 1; cursor: default; }
.envelope-seal { position: absolute; top: 50%; left: 50%; display: flex; align-items: center; justify-content: center; width: clamp(54px, 14vw, 72px); aspect-ratio: 1; border: 4px double #bca37b; border-radius: 50%; color: var(--color-paper); background: var(--color-teal); box-shadow: 0 3px 8px rgb(0 0 0 / 16%); font-family: var(--font-display); font-size: clamp(17px, 4vw, 23px); transform: translate(-50%, -50%); }
.envelope-seal > span { padding-inline: 2px; font-size: 0.65em; font-style: italic; color: #d8c6a5; }
@media (prefers-reduced-motion: no-preference) {
  .envelope-top { transition: transform 700ms cubic-bezier(0.4, 0, 0.2, 1); }
  .envelope-bottom { transition: transform 750ms 100ms cubic-bezier(0.4, 0, 0.2, 1); }
  .envelope-seal { transition: opacity 180ms, scale 250ms; }
  .is-opening .envelope-top { transform: rotateX(110deg); }
  .is-opening .envelope-bottom { transform: translateY(100%); }
  .is-opening .envelope-seal { opacity: 0; scale: 0.85; }
}
</style>
