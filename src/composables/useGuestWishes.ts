import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { wedding } from '../config/wedding'
import type { GuestWish } from '../types/wedding'
import { getSupabaseClient, hasSupabaseSettings, supabaseConfigurationError } from '../lib/supabase'

interface WishRow {
  id: string
  name: string
  message: string
  created_at: string
}

const columns = 'id,name,message,created_at'
const toWish = (row: WishRow): GuestWish => ({ id: row.id, name: row.name, message: row.message, isExample: false })
function isWishRow(value: unknown): value is WishRow {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return ['id', 'name', 'message', 'created_at'].every(key => typeof row[key] === 'string')
}

export function useGuestWishes(section: Ref<HTMLElement | undefined>) {
  const live = hasSupabaseSettings
  const canRefresh = live && !supabaseConfigurationError
  const wishes = ref<GuestWish[]>(live ? [] : [...wedding.wishes])
  const loading = ref(canRefresh)
  const saving = ref(false)
  const loadError = ref(supabaseConfigurationError)
  const connectionError = ref('')
  const records = new Map<string, WishRow>()
  let changesDuringRead: Map<string, WishRow | null> | undefined
  let refreshInFlight: Promise<void> | undefined
  let client: SupabaseClient | null = null
  let channel: RealtimeChannel | undefined
  let observer: IntersectionObserver | undefined
  let fallback: ReturnType<typeof setTimeout> | undefined
  let disconnecting = Promise.resolve()
  let disposed = false
  let inView = false
  let active = false
  let activation = 0

  function publishRecords() {
    wishes.value = [...records.values()]
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || b.id.localeCompare(a.id))
      .map(toWish)
  }

  function upsertWish(row: WishRow) {
    changesDuringRead?.set(row.id, row)
    records.set(row.id, row)
    publishRecords()
  }

  function removeWish(id: string) {
    changesDuringRead?.set(id, null)
    records.delete(id)
    publishRecords()
  }

  async function refreshWishes() {
    if (!canRefresh || disposed) return
    if (refreshInFlight) return refreshInFlight
    loading.value = true
    const changes = new Map<string, WishRow | null>()
    changesDuringRead = changes
    refreshInFlight = (async () => {
      const database = await getSupabaseClient()
      if (!database) throw new Error('Guest book unavailable')
      const { data, error } = await database.from('guest_wishes')
        .select(columns).order('created_at', { ascending: false }).order('id', { ascending: false })
        .abortSignal(AbortSignal.timeout(12000))
      if (disposed) return
      if (error || !Array.isArray(data) || !data.every(isWishRow)) throw error ?? new Error('Invalid wishes response')
      const snapshot = new Map(data.map(row => [row.id, row]))
      // Keep changes received while this snapshot was downloading.
      changes.forEach((row, id) => { if (row) snapshot.set(id, row); else snapshot.delete(id) })
      records.clear()
      snapshot.forEach((row, id) => records.set(id, row))
      publishRecords()
      loadError.value = ''
    })().catch(() => {
      if (!disposed) loadError.value = 'Wishes could not be loaded. Please try again.'
    }).finally(() => {
      changesDuringRead = undefined
      refreshInFlight = undefined
      if (!disposed) loading.value = false
    })
    return refreshInFlight
  }

  async function saveWish(name: string, message: string) {
    if (saving.value) return
    saving.value = true
    try {
      if (!live) {
        wishes.value.unshift({ id: crypto.randomUUID(), name, message, isExample: false })
        return
      }
      const database = await getSupabaseClient()
      if (!database) throw new Error('Guest book unavailable')
      const { data, error } = await database.from('guest_wishes')
        .insert({ name, message }).select(columns)
        .abortSignal(AbortSignal.timeout(12000)).single()
      if (error || !isWishRow(data)) throw error ?? new Error('Invalid saved wish')
      if (!disposed) upsertWish(data)
      // The insert already returned the saved row; do not download the list again.
    } finally {
      if (!disposed) saving.value = false
    }
  }

  function clearFallback() {
    clearTimeout(fallback)
    fallback = undefined
  }

  function stopRealtime() {
    ++activation
    clearFallback()
    const previous = channel
    const database = client
    channel = undefined
    if (previous && database) {
      disconnecting = disconnecting.then(async () => {
        await database.removeChannel(previous)
        if (database.getChannels().length === 0) await database.realtime.disconnect()
      }).catch(() => {})
    }
  }

  async function startRealtime() {
    const version = ++activation
    try {
      const database = await getSupabaseClient()
      await disconnecting
      if (disposed || !active || version !== activation) return
      if (!database) throw new Error('Guest book unavailable')
      client = database
      let fallbackReadStarted = false
      function readWithoutRealtime() {
        if (fallbackReadStarted) return
        fallbackReadStarted = true
        void refreshWishes()
      }
      // Ordinary reads still work if a live connection is slow or unavailable.
      fallback = setTimeout(() => {
        if (active && version === activation) readWithoutRealtime()
      }, 1200)
      channel = database.channel('wedding-guest-wishes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_wishes' }, payload => {
          if (disposed || !active || version !== activation) return
          if (payload.eventType === 'DELETE' && typeof payload.old.id === 'string') {
            removeWish(payload.old.id)
          } else if (isWishRow(payload.new)) {
            upsertWish(payload.new)
          } else {
            void refreshWishes()
          }
        })
        .subscribe(state => {
          if (disposed || !active || version !== activation) return
          if (state === 'SUBSCRIBED') {
            clearFallback()
            fallbackReadStarted = true
            connectionError.value = ''
            // One snapshot after joining also covers changes missed while away.
            void refreshWishes()
          } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') {
            clearFallback()
            connectionError.value = 'Live updates are temporarily unavailable. Refresh the wishes to see the latest messages.'
            readWithoutRealtime()
          }
        })
    } catch {
      if (!disposed && active && version === activation) {
        loading.value = false
        loadError.value = 'Wishes could not be loaded. Please try again.'
      }
    }
  }

  function updateActivity() {
    const next = inView && !document.hidden
    if (disposed || next === active) return
    active = next
    if (active) void startRealtime()
    else stopRealtime()
  }

  onMounted(() => {
    if (!canRefresh) return
    document.addEventListener('visibilitychange', updateActivity)
    if (section.value && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting)
        updateActivity()
      }, { rootMargin: '400px 0px' })
      observer.observe(section.value)
    } else {
      inView = true
      updateActivity()
    }
  })

  onUnmounted(() => {
    disposed = true
    active = false
    observer?.disconnect()
    document.removeEventListener('visibilitychange', updateActivity)
    stopRealtime()
  })

  return { live, wishes, loading, saving, loadError, connectionError, canRefresh, refreshWishes, saveWish }
}
