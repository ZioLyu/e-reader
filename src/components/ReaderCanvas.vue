<template>
  <section ref="readerCanvas" class="reader-canvas" @scroll.passive="emit('scroll')">
    <article class="reader-paper">
      <template v-if="bookName">
        <h3>{{ chapterTitle }}</h3>
        <div class="reader-content">
          <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
        </div>
        <div class="chapter-nav">
          <button type="button" class="ghost-button" :disabled="activeChapter === 0" @click="emit('previous')">
            上一章
          </button>
          <button
            type="button"
            class="ghost-button"
            :disabled="activeChapter >= chapterCount - 1"
            @click="emit('next')"
          >
            下一章
          </button>
        </div>
      </template>
      <div v-else class="welcome-state">
        <span class="welcome-label">READ AT YOUR OWN PACE</span>
        <h3>打开一部 TXT 小说</h3>
        <p>点击右上角的“打开 TXT”，即可在此阅读本地文本。系统会尝试自动识别“第一章”“Chapter 1”等常见章节标题。你也可以直接把 TXT 文件拖进窗口里打开。</p>
        <button type="button" class="primary-button" @click="emit('open-file')">选择 TXT 文件</button>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  bookName: string
  chapterTitle: string
  paragraphs: string[]
  activeChapter: number
  chapterCount: number
}>()

const emit = defineEmits<{
  (e: 'scroll'): void
  (e: 'previous'): void
  (e: 'next'): void
  (e: 'open-file'): void
}>()

const readerCanvas = ref<HTMLElement | null>(null)

function getCanvasElement(): HTMLElement | null {
  return readerCanvas.value
}

function getScrollTop(): number {
  return readerCanvas.value?.scrollTop ?? 0
}

function setScrollTop(value: number) {
  if (readerCanvas.value) {
    readerCanvas.value.scrollTop = value
  }
}

defineExpose({ getCanvasElement, getScrollTop, setScrollTop })
</script>