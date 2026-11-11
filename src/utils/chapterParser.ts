import type { ChapterItem } from './types'

const CHAPTER_MARKER = /第[0-9零一二三四五六七八九十百千两]+[章节回卷部篇]/
const ENGLISH_CHAPTER_MARKER = /chapter\s+\d+/i
const SPECIAL_CHAPTER_START = /^(序章|楔子)/

const CHAPTER_TITLE_MAX_LENGTH = 40

function isChapterTitle(text: string): boolean {
  if (SPECIAL_CHAPTER_START.test(text)) {
    return true
  }

  if (text.length > CHAPTER_TITLE_MAX_LENGTH) {
    return false
  }

  return CHAPTER_MARKER.test(text) || ENGLISH_CHAPTER_MARKER.test(text)
}

export function parseChapters(text: string): ChapterItem[] {
  const lines = text.split(/\r?\n/)
  const chapters: ChapterItem[] = []

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) {
      return
    }

    if (isChapterTitle(trimmed)) {
      chapters.push({
        id: chapters.length + 1,
        title: trimmed,
        startIndex: index,
      })
    }
  })

  if (!chapters.length) {
    return [{ id: 1, title: '正文', startIndex: 0 }]
  }

  return chapters
}

export function getChapterLines(lines: string[], chapters: ChapterItem[], index: number): string[] {
  const chapter = chapters[index]
  if (!chapter) {
    return []
  }

  const start = chapter.startIndex + (chapters.length > 1 ? 1 : 0)
  const end = chapters[index + 1]?.startIndex ?? lines.length

  return lines
    .slice(start, end)
    .map((line) => line.trim())
    .filter(Boolean)
}