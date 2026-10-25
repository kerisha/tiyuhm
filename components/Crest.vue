<script setup lang="ts">
// A heraldic shield. With initials it is the owner's crest; without, a castle tower.
defineProps<{ initials?: string; size?: number }>()
</script>

<template>
  <svg
    class="crest"
    :width="size || 96"
    :height="((size || 96) * 1.15)"
    viewBox="0 0 100 115"
    role="img"
    aria-label="Heraldic crest"
  >
    <path d="M50 4 L92 16 V58 C92 84 72 102 50 111 C28 102 8 84 8 58 V16 Z" fill="var(--paper)" stroke="var(--ink)" stroke-width="4" />
    <path d="M50 12 L84 22 V58 C84 79 68 94 50 102 C32 94 16 79 16 58 V22 Z" fill="none" stroke="var(--accent)" stroke-width="3" />
    <text v-if="initials" x="50" y="68" text-anchor="middle" class="mono">{{ initials }}</text>
    <g v-else fill="var(--ink)">
      <path d="M32 78 V44 h6 v5 h6 v-5 h6 v5 h6 v-5 h6 v5 h4 V78 Z" />
      <path d="M45 78 V64 a5 5 0 0 1 10 0 V78 Z" fill="var(--paper)" />
    </g>
  </svg>
</template>

<style scoped>
.crest { display: block; flex: none; }
.mono { font-family: var(--font-gothic); font-size: 38px; fill: var(--ink); }
</style>
