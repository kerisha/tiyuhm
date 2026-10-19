<script setup lang="ts">
const { data: resume } = await useFetch<Resume | null>('/api/resume')
if (!resume.value) await navigateTo('/')
</script>

<template>
  <ResumeSheet>
    <ResumeBody v-if="resume" :resume="resume" />
  </ResumeSheet>
</template>
