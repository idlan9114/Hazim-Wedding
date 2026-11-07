<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { vReveal } from '../directives/reveal'
import InvitationEnvelope from '../components/wedding/InvitationEnvelope.vue'
import WeddingHero from '../components/wedding/WeddingHero.vue'
import InvitationMessage from '../components/wedding/InvitationMessage.vue'
import CoupleSection from '../components/wedding/CoupleSection.vue'
import CountdownTimer from '../components/wedding/CountdownTimer.vue'
import EventDetails from '../components/wedding/EventDetails.vue'
import VenueSection from '../components/wedding/VenueSection.vue'
import RSVPForm from '../components/wedding/RSVPForm.vue'
import GuestWishes from '../components/wedding/GuestWishes.vue'
import ContactSection from '../components/wedding/ContactSection.vue'
import ClosingSection from '../components/wedding/ClosingSection.vue'

const opened = ref(false)
const revealing = ref(false)
const mainContent = ref<HTMLElement>()

async function openInvitation() {
  opened.value = true
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'instant' })
  mainContent.value?.focus({ preventScroll: true })
}
</script>

<template>
  <InvitationEnvelope v-if="!opened" @opening="revealing = true" @open="openInvitation" />
  <div v-if="revealing || opened" class="invitation-content" :class="{ 'invitation-revealing': !opened }" :inert="!opened" :aria-hidden="!opened ? true : undefined">
    <a class="skip-link" href="#main-content">Skip to invitation</a>
    <main id="main-content" ref="mainContent" tabindex="-1">
      <WeddingHero class="hero-unwrapped" />
      <InvitationMessage v-reveal />
      <CoupleSection v-reveal />
      <CountdownTimer v-reveal />
      <EventDetails v-reveal />
      <VenueSection v-reveal />
      <RSVPForm v-reveal />
      <GuestWishes v-reveal />
      <ContactSection v-reveal />
    </main>
    <ClosingSection v-reveal />
  </div>
</template>

<style scoped>
.invitation-revealing { height: calc(100svh - clamp(1rem, 4vw, 4rem)); overflow: hidden; }
.hero-unwrapped :deep(.hero-copy > *), .hero-unwrapped :deep(.hero-art), .hero-unwrapped :deep(.hero-date-seal) { animation: none; }
</style>
