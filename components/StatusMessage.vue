<script setup lang="ts">
defineProps<{ kind: 'loading' | 'error'; title?: string }>()
</script>

<template>
  <div class="status" :class="kind" :role="kind === 'error' ? 'alert' : 'status'">
    <strong v-if="title">{{ title }}</strong>
    <slot />
  </div>
</template>

<style scoped>
.status {
  padding: 1rem 1.2rem;
  border-left: 4px solid var(--accent);
  background: rgba(221, 190, 169, 0.35);
}
.status strong { display: block; font-family: var(--font-display); font-weight: 400; font-size: 1.2rem; }
.loading::after { content: '▌'; animation: blink 1s steps(1) infinite; margin-left: 0.2rem; }
@keyframes blink { 50% { opacity: 0; } }
</style>
