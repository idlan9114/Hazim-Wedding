<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useGuestWishes } from '../../composables/useGuestWishes'
import WeddingIcon from './WeddingIcon.vue'

const wishesSection = ref<HTMLElement>()
const { live, wishes, loading, saving, loadError, connectionError, canRefresh, refreshWishes, saveWish } = useGuestWishes(wishesSection)
const name = ref('')
const message = ref('')
const nameError = ref('')
const messageError = ref('')
const status = ref('')
const submitError = ref('')
const form = ref<HTMLFormElement>()
const wishesList = ref<HTMLDivElement>()
const wishesListMaxHeight = ref<string>()
const visibleWishCount = 2
let wishesResizeObserver: ResizeObserver | undefined

function updateWishesHeight() {
  const cards = wishesList.value?.querySelectorAll<HTMLElement>('.wish-card')
  if (!cards || cards.length <= visibleWishCount) {
    wishesListMaxHeight.value = undefined
    return
  }
  const first = cards[0]!.getBoundingClientRect()
  const lastVisible = cards[visibleWishCount - 1]!.getBoundingClientRect()
  wishesListMaxHeight.value = `${Math.ceil(lastVisible.bottom - first.top)}px`
}

function observeWishCards() {
  wishesResizeObserver?.disconnect()
  if (!wishesList.value) return
  wishesResizeObserver ??= new ResizeObserver(updateWishesHeight)
  wishesResizeObserver.observe(wishesList.value)
  Array.from(wishesList.value.querySelectorAll<HTMLElement>('.wish-card'))
    .slice(0, visibleWishCount)
    .forEach(card => wishesResizeObserver!.observe(card))
  updateWishesHeight()
}

onMounted(observeWishCards)
watch(() => wishes.value.slice(0, visibleWishCount).map(wish => wish.id).join(','), observeWishCards, { flush: 'post' })
onUnmounted(() => wishesResizeObserver?.disconnect())

async function submit() {
  if (saving.value) return
  status.value = ''
  submitError.value = ''
  nameError.value = name.value.trim().length < 2 ? 'Please enter at least 2 characters for your name.' : ''
  messageError.value = message.value.trim().length < 5 ? 'Please write a wish of at least 5 characters.' : ''
  if (name.value.length > 80) nameError.value = 'Please keep your name under 80 characters.'
  if (message.value.length > 300) messageError.value = 'Please keep your wish under 300 characters.'
  if (nameError.value || messageError.value) {
    await nextTick()
    form.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  try {
    await saveWish(name.value.trim(), message.value.trim())
    name.value = ''
    message.value = ''
    status.value = live
      ? 'Thank you! Your wish has been saved and shared with the couple.'
      : 'Your demo wish is visible on this page only. It will disappear when you reload and has not been sent to the couple.'
    await nextTick()
    wishesList.value?.scrollTo({ top: 0, behavior: 'auto' })
  } catch {
    submitError.value = 'Your wish could not be saved. Your message is still here; please try again.'
  }
}
</script>

<template>
  <section ref="wishesSection" id="wishes" class="section-space border-y border-ink/10 bg-mist/30 py-10" aria-labelledby="wishes-title">
    <div class="page-shell">
      <div class="mx-auto max-w-xl text-center"><p class="eyebrow mb-4">Words we will treasure</p><h2 id="wishes-title" class="section-title">A little love from you</h2><p id="wish-demo" class="mt-5 text-xs leading-7 text-muted">{{ live ? 'Leave a little love for the couple. Your name and message will be visible to other guests.' : 'Demo guest book. Example wishes are shown below. New wishes stay in memory on this page and disappear on reload; nothing is permanently saved or sent.' }}</p></div>
      <div class="mx-auto mt-10 grid max-w-5xl items-start gap-8 lg:grid-cols-2">
        <form ref="form" class="min-w-0 border border-teal/20 bg-paper p-6 sm:p-8" novalidate aria-describedby="wish-demo" @submit.prevent="submit">
          <label for="wish-name" class="form-label">Your name <span aria-hidden="true">*</span></label><input id="wish-name" v-model="name" autocomplete="name" maxlength="80" required class="form-input" placeholder="Your name" :aria-invalid="!!nameError" :aria-describedby="nameError ? 'wish-name-error' : undefined" /><p v-if="nameError" id="wish-name-error" class="form-error">{{ nameError }}</p>
          <label for="wish-message" class="form-label mt-5">Your wish for the couple <span aria-hidden="true">*</span></label><textarea id="wish-message" v-model="message" rows="4" maxlength="300" required class="form-input resize-y" placeholder="Leave a little love…" :aria-invalid="!!messageError" :aria-describedby="messageError ? 'wish-message-error wish-count' : 'wish-count'"></textarea><p v-if="messageError" id="wish-message-error" class="form-error">{{ messageError }}</p><p id="wish-count" class="mt-2 text-right text-[10px] text-muted">{{ message.length }} / 300 characters</p>
          <button type="submit" class="button button-primary mt-5 w-full" :disabled="saving" :aria-busy="saving">{{ saving ? 'Sending…' : live ? 'Send wish' : 'Add a demo wish' }} <WeddingIcon name="heart" :size="16" /></button>
          <p v-if="submitError" role="alert" class="form-error">{{ submitError }}</p>
          <p role="status" aria-live="polite" aria-atomic="true" class="form-status" :class="{ 'mt-5': status }">{{ status }}</p>
        </form>
        <div class="min-w-0">
          <p v-if="loading && !wishes.length" role="status" class="py-6 text-sm text-muted">Loading wishes…</p>
          <div v-if="loadError || connectionError" class="mb-4 border border-teal/20 bg-paper p-4 text-xs leading-6 text-muted">
            <p role="status">{{ loadError || connectionError }}</p>
            <button v-if="canRefresh" type="button" class="mt-2 inline-flex min-h-11 items-center text-teal underline" :disabled="loading" @click="refreshWishes">Refresh wishes</button>
          </div>
          <p v-if="live && !loading && !loadError && !wishes.length" class="border border-teal/15 bg-paper/75 p-6 font-display text-xl leading-relaxed">Be the first to leave a wish for the couple.</p>
          <p v-if="wishes.length > visibleWishCount" id="wishes-scroll-hint" class="sr-only">Scroll to read more wishes</p>
          <div ref="wishesList" class="wishes-list grid content-start gap-4" :style="{ maxHeight: wishesListMaxHeight }" role="region" aria-label="Guest wishes" :aria-describedby="wishes.length > visibleWishCount ? 'wishes-scroll-hint' : undefined" :tabindex="wishes.length > visibleWishCount ? 0 : undefined">
            <article v-for="wish in wishes" :key="wish.id" class="wish-card border border-teal/15 bg-paper/75 p-6 sm:p-7">
              <WeddingIcon name="heart" :size="16" class="mb-4 text-teal/70" /><p class="whitespace-pre-wrap font-display text-xl leading-relaxed">“{{ wish.message }}”</p><div class="mt-5 flex flex-wrap items-center justify-between gap-2"><p class="text-xs font-medium">{{ wish.name }}</p><span class="text-[9px] uppercase tracking-[0.12em] text-muted">{{ wish.isExample ? 'Example wish' : live ? 'With love' : 'This page only' }}</span></div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
