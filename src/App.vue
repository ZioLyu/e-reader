<template>
  <div
    class="app-shell"
    :class="{ dragging: isDragging }"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <AppSidebar
      :book-name="bookName"
      :chapters="chapters"
      :active-chapter="activeChapter"
      @select-chapter="handleChapterSelect"
    />

    <main class="reader">
      <ReaderToolbar
        ref="toolbarRef"
        v-model:scroll-speed="scrollSpeed"
        :book-name="bookName"
        :is-auto-scrolling="isAutoScrolling"
        :active-chapter="activeChapter"
        :chapter-count="chapters.length"
        @toggle-auto-scroll="toggleAutoScroll"
        @file-selected="loadTextFile"
        @close-book="clearBook"
      />

      <ReaderCanvas
        ref="readerCanvasRef"
        :book-name="bookName"
        :chapter-title="currentChapter.title"
        :paragraphs="currentContent"
        :active-chapter="activeChapter"
        :chapter-count="chapters.length"
        @scroll="handleReaderScroll"
        @previous="goToPreviousChapter"
        @next="goToNextChapter"
        @open-file="openFilePicker"
      />
    </main>

    <DropOverlay v-if="isDragging" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import DropOverlay from './components/DropOverlay.vue'
import ReaderCanvas from './components/ReaderCanvas.vue'
import ReaderToolbar from './components/ReaderToolbar.vue'
import { useAutoScroll } from './composables/useAutoScroll'
import { useBookFile } from './composables/useBookFile'
import { useReadingPosition } from './composables/useReadingPosition'
import { getChapterLines } from './utils/chapterParser'
import type { ReadingPosition } from './utils/types'

const { bookName, chapters, bookLines, currentBookKey, load, close } = useBookFile()
const readingPosition = useReadingPosition()

const readerCanvasRef = ref<InstanceType<typeof ReaderCanvas> | null>(null)
const toolbarRef = ref<InstanceType<typeof ReaderToolbar> | null>(null)

const activeChapter = ref(0)
const isDragging = ref(false)
const scrollSpeed = ref(60)

const { isAutoScrolling, toggle: toggleAutoScroll, stop: stopAutoScroll } = useAutoScroll(
  () => readerCanvasRef.value?.getCanvasElement() ?? null,
  () => scrollSpeed.value,
  () => savePosition(),
)

const currentChapter = computed(
  () => chapters.value[activeChapter.value] ?? { id: 0, title: '正文', startIndex: 0 },
)
const currentContent = computed(() =>
  getChapterLines(bookLines.value, chapters.value, activeChapter.value),
)

function currentPosition(): ReadingPosition {
  return {
    activeChapter: activeChapter.value,
    scrollTop: readerCanvasRef.value?.getScrollTop() ?? 0,
  }
}

function savePosition() {
  readingPosition.write(currentPosition)
}

function scheduleSavePosition() {
  readingPosition.scheduleSave(currentPosition)
}

function restoreReadingPosition() {
  const saved = readingPosition.read()
  readingPosition.hasSavedPosition.value = Boolean(saved)

  const maxChapterIndex = Math.max(chapters.value.length - 1, 0)
  const targetChapter = Math.min(Math.max(saved?.activeChapter ?? 0, 0), maxChapterIndex)
  activeChapter.value = targetChapter

  window.requestAnimationFrame(() => {
    readerCanvasRef.value?.setScrollTop(saved?.scrollTop ?? 0)
  })
}

async function loadTextFile(file: File) {
  stopAutoScroll()
  savePosition()

  const loaded = await load(file)
  if (!loaded) {
    return
  }

  readingPosition.setBookKey(currentBookKey.value)
  isDragging.value = false
  window.requestAnimationFrame(restoreReadingPosition)
}

function handleChapterSelect(index: number) {
  savePosition()
  activeChapter.value = index

  window.requestAnimationFrame(() => {
    readerCanvasRef.value?.setScrollTop(0)
    scheduleSavePosition()
  })
}

function goToPreviousChapter() {
  if (activeChapter.value > 0) {
    handleChapterSelect(activeChapter.value - 1)
  }
}

function goToNextChapter() {
  if (activeChapter.value < chapters.value.length - 1) {
    handleChapterSelect(activeChapter.value + 1)
  }
}

function handleReaderScroll() {
  if (!bookName.value || isAutoScrolling.value) {
    return
  }

  scheduleSavePosition()
}

function openFilePicker() {
  toolbarRef.value?.openFilePicker()
}

function handleDragEnter(event: DragEvent) {
  if (event.dataTransfer?.types.includes('Files')) {
    isDragging.value = true
  }
}

function handleDragLeave(event: DragEvent) {
  if ((event.relatedTarget as Node | null) === null) {
    isDragging.value = false
  }
}

async function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await loadTextFile(file)
  }
}

function clearBook() {
  stopAutoScroll()
  savePosition()
  readingPosition.cancel()
  readingPosition.reset()
  close()
  activeChapter.value = 0
  isDragging.value = false
  readerCanvasRef.value?.setScrollTop(0)
}

onBeforeUnmount(() => {
  savePosition()
  readingPosition.cancel()
})
</script>