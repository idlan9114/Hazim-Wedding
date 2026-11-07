export interface Person {
  firstName: string
  fullName: string
  role: 'The groom' | 'The bride'
  parents: string[]
  note: string
}

export interface WeddingEvent {
  id: string
  title: string
  time: string
  startsAt: string
}

export interface GalleryPhoto {
  id: string
  src: string
  alt: string
  caption: string
  isPlaceholder: boolean
}

export interface GuestWish {
  id: string
  name: string
  message: string
  isExample: boolean
}

export interface WeddingConfig {
  isDemo: boolean
  groom: Person
  bride: Person
  date: string
  timeZone: string
  dateLabel: string
  weekday: string
  dateShort: string
  invitation: { greeting: string; message: string; quote: string; quoteAttribution: string }
  events: WeddingEvent[]
  venue: { name: string; address: string; mapUrl: string; note: string }
  rsvp: { deadline: string; formUrl: string }
  gallery: GalleryPhoto[]
  wishes: GuestWish[]
  music: { enabled: boolean; src: string; title: string }
  closingMessage: string
}
