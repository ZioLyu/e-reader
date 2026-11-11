<template>
  <header class="toolbar">
    <div>
      <h2>{{ bookName || '未打开书籍' }}</h2>
      <p>{{ bookName ? `第 ${activeChapter + 1} / ${chapterCount} 章` : '选择一个 TXT 文件后，这里会展示目录与正文。' }}</p>
    </div>
    <div class="toolbar-actions">
      <div class="scroll-controls" :class="{ disabled: !bookName }">
        <button
          type="button"
          class="auto-scroll-button"
          :class="{ active: isAutoScrolling }"
          :disabled="!bookName"
          @click="emit('toggle-auto-scroll')"
        >
          {{ isAutoScrolling ? '停止自动滚动' : '自动滚动' }}
        </button>
        <label class="speed-control" :class="{ disabled: !bookName }">
          <span>速度 {{ scrollSpeed }}px/s</span>
          <input
            v-model.number="scrollSpeed"
            type="range"
            min="20"
            max="240"
            step="10"
            :disabled="!bookName"
          />
        </label>
      </div>
      <input ref="fileInput" class="file-input" type="file" accept=".txt,text/plain" @change="handleFileChange" />
      <button type="button" class="primary-button" @click="openFilePicker">打开 TXT</button>
      <button type="button" class="ghost-button" :disabled="!bookName" @click="emit('close-book')">关闭书籍</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  bookName: string
  isAutoScrolling: boolean
  activeChapter: number
  chapterCount: number
}>()

const emit = defineEmits<{
  (e: 'toggle-auto-scroll'): void
  (e: 'file-selected', file: File): void
  (e: 'close-book'): void
}>()

const scrollSpeed = defineModel<number>('scrollSpeed', { required: true })

const fileInput = ref<HTMLInputElement | null>(null)

function openFilePicker() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) {
    emit('file-selected', file)
  }
}

defineExpose({ openFilePicker })
</script>