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
    <span
      v-if="tooltipText"
      class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-xs text-slate-100 opacity-0 shadow transition-opacity duration-150 group-hover:opacity-100"
    >
      {{ tooltipText }}
    </span>
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
