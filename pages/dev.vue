<script setup lang="ts">
// TEMPORARY slice 3 view: see the AI's verdicts. Removed once the resume page exists.
const { data } = await useFetch<Record<string, { significant: boolean; oneLine: string; repo: string; message: string; date: string }>>('/api/dev/verdicts')
const rows = computed(() => Object.entries(data.value ?? {}))
</script>

<template>
  <ResumeSheet>
    <p class="kicker">Developer view</p>
    <h1>Verdicts</h1>
    <p v-if="!rows.length">No verdicts yet.</p>
    <ul>
      <li v-for="[sha, v] in rows" :key="sha">
        <strong>{{ v.significant ? 'SIGNIFICANT' : 'trivial' }}</strong> · {{ v.repo }} · {{ v.message }}<br />
        <small>{{ v.oneLine }}</small>
      </li>
    </ul>
  </ResumeSheet>
</template>
