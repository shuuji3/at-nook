<script setup lang="ts">

const router = useRouter();
const { refresh } = useSession();
const started = ref(false);

onMounted(() => {
  if (started.value) return;
  started.value = true;

  const hash = window.location.hash;
  // the fragment carries the authorization code, so drop it from the address bar
  window.history.replaceState(null, "", window.location.pathname + window.location.search);

  const complete = async () => {
    try {
      await finishLogin(hash);
      refresh();
      await router.replace("/");
    } catch {
      await router.replace("/?loginFailed=1");
    }
  };

  void complete();
});
</script>

<template>
  <p class="callback">opening your notebook…</p>
</template>
