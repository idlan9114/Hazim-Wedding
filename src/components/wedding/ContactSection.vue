<script setup lang="ts">
import { wedding } from '../../config/wedding'
import WeddingIcon from './WeddingIcon.vue'
</script>

<template>
  <section id="contact" class="contact-section section-space border-b border-ink/10" aria-labelledby="contact-title" lang="ms">
    <div class="page-shell">
      <div class="mx-auto max-w-xl text-center">
        <WeddingIcon name="mail" :size="27" class="mx-auto mb-6 text-teal" />
        <p class="eyebrow mb-4">Kami sedia membantu</p>
        <h2 id="contact-title" class="section-title">Hubungi kami</h2>
        <p class="mx-auto mt-5 max-w-md text-sm leading-7 text-muted">Jika ada sebarang pertanyaan, bolehlah menghubungi kami melalui:</p>
      </div>

      <div class="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        <article v-for="contact in wedding.contacts" :key="contact.id" class="contact-card min-w-0 border border-teal/20 bg-paper p-6 sm:p-8" :aria-labelledby="`contact-${contact.id}`">
          <div class="mb-7 flex items-start justify-between gap-4">
            <div>
              <p class="eyebrow mb-3 text-muted">{{ contact.role }}</p>
              <h3 :id="`contact-${contact.id}`" class="font-display text-3xl italic text-teal">{{ contact.name }}</h3>
            </div>
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-teal/15 bg-mist/40 text-teal" aria-hidden="true">
              <WeddingIcon name="heart" :size="18" />
            </span>
          </div>

          <a :href="`tel:${contact.phone.replace(/[^\d+]/g, '')}`" class="contact-link" :aria-label="`Telefon ${contact.name}: ${contact.phone}`">
            <WeddingIcon name="phone" :size="18" class="shrink-0 text-teal/75" />
            <span class="min-w-0 flex-1">
              <span class="contact-label">Telefon</span>
              <span class="contact-detail">{{ contact.phone }}</span>
            </span>
            <WeddingIcon name="arrow" :size="14" class="shrink-0 text-teal/60" />
          </a>
          <a :href="`mailto:${contact.email}`" class="contact-link" :aria-label="`E-mel ${contact.name}: ${contact.email}`">
            <WeddingIcon name="mail" :size="18" class="shrink-0 text-teal/75" />
            <span class="min-w-0 flex-1">
              <span class="contact-label">E-mel</span>
              <span class="contact-detail">{{ contact.email }}</span>
            </span>
            <WeddingIcon name="arrow" :size="14" class="shrink-0 text-teal/60" />
          </a>
        </article>
      </div>
      <p class="mt-8 text-center font-display text-lg italic text-teal">Kami berbesar hati untuk membantu anda.</p>
    </div>
  </section>
</template>

<style scoped>
.contact-section { padding-top: 4rem; background: color-mix(in srgb, var(--color-cream) 45%, var(--color-paper)); }
.contact-card { border-radius: 2px 2px 28px 2px; }
.contact-link { display: flex; align-items: center; gap: 0.85rem; min-height: 76px; padding: 0.9rem 0.25rem; border-top: 1px solid color-mix(in srgb, var(--color-teal) 14%, transparent); text-decoration: none; }
.contact-link:hover { background: color-mix(in srgb, var(--color-mist) 35%, transparent); }
.contact-label { display: block; margin-bottom: 0.35rem; color: var(--color-muted); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; }
.contact-detail { display: block; overflow-wrap: anywhere; font-size: 13px; line-height: 1.6; color: var(--color-ink); }
@media (min-width: 640px) { .contact-section { padding-top: 6rem; } }
</style>
