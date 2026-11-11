import { ref } from 'vue'
import { parseChapters } from '../utils/chapterParser'
import { buildBookKey, isTxtFile } from '../utils/file'
import { decodeTextFile } from '../utils/textDecoder'
import type { ChapterItem } from '../utils/types'

export function useBookFile() {
  const bookName = ref('')
  const bookLines = ref<string[]>([])
  const chapters = ref<ChapterItem[]>([])
  const currentBookKey = ref('')

  async function load(file: File): Promise<boolean> {
    if (!isTxtFile(file)) {
      return false
    }

    const text = (await decodeTextFile(file)).replace(/^\uFEFF/, '')
    bookName.value = file.name.replace(/\.txt$/i, '')
    bookLines.value = text.split(/\r?\n/)
    chapters.value = parseChapters(text)
    currentBookKey.value = buildBookKey(file)
    return true
  }

  function close() {
    bookName.value = ''
    bookLines.value = []
    chapters.value = []
    currentBookKey.value = ''
  }

  return { bookName, bookLines, chapters, currentBookKey, load, close }
}