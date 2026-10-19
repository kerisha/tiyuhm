<script setup lang="ts">
useHead({ bodyAttrs: { class: 'print-resume' } })
const { data: resume } = await useFetch<Resume | null>('/api/resume')
</script>

<template>
  <div v-if="resume" class="print-resume-page">
    <ResumeBody :resume="resume" />
  </div>
</template>

<style>
body.print-resume { background: var(--paper); }
.print-resume-page { padding: 0.3in 0.2in; }
</style>
