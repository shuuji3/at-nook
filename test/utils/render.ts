// not reviewed
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { render } from "@testing-library/vue";
import { defineComponent, h, type Component } from "vue";
import { RouterView, createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";
import Avatar from "~/components/avatar.vue";
import Cover from "~/components/cover.vue";
import EmbedNote from "~/components/embed-note.vue";
import Entry from "~/components/entry.vue";
import GroupSidebar from "~/components/group-sidebar.vue";
import NotebookHeader from "~/components/notebook-header.vue";
import NotebookShell from "~/components/notebook-shell.vue";
import PersonTile from "~/components/person-tile.vue";
import Photo from "~/components/photo.vue";
import PhotoViewer from "~/components/photo-viewer.vue";
import RichText from "~/components/rich-text.vue";
import Shelf from "~/components/shelf.vue";
import VideoPrint from "~/components/video-print.vue";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const NuxtLinkStub = defineComponent({
  props: { to: { type: [String, Object], required: true } },
  setup(props, { slots }) {
    return () =>
      h(
        "a",
        {
          href:
            typeof props.to === "string"
              ? props.to
              : (props.to as { path?: string }).path,
        },
        slots.default?.(),
      );
  },
});

/** components Nuxt would auto-import; vitest has no auto-import pass. */
const AUTO_COMPONENTS = {
  Avatar,
  Cover,
  EmbedNote,
  Entry,
  GroupSidebar,
  NotebookHeader,
  NotebookShell,
  PersonTile,
  Photo,
  PhotoViewer,
  RichText,
  Shelf,
  VideoPrint,
};

interface RenderOptions {
  route?: string;
  path?: string;
  routes?: RouteRecordRaw[];
  props?: Record<string, unknown>;
}

/** Renders a component with a fresh Vue Query client, router, and Nuxt auto-imports. */
export const renderWithProviders = async (
  component: Component,
  { route = "/", path = "/:pathMatch(.*)*", routes, props }: RenderOptions = {},
) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: routes ?? [{ path, component: { template: "<div />" } }],
  });
  await router.push(route);
  await router.isReady();

  const result = render(component, {
    props,
    global: {
      plugins: [[VueQueryPlugin, { queryClient: createTestQueryClient() }], router],
      components: AUTO_COMPONENTS,
      stubs: {
        Avatar: true,
        NuxtLink: NuxtLinkStub,
        NuxtPage: RouterView,
        NuxtRouteAnnouncer: true,
      },
    },
  });

  return { ...result, router };
};
