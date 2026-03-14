<template>
  <div class="group relative inline-flex">
    <button
      :class="['icon-button', customClass]"
      :title="tooltipText"
      :aria-label="tooltipText"
      @click="$emit('click', $event)"
      type="button"
    >
      <svg :class="iconClass" viewBox="0 0 24 24">
        <path :d="icon" fill="currentColor" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  icon: string;
  title?: string;
  tooltip?: string;
  iconClass?: string;
  customClass?: string;
}>();

const tooltipText = computed(() => props.tooltip ?? props.title ?? "");
</script>

<style scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}
</style>
