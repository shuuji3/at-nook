import { ref, watch, type Ref } from 'vue'

/** Returns `value` once it has stopped changing for `delay` milliseconds. */
export function useDebouncedValue<T>(source: Ref<T>, delay: number): Ref<T> {
  const debounced = ref(source.value) as Ref<T>

  watch(source, (newValue, _oldValue, onCleanup) => {
    const timer = setTimeout(() => {
      debounced.value = newValue
    }, delay)
    onCleanup(() => clearTimeout(timer))
  })

  return debounced
}
