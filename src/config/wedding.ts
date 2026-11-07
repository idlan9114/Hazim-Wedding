import type { WeddingConfig } from '../types/wedding'
import garden from '../assets/images/garden-placeholder.svg'
import flowers from '../assets/images/flowers-placeholder.svg'
import table from '../assets/images/table-placeholder.svg'

// Couple names, wedding date, evening schedule, and venue are confirmed.
// Keep the ISO date's UTC offset consistent with timeZone when replacing the date.
export const wedding = {
  isDemo: true,
  groom: {
    firstName: 'Hazim', fullName: 'Muhammad Hazim Muaz bin Che Mohammad Rahim', role: 'The groom',
    parents: ['Che Mohammad Rahim'],
    note: 'A new chapter, with my favourite person.',
  },
  bride: {
    firstName: 'Shafikah', fullName: 'Nor Shafikah binti Nor Azman', role: 'The bride',
    parents: ['Nor Azman'],
    note: 'A lifetime of little moments, together.',
  },
  date: '2026-12-11T19:30:00+08:00',
  // Use an IANA time zone identifier; this covers Malaysia, including Johor.
  timeZone: 'Asia/Kuala_Lumpur',
  dateLabel: '11 Disember 2026',
  weekday: 'Jumaat',
  dateShort: '11.12.2026',
  invitation: {
    greeting: 'Assalamualaikum',
    message: 'Dengan penuh kesyukuran, kami menjemput anda ke majlis perkahwinan kami yang akan berlangsung pada 11 Disember 2026, di Kota Masai Johor',
    quote: 'Dan di antara tanda-tanda yang membuktikan kekuasaannya... dijadikanNya di antara kamu (suami isteri) perasaan kasih sayang dan belas kasihan.',
    quoteAttribution: ' · Ar-Rum 30:21 ·',
  },
  events: [
    { id: 'arrival', title: 'Kehadiran Tetamu & Pengantin & Jurunikah', time: '7:30 PM', startsAt: '19:30' },
    { id: 'ceremony', title: 'Akad Nikah & Salam Restu', time: '8:00 PM', startsAt: '20:00' },
    { id: 'photographs', title: 'Sesi Bergambar bersama Keluarga & Rakan', time: '8:15 PM', startsAt: '20:15' },
    { id: 'dinner', title: 'Jamuan Makan', time: '8:30 PM', startsAt: '20:30' },
    { id: 'closing', title: 'Majlis Bersurai', time: '10:00 PM', startsAt: '22:00' },
  ],
  venue: {
    name: 'Kuasa Kaseh Kota Masai',
    address: '24a, Jalan Jambu 4, Taman Kota Masai, 81700 Pasir Gudang, Johor, Malaysia',
    mapUrl: 'https://www.google.com/maps/place/Kota+Masai+Kuasa+kaseh/@1.4924858,103.8153963,27859m/data=!3m1!1e3!4m7!3m6!1s0x31da41991f0301f1:0xc588b6436a59aa82!8m2!3d1.4897449!4d103.9521636!15sCiFrdWFzYSBrYXNlaCBldmVudCBoYWxsIGtvdGEgbWFzYWmSAQtldmVudF92ZW51ZeABAA!16s%2Fg%2F11t5_vgcxb',
    note: 'Majlis kami akan berlangsung di Kuasa Kaseh, Kota Masai, pada waktu malam. Kami menantikan kehadiran anda untuk bersama-sama memeriahkan malam bahagia kami.',
  },
  rsvp: {
    deadline: '30 November 2026',
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdd8ZgpwYWRtRDrX7WBDE8Ka8WrJxWWmeBkaHgtiiEd91kuSw/viewform?pli=1',
  },
  contribution: {
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScUh0cAAAy35LJjTHvIKPLqoDwGXL5o1fkxXo71PfFvljkvzQ/viewform',
  },
  contacts: [
    {
      id: 'hazim', name: 'Hazim Muaz', role: 'Pengantin lelaki',
      phone: '+60 11-7264 1574', email: 'hazimmuaz1574@gmail.com',
    },
    {
      id: 'shafikah', name: 'Shafikah', role: 'Pengantin perempuan',
      phone: '+60 11-1773 6417', email: 'pikaazman15@gmail.com',
    },
  ],
  gallery: [
    { id: 'garden', src: garden, alt: 'Placeholder illustration of an archway in an olive garden', caption: 'A little magic', isPlaceholder: true },
    { id: 'flowers', src: flowers, alt: 'Placeholder illustration of cream flowers in a ceramic vase', caption: 'The little things', isPlaceholder: true },
    { id: 'table', src: table, alt: 'Placeholder illustration of a wedding table with candles', caption: 'Made for memories', isPlaceholder: true },
  ],
  wishes: [
    { id: 'example-1', name: 'Family & friends', message: 'May your home always be filled with kindness, laughter, and love. So happy for you both!', isExample: true },
    { id: 'example-2', name: 'A little blessing', message: 'Wishing you a beautiful beginning and a lifetime of happiness together. Barakallahu lakuma.', isExample: true },
  ],
  music: { enabled: false, src: '/audio/demo-music.wav', title: 'Soft chimes · demo audio' },
  closingMessage: 'Some days stay with us forever. We hope you will be part of ours.',
} satisfies WeddingConfig
