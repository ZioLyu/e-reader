export interface ChapterItem {
  id: number
  title: string
  startIndex: number
}

export interface ReadingPosition {
  activeChapter: number
  scrollTop: number
}