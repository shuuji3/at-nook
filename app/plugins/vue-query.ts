import { VueQueryPlugin } from "@tanstack/vue-query";
import { createQueryClient } from "../utils/query-client";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient: createQueryClient() });
});
