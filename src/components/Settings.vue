<template>
  <!-- Modal Backdrop -->
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-40"
        @click="closeModal"
      />
    </Transition>

    <!-- Modal Dialog -->
    <Transition name="slide-up">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto"
          @click.stop
        >
          <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <button
              @click="closeModal"
              class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition p-1"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" :d="mdiClose">
                <path :d="mdiClose" />
              </svg>
            </button>
          </div>

          <div class="p-6">
            <!-- Window Mode Setting -->
            <div>
              <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Window Mode
              </h3>
              <div class="space-y-3">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    :value="'regular'"
                    v-model="windowMode"
                    @change="handleModeChange"
                    class="w-4 h-4"
                  />
                  <div>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">Regular Mode</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400 block">
                      Full-size window (1500x1000)
                    </span>
                  </div>
                </label>

                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    :value="'docked'"
                    v-model="windowMode"
                    @change="handleModeChange"
                    class="w-4 h-4"
                  />
                  <div>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">Docked Mode</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400 block">
                      Floating window near tray (400x300)
                    </span>
                  </div>
                </label>
              </div>

              <p v-if="changingMode" class="mt-3 text-sm text-blue-600 dark:text-blue-400">
                Switching window mode...
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { mdiClose } from "@mdi/js";
import type { WindowMode } from "@electron/services/settings";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const windowMode = ref<WindowMode>("regular");
const changingMode = ref(false);
let isInitializing = true;

let modeChangeHandler: ((_event: any, mode: WindowMode) => void) | null = null;

const closeModal = () => {
  emit("close");
};

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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
