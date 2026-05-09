<template>
  <ul class="c-wizard">
    <slot></slot>
  </ul>
</template>

<style scoped>
.c-wizard {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--wa-space-s);
  list-style: none;
  padding: 0;
  margin: 0;
  gap: var(--wa-space-m);
  justify-content: center;
}
</style>