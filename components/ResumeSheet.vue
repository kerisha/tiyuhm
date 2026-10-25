<template>
  <main class="stage">
    <article class="sheet">
      <span class="corner tl">❖</span>
      <span class="corner tr">❖</span>
      <span class="corner bl">❖</span>
      <span class="corner br">❖</span>
      <slot />
    </article>
  </main>
</template>

<style scoped>
.stage { padding: 3rem 1rem; }
.sheet {
  position: relative;
  max-width: 44rem;
  margin: 0 auto;
  padding: 3.5rem 3rem;
  background-color: var(--paper);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.42  0 0 0 0 0.44  0 0 0 0 0.36  0 0 0 0.09 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");
  box-shadow: 0 2px 0 var(--quiet), 0 10px 30px rgba(107, 112, 92, 0.25);
}
/* charter-style double border inside the sheet */
.sheet::before {
  content: '';
  position: absolute;
  inset: 12px;
  border: 4px double var(--accent);
  pointer-events: none;
}
.corner {
  position: absolute;
  color: var(--accent);
  font-size: 1.1rem;
  line-height: 1;
  background: var(--paper);
  padding: 0 0.15rem;
}
.tl { top: 5px; left: 5px; }
.tr { top: 5px; right: 5px; }
.bl { bottom: 5px; left: 5px; }
.br { bottom: 5px; right: 5px; }
@media (max-width: 600px) { .sheet { padding: 2.2rem 1.4rem; } }
</style>
