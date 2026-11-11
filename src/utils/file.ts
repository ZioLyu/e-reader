export function isTxtFile(file: File): boolean {
  return /\.txt$/i.test(file.name) || file.type === 'text/plain'
}

export function buildBookKey(file: File): string {
  return `txt-reader:position:${encodeURIComponent(file.name)}:${file.size}:${file.lastModified}`
}