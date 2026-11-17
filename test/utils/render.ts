// not reviewed
import { createTestQueryClient } from '../setup'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import type { Component } from 'vue'

interface RenderOptions {
  route?: string
  props?: Record<string, unknown>
}

/** Renders a component inside the Nuxt test app with a fresh Vue Query client. */
export function renderWithProviders(
  component: Component,
  { route = '/', props }: RenderOptions = {},
) {
  return renderSuspended(component, {
    route,
    props,
    global: {
      plugins: [[VueQueryPlugin, { queryClient: createTestQueryClient() }]],
    },
  })
}
