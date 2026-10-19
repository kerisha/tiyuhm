<script setup lang="ts">
useHead({ bodyAttrs: { class: 'magazine' } })
const { data: resume } = await useFetch<Resume | null>('/api/resume')
</script>

<template>
  <div v-if="resume" class="magazine-page">
    <ResumeBody :resume="resume" />
  </div>
</template>

<style>
body.magazine { background: var(--paper); }
.magazine-page { padding: 0.3in 0.2in; }
</style>
