<script setup lang="ts">
import { wedding } from '../../config/wedding'
import couplePhoto from '../../assets/images/H&A.jpeg'

const date = new Date(wedding.date)
const sealDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', timeZone: wedding.timeZone }).format(date).replaceAll('/', '.')
const sealYear = new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone: wedding.timeZone }).format(date)
</script>

<template>
  <section id="home" class="hero-section page-shell grid items-center py-12 gap-10 md:grid-cols-2 md:gap-12" aria-labelledby="hero-title">
    <div class="hero-copy text-center md:text-left">
      <p class="mb-2 font-display text-2xl italic text-muted">We're getting married</p>
      <h1 id="hero-title" class="hero-names my-5 font-display font-normal leading-[0.98] tracking-[-0.055em]">{{ wedding.groom.firstName }}<span class="block py-2 font-display text-[0.54em] italic text-teal">&</span>{{ wedding.bride.firstName }}</h1>
      <p class="mx-auto mt-7 max-w-xs text-sm leading-7 text-muted md:mx-0">A beautiful beginning.<br />A lifetime of love. A day to share with you.</p>
      <div class="my-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs tracking-[0.1em] md:justify-start">
        <span>{{ wedding.weekday }}</span><span class="h-4 w-px bg-teal/30" aria-hidden="true"></span><time :datetime="wedding.date">{{ wedding.dateLabel }}</time>
      </div>
    </div>
    <div class="hero-art relative mx-auto mb-10 w-full max-w-lg">
      <div class="hero-image-frame overflow-hidden bg-mist">
        <img :src="couplePhoto" alt="Hazim and Shafikah celebrating their graduation together" width="1080" height="719" fetchpriority="high" class="h-full w-full object-cover" />
      </div>
      <div class="hero-date-seal absolute flex flex-col items-center justify-center rounded-full border border-teal/20 bg-paper text-center shadow-sm">
        <span class="my-1 font-display text-3xl">{{ sealDate }}</span><span class="text-[10px] tracking-[0.2em]">{{ sealYear }}</span>
      </div>
    </div>
  </section>
</template>
