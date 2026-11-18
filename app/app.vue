<template>
  <div class="site">
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <SiteFooter />
  </div>
</template>

<style scoped>
.site {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
