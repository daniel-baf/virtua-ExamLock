import { useEffect, useRef } from 'react'

export function useRaf({ running, onTick, deps = [] }) {
  const rafRef = useRef(null)
  const lastTsRef = useRef(null)

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
      return
    }

    function loop(ts) {
      const dt = lastTsRef.current == null ? 0 : ts - lastTsRef.current
      lastTsRef.current = ts
      onTick(dt, ts)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
    }
  }, [running, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps
}
