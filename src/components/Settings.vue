<template>
  <div class="settings-panel p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h2>

    <!-- Window Mode Setting -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Window Mode
      </h3>
      <div class="flex gap-6">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            :value="'regular'"
            v-model="windowMode"
            @change="handleModeChange"
            class="w-4 h-4"
          />
          <span class="text-gray-700 dark:text-gray-300">
            Regular Mode
            <span class="text-sm text-gray-500 dark:text-gray-400 block">
              Full-size window (1500x1000)
            </span>
          </span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            :value="'docked'"
            v-model="windowMode"
            @change="handleModeChange"
            class="w-4 h-4"
          />
          <span class="text-gray-700 dark:text-gray-300">
            Docked Mode
            <span class="text-sm text-gray-500 dark:text-gray-400 block">
              Floating window near tray (400x300)
            </span>
          </span>
        </label>
      </div>

      <p v-if="changingMode" class="mt-3 text-sm text-blue-600 dark:text-blue-400">
        Switching window mode...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { WindowMode } from "@electron/services/settings";

const windowMode = ref<WindowMode>("regular");
const changingMode = ref(false);
let isInitializing = true;

let modeChangeHandler: ((_event: any, mode: WindowMode) => void) | null = null;

onMounted(async () => {
  // Fetch current window mode on mount
  console.log("Initializing Settings.vue, fetching current window mode: ", isInitializing);
  try {
    const settings = await window.api.settings.getSettings();
    windowMode.value = settings.windowMode;
    console.log("Settings component mounted, loaded window mode:", windowMode.value);
  } catch (error) {
    console.error("Failed to load settings:", error);
  }

  isInitializing = false;

  // Create a named handler so we can remove it later
  modeChangeHandler = (_event: any, mode: WindowMode) => {
    console.log("Settings.vue received window:modeChanged event with mode:", mode);
    windowMode.value = mode;
    changingMode.value = false;
  };

  // Listen for mode changes (indicates new window loaded after switch)
  window.ipc.on("window:modeChanged", modeChangeHandler);
});

onUnmounted(() => {
  // Clean up the listener when the component is unmounted
  if (modeChangeHandler) {
    window.ipc.off("window:modeChanged", modeChangeHandler);
    modeChangeHandler = null;
  }
});

const handleModeChange = async () => {
  console.log("handleModeChange triggered, new mode:", windowMode.value);
  changingMode.value = true;

  try {
    // Send IPC message to main process to switch mode
    // The main process will save the setting and recreate the window
    console.log("Sending window:switchMode IPC message with mode:", windowMode.value);
    window.ipc.send("window:switchMode", windowMode.value);
    console.log("IPC message sent");
    // Once window recreates, window:modeChanged event will fire and update the UI
  } catch (error) {
    console.error("Failed to change window mode:", error);
    changingMode.value = false;
  }
};
</script>

<style scoped>
.settings-panel {
  max-width: 600px;
}
</style>
