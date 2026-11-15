import { VueQueryPlugin } from "@tanstack/vue-query";
import { createQueryClient } from "../lib/query-client";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient: createQueryClient() });
});
