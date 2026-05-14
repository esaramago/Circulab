<template>
  <ul class="c-gallery">
    <slot></slot>
  </ul>
</template>

<style scoped>
.c-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: var(--wa-space-xs);
  padding: 0;
  margin: 0;
  list-style: none;
}
</style>