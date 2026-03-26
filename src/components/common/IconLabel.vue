<template>
  <component
    :is="clickable ? 'button' : 'span'"
    class="inline-flex items-center gap-[0.3rem]"
    :aria-label="tooltipText"
    :class="clickable ? 'bg-transparent border-none p-0 cursor-pointer' : ''"
    v-bind="$attrs"
  >
    <svg
      :width="svgWidth"
      :height="svgHeight"
      viewBox="0 0 24 24"
      class="shrink-0"
      :class="iconClass"
      aria-hidden="true"
    >
      <path :d="icon" fill="currentColor" />
    </svg>
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    icon: string;
    tooltip?: string;
    size?: number;
    width?: number;
    height?: number;
    clickable?: boolean;
    iconClass?: string;
  }>(),
  {
    size: 14,
    clickable: false,
  }
);

const tooltipText = computed(() => props.tooltip ?? "");
const svgWidth = computed(() => props.width ?? props.size);
const svgHeight = computed(() => props.height ?? props.size);
</script>