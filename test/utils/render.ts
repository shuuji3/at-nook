// not reviewed
import { createTestQueryClient } from '../setup'
import { VUE_QUERY_CLIENT } from '@tanstack/vue-query'
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
      provide: { [VUE_QUERY_CLIENT]: createTestQueryClient() },
    },
  })
}
