<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { wedding } from '../../config/wedding'
import WeddingIcon from './WeddingIcon.vue'

const audio = ref<HTMLAudioElement>()
const playing = ref(false)
const error = ref('')
const pending = ref(false)
async function toggle() {
  if (!audio.value || pending.value) return
  error.value = ''
  if (playing.value) { audio.value.pause(); return }
  pending.value = true
  try { await audio.value.play() } catch { error.value = 'Music could not play. Please check the audio file and try again.' }
  finally { pending.value = false }
}
onUnmounted(() => audio.value?.pause())
</script>

<template>
  <div v-if="wedding.music.enabled" class="music-control fixed bottom-5 right-5 z-30 flex max-w-[calc(100%-2.5rem)] flex-col items-end gap-2">
    <audio ref="audio" :src="wedding.music.src" loop preload="none" @play="playing = true" @pause="playing = false" @error="error = 'The music file is unavailable. Replace it in the wedding configuration.'"></audio>
    <p v-if="error" role="status" class="max-w-64 border border-teal/20 bg-paper p-3 text-xs leading-5 shadow-sm">{{ error }}</p>
    <button type="button" class="music-button flex min-h-11 items-center gap-3 rounded-full border border-teal/25 bg-paper px-4 py-3 text-xs shadow-md" :disabled="pending" :aria-pressed="playing" :aria-label="playing ? 'Pause background music' : 'Play demo background music'" :title="wedding.music.title" @click="toggle"><WeddingIcon :name="playing ? 'pause' : 'music'" :size="17" /><span>{{ playing ? 'Music on' : 'Demo music' }}</span><span class="h-1.5 w-1.5 rounded-full" :class="playing ? 'bg-teal' : 'bg-teal/30'" aria-hidden="true"></span></button>
  </div>
</template>
