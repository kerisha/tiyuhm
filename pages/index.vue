<script setup lang="ts">
const { data: saved } = await useFetch<Resume | null>('/api/resume')

const ownerName = computed(() => saved.value?.profile.name || saved.value?.profile.username || '')
const initials = computed(() => (ownerName.value ? initialsOf(ownerName.value) : undefined))
const firstName = computed(() => ownerName.value.split(/\s+/)[0])
</script>

<template>
  <ResumeSheet>
    <div class="gate">
      <Crest :initials="initials" :size="110" />
      <h1 class="gothic">TIYUHM</h1>
      <p class="expand">(This Is Why You Hire Me)</p>
      <p class="divider" aria-hidden="true"><span>◆</span></p>
      <h2>Hail, traveler.</h2>
      <p v-if="saved">You stand at the gates of {{ firstName }}'s domain. Within lies a chronicle written from real work, kept current as new deeds are done.</p>
      <p v-else>You stand at the gates of a domain written from real work. TIYUHM reads a GitHub history, pens a resume from it, and keeps the chronicle current as new deeds are done.</p>
      <p>
        <NuxtLink :to="saved ? '/resume' : '/start'" class="button cta">Enter the Kingdom</NuxtLink>
      </p>
    </div>
  </ResumeSheet>
</template>

<style scoped>
.gate { display: flex; flex-direction: column; align-items: center; text-align: center; }
.gate h1 { font-size: 3.6rem; margin: 0.2rem 0 0; }
.expand { margin: 0.3rem 0 0; font-variant: small-caps; letter-spacing: 0.1em; }
.gate h2 { border-bottom: 0; }
.cta { display: inline-block; text-decoration: none; }
</style>
