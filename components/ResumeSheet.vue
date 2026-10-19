<template>
  <main class="stage">
    <article class="sheet">
      <slot />
    </article>
  </main>
</template>

<style scoped>
.stage { padding: 3rem 1rem; }
.sheet {
  max-width: 44rem;
  margin: 0 auto;
  padding: 3.5rem 3rem;
  background: var(--paper);
  box-shadow: 0 2px 0 var(--quiet), 0 10px 30px rgba(107, 112, 92, 0.25);
}
@media (max-width: 600px) { .sheet { padding: 2rem 1.25rem; } }
</style>
