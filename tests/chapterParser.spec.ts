import { describe, expect, it } from 'vitest'
import { getChapterLines, parseChapters } from '../src/utils/chapterParser'

describe('parseChapters', () => {
  it('recognizes chinese chapter titles and records start lines', () => {
    const text = ['第一章 起点', '', '正文一', '第二章 转折', '正文二'].join('\n')
    const chapters = parseChapters(text)

    expect(chapters).toHaveLength(2)
    expect(chapters[0]).toMatchObject({ id: 1, title: '第一章 起点', startIndex: 0 })
    expect(chapters[1]).toMatchObject({ id: 2, title: '第二章 转折', startIndex: 3 })
  })

  it('recognizes english chapter titles case-insensitively', () => {
    const chapters = parseChapters('chapter 1\nhello\nCHAPTER 2\nworld')
    expect(chapters.map((chapter) => chapter.title)).toEqual(['chapter 1', 'CHAPTER 2'])
  })

  it('recognizes prologue markers', () => {
    const chapters = parseChapters('楔子\n引子\n正文')
    expect(chapters[0]).toMatchObject({ title: '楔子', startIndex: 0 })
  })

  it('ignores over-long paragraphs even if they contain a marker', () => {
    const longLine = `第1章 ${'很长的正文'.repeat(20)}`
    const chapters = parseChapters(`${longLine}\n第一章 正常标题`)

    expect(chapters).toHaveLength(1)
    expect(chapters[0].title).toBe('第一章 正常标题')
  })

  it('falls back to a single body chapter when no marker exists', () => {
    expect(parseChapters('只有正文\n第二行')).toEqual([{ id: 1, title: '正文', startIndex: 0 }])
  })
})

describe('getChapterLines', () => {
  it('skips the title line and slices up to the next chapter', () => {
    const lines = ['第一章 起点', '正文一', '', '第二章 转折', '正文二']
    const chapters = parseChapters(lines.join('\n'))

    expect(getChapterLines(lines, chapters, 0)).toEqual(['正文一'])
    expect(getChapterLines(lines, chapters, 1)).toEqual(['正文二'])
  })

  it('keeps every line when there is only one chapter', () => {
    const lines = ['只有正文', '第二行']
    const chapters = parseChapters(lines.join('\n'))
    expect(getChapterLines(lines, chapters, 0)).toEqual(['只有正文', '第二行'])
  })

  it('returns an empty list for out-of-range indexes', () => {
    expect(getChapterLines(['第一章 起点'], parseChapters('第一章 起点'), 5)).toEqual([])
  })
})