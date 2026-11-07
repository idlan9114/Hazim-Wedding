<script setup lang="ts">
import { nextTick, onUnmounted, ref } from 'vue'
import { wedding } from '../../config/wedding'
import type { GalleryPhoto } from '../../types/wedding'
import WeddingIcon from './WeddingIcon.vue'

const dialog = ref<HTMLDialogElement>()
const selected = ref<GalleryPhoto>()
const trigger = ref<HTMLButtonElement>()
async function showPhoto(photo: GalleryPhoto, event: MouseEvent) {
  selected.value = photo
  trigger.value = event.currentTarget as HTMLButtonElement
  await nextTick()
  dialog.value?.showModal()
  document.body.classList.add('dialog-open')
}
function closePhoto() { dialog.value?.close() }
function onClose() {
  document.body.classList.remove('dialog-open')
  trigger.value?.focus()
}
onUnmounted(() => document.body.classList.remove('dialog-open'))
</script>

<template>
  <section id="gallery" class="section-space border-y border-ink/10 bg-cream" aria-labelledby="gallery-title">
    <div class="page-shell">
      <div class="mb-10 flex flex-col justify-between gap-5 text-center md:flex-row md:items-end md:text-left">
        <div><p class="eyebrow mb-4">A glimpse of our world</p><h2 id="gallery-title" class="section-title">Little moments, big love.</h2></div>
        <p class="max-w-sm text-xs leading-6 text-muted">Placeholder illustrations awaiting our favourite photographs. Select an image for a closer look.</p>
      </div>
      <div class="gallery-grid grid gap-5 sm:grid-cols-3">
        <figure v-for="(photo, index) in wedding.gallery" :key="photo.id" class="min-w-0">
          <button class="gallery-trigger group block w-full overflow-hidden bg-mist text-left" type="button" :aria-label="`View ${photo.alt}`" @click="showPhoto(photo, $event)">
            <img :src="photo.src" :alt="photo.alt" width="640" height="800" loading="lazy" decoding="async" class="gallery-image w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
          </button>
          <figcaption class="mt-4 flex items-center justify-between gap-3"><span class="font-display text-lg italic">{{ photo.caption }}</span><span class="text-[9px] uppercase tracking-[0.1em] text-muted">{{ photo.isPlaceholder ? 'Placeholder' : `0${index + 1}` }}</span></figcaption>
        </figure>
      </div>
    </div>
    <dialog ref="dialog" class="photo-dialog rounded-t-full border border-teal/20 bg-paper p-4 text-ink shadow-xl" aria-label="Gallery image preview" @close="onClose" @click="($event.target === dialog) && closePhoto()">
      <div v-if="selected" class="relative">
        <button class="icon-button absolute right-1 top-1 z-10 border border-teal/20 bg-paper" type="button" aria-label="Close image preview" autofocus @click="closePhoto"><WeddingIcon name="close" /></button>
        <img :src="selected.src" :alt="selected.alt" width="640" height="800" class="lightbox-image mx-auto rounded-t-full object-contain" />
        <p class="pt-4 text-center font-display text-xl italic">{{ selected.caption }}</p>
        <p v-if="selected.isPlaceholder" class="mt-2 text-center text-xs text-muted">Placeholder illustration</p>
      </div>
    </dialog>
  </section>
</template>
