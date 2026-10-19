<script setup lang="ts">
const { data: saved } = await useFetch<Resume | null>('/api/resume')
if (saved.value) await navigateTo('/resume')
</script>

<template>
  <ResumeSheet>
    <p class="kicker">This is why you hire me</p>
    <h1>TIYUHM</h1>
    <h2>Your work, written up.</h2>
    <p>Let's read your work. TIYUHM reads your GitHub history, writes a real resume from it, and keeps that resume current as you ship.</p>
    <p><NuxtLink to="/start" class="button cta">Get started</NuxtLink></p>
  </ResumeSheet>
</template>

<style scoped>
.cta { display: inline-block; text-decoration: none; }
</style>
