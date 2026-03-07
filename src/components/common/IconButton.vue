<template>
  <button
    :class="['icon-button', customClass]"
    :title="title"
    @click="$emit('click', $event)"
    type="button"
  >
    <svg :class="iconClass" viewBox="0 0 24 24">
      <path :d="icon" fill="currentColor" />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  title?: string;
  iconClass?: string;
  customClass?: string;
}>();
</script>
