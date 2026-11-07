<script setup lang="ts">
import { vReveal } from '../directives/reveal'
import WeddingHero from '../components/wedding/WeddingHero.vue'
import InvitationMessage from '../components/wedding/InvitationMessage.vue'
import CoupleSection from '../components/wedding/CoupleSection.vue'
import CountdownTimer from '../components/wedding/CountdownTimer.vue'
import EventDetails from '../components/wedding/EventDetails.vue'
import VenueSection from '../components/wedding/VenueSection.vue'
import RSVPForm from '../components/wedding/RSVPForm.vue'
import GuestWishes from '../components/wedding/GuestWishes.vue'
import ClosingSection from '../components/wedding/ClosingSection.vue'
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to invitation</a>
  <main id="main-content" tabindex="-1">
    <WeddingHero />
    <InvitationMessage v-reveal />
    <CoupleSection v-reveal />
    <CountdownTimer v-reveal />
    <EventDetails v-reveal />
    <VenueSection v-reveal />
    <RSVPForm v-reveal />
    <GuestWishes v-reveal />
  </main>
  <ClosingSection v-reveal />
</template>
