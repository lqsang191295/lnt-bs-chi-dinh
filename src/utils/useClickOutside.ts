import { useEffect, useRef } from 'react'

/**
 * Custom hook để detect click outside element
 * @param callback - Function được gọi khi click outside
 * @param enabled - Có enable click outside detection không
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  enabled: boolean = true
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!enabled) return

    const handleClickOutside = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    // Thêm event listener
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [callback, enabled])

  return ref
}

/**
 * Hook để detect click outside với options nâng cao
 */
export function useClickOutsideAdvanced<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  options: {
    enabled?: boolean
    ignoreElements?: string[] // CSS selectors của elements cần ignore
    excludeRefs?: React.RefObject<HTMLElement>[] // Refs của elements cần exclude
  } = {}
) {
  const ref = useRef<T>(null)
  const { enabled = true, ignoreElements = [], excludeRefs = [] } = options

  useEffect(() => {
    if (!enabled) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node

      // Kiểm tra nếu click vào chính element
      if (ref.current && ref.current.contains(target)) {
        return
      }

      // Kiểm tra các exclude refs
      for (const excludeRef of excludeRefs) {
        if (excludeRef.current && excludeRef.current.contains(target)) {
          return
        }
      }

      // Kiểm tra các ignore elements
      for (const selector of ignoreElements) {
        const element = document.querySelector(selector)
        if (element && element.contains(target)) {
          return
        }
      }

      // Nếu không match với bất kỳ điều kiện nào trên, gọi callback
      callback()
    }

    // Thêm event listeners
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [callback, enabled, ignoreElements, excludeRefs])

  return ref
}
