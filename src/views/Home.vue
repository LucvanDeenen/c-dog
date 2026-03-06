<template>
  <div class="min-h-screen p-6 flex flex-col" :data-window-mode="windowMode">
    <Settings />
  </div>
</template>

<script setup lang="ts">
import Settings from "@components/Settings.vue";
import { ref, onMounted, onUnmounted } from "vue";
import type { WindowMode } from "@electron/services/settings";

const windowMode = ref<WindowMode>("regular");

let modeChangeHandler: ((_event: any, mode: WindowMode) => void) | null = null;

onMounted(async () => {
  // Fetch current window mode on mount
  try {
    const currentMode = await window.api.settings.getWindowMode();
    windowMode.value = currentMode;
    console.log("Home.vue loaded, current window mode:", currentMode);
  } catch (error) {
    console.error("Failed to load window mode:", error);
  }

  // Create a named handler so we can remove it later
  modeChangeHandler = (_event: any, mode: WindowMode) => {
    console.log("Home.vue received window:modeChanged event with mode:", mode);
    windowMode.value = mode;
  };

  // Listen for window mode changes from main process
  window.ipc.on("window:modeChanged", modeChangeHandler);
});

onUnmounted(() => {
  // Clean up the listener when the component is unmounted
  if (modeChangeHandler) {
    window.ipc.off("window:modeChanged", modeChangeHandler);
    modeChangeHandler = null;
  }
});
</script>
