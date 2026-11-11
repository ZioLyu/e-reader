import { ref } from 'vue'
import type { ReadingPosition } from '../utils/types'

const SAVE_DEBOUNCE_MS = 120

export function useReadingPosition() {
  const hasSavedPosition = ref(false)
  let bookKey = ''
  let saveTimer: number | null = null

  function setBookKey(key: string) {
    bookKey = key
  }

  function reset() {
    cancel()
    bookKey = ''
    hasSavedPosition.value = false
  }

  function read(): ReadingPosition | null {
    if (!bookKey) {
      return null
    }

    try {
      const raw = window.localStorage.getItem(bookKey)
      if (!raw) {
        return null
      }

      const parsed = JSON.parse(raw) as Partial<ReadingPosition>
      if (typeof parsed.activeChapter !== 'number' || typeof parsed.scrollTop !== 'number') {
        return null
      }

      return { activeChapter: parsed.activeChapter, scrollTop: parsed.scrollTop }
    } catch {
      return null
    }
  }

  function write(getPosition: () => ReadingPosition) {
    if (!bookKey) {
      return
    }

    try {
      window.localStorage.setItem(bookKey, JSON.stringify(getPosition()))
      hasSavedPosition.value = true
    } catch {
      hasSavedPosition.value = false
    }
  }

  function cancel() {
    if (saveTimer !== null) {
      window.clearTimeout(saveTimer)
      saveTimer = null
    }
  }

  function scheduleSave(getPosition: () => ReadingPosition) {
    if (!bookKey) {
      return
    }

    cancel()
    saveTimer = window.setTimeout(() => {
      write(getPosition)
      saveTimer = null
    }, SAVE_DEBOUNCE_MS)
  }

  return { hasSavedPosition, setBookKey, reset, read, write, scheduleSave, cancel }
}