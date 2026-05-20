import { useRef, useCallback } from 'react'
import { useApp } from '../store/AppContext.jsx'
import { playSound } from '../shared/audio.js'

export function useAudio() {
  const { state } = useApp()
  const ctxRef = useRef(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const play = useCallback((type) => {
    if (!state.audio.active) return
    try {
      playSound(getCtx(), type)
    } catch (_) {}
  }, [state.audio.active, getCtx])

  return { play }
}
