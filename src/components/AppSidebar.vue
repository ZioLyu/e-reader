<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-badge">TXT</div>
      <div>
        <h1>私人阅读器</h1>
        <p>本地沉浸式阅读</p>
      </div>
    </div>

    <section class="panel">
      <h2>书架</h2>
      <div class="empty-state">
        <p>{{ bookName ? '当前阅读' : '打开一本小说开始阅读' }}</p>
        <span>{{ bookName || 'TXT 文件仅在当前设备中读取，不会上传。' }}</span>
      </div>
    </section>

    <section class="panel chapter-panel">
      <div class="panel-header">
        <h2>目录 <span v-if="chapters.length">{{ chapters.length }}</span></h2>
        <button class="ghost-button" type="button" @click="emit('select-chapter', 0)">回到开头</button>
      </div>
      <ul v-if="chapters.length" ref="chapterListRef" class="chapter-list">
        <li v-for="(chapter, index) in chapters" :key="chapter.id">
          <button
            type="button"
            class="chapter-item"
            :class="{ active: activeChapter === index }"
            @click="emit('select-chapter', index)"
          >
            <span>{{ chapter.title }}</span>
            <small>{{ index + 1 }}</small>
          </button>
        </li>
      </ul>
      <p v-else class="chapter-hint">打开 TXT 后将自动生成章节目录。</p>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ChapterItem } from '../utils/types'

const props = defineProps<{
  bookName: string
  chapters: ChapterItem[]
  activeChapter: number
}>()

const emit = defineEmits<{
  (e: 'select-chapter', index: number): void
}>()

const chapterListRef = ref<HTMLElement | null>(null)

watch(
  () => props.activeChapter,
  (index) => {
    const item = chapterListRef.value?.children.item(index) as HTMLElement | null
    item?.scrollIntoView({ block: 'nearest' })
  },
)
</script>