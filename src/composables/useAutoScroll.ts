import { onBeforeUnmount, ref } from 'vue'

const FRAME_MS = 1000 / 60

export function useAutoScroll(
  getCanvas: () => HTMLElement | null,
  getSpeed: () => number,
  onTick?: () => void,
) {
  const isAutoScrolling = ref(false)
  let timer: number | null = null

  function stop() {
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
    isAutoScrolling.value = false
  }

  function start() {
    if (isAutoScrolling.value) {
      return
    }

    isAutoScrolling.value = true
    timer = window.setInterval(() => {
      const canvas = getCanvas()
      if (!canvas) {
        stop()
        return
      }

      canvas.scrollTop += getSpeed() / 60
      onTick?.()

      if (canvas.scrollTop + canvas.clientHeight >= canvas.scrollHeight - 2) {
        stop()
      }
    }, FRAME_MS)
  }

  function toggle() {
    if (isAutoScrolling.value) {
      stop()
      return
    }
    start()
  }

  onBeforeUnmount(stop)

  return { isAutoScrolling, start, stop, toggle }
}