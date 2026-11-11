export async function decodeTextFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  const bom = bytes.slice(0, 4)
  if (bom[0] === 0xef && bom[1] === 0xbb && bom[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes.slice(3))
  }
  if (bom[0] === 0xff && bom[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes.slice(2))
  }
  if (bom[0] === 0xfe && bom[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(bytes.slice(2))
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    try {
      return new TextDecoder('gb18030').decode(bytes)
    } catch {
      return new TextDecoder('utf-8').decode(bytes)
    }
  }
}