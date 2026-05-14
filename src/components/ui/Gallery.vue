<template>
  <div class="c-gallery">
    <slot></slot>
  </div>
</template>

<style scoped>
.c-gallery {
  display: grid;
  align-items: end;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: var(--wa-space-xs);
}
</style>