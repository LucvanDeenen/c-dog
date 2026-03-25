<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" @click.self="closeModal">
    <div class="bg-neutral-800 border border-neutral-700/50 rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.5)] w-full max-w-[28rem] max-h-[calc(100vh-2rem)] overflow-y-auto text-white" @click.stop>
      <div class="sticky top-0 bg-neutral-800 border-b border-neutral-700/50 px-6 py-5 flex items-center justify-between">
        <div class="flex items-baseline gap-[0.6rem]">
          <h2 class="text-xl font-bold text-white m-0">Settings</h2>
          <span v-if="appVersion" class="text-xs text-gray-500 font-medium">v{{ appVersion }}</span>
        </div>
      </div>

      <div class="p-6">
        <!-- Window Mode Setting -->
        <div class="pb-6">
          <h3 class="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.05em] mt-0 mb-4">Window Mode</h3>
          <div class="flex flex-col gap-3">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                :value="'regular'"
                v-model="windowMode"
                @change="handleModeChange"
                class="w-4 h-4"
              />
              <div>
                <span class="block font-medium text-white text-[0.9rem]">Regular Mode</span>
                <span class="block text-[0.8rem] text-gray-500 mt-[0.1rem]">Full-size window (1500x1000)</span>
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
                <span class="block font-medium text-white text-[0.9rem]">Docked Mode</span>
                <span class="block text-[0.8rem] text-gray-500 mt-[0.1rem]">Floating window near tray (400x300)</span>
              </div>
            </label>
          </div>

          <p v-if="changingMode" class="mt-3 text-[0.85rem] text-yellow-500">
            Switching window mode...
          </p>
        </div>

        <!-- Startup Setting -->
        <div class="border-t border-neutral-700/50 pt-6">
          <h3 class="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.05em] mt-0 mb-4">Startup</h3>
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              v-model="launchAtStartup"
              @change="handleLaunchAtStartupChange"
              class="w-4 h-4"
            />
            <div>
              <span class="block font-medium text-white text-[0.9rem]">Launch at startup</span>
              <span class="block text-[0.8rem] text-gray-500 mt-[0.1rem]">Start minimized to tray when you log in</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { WindowMode } from "@electron/services/settings";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const windowMode = ref<WindowMode>("regular");
const changingMode = ref(false);
const launchAtStartup = ref(false);
const appVersion = ref("");
let isInitializing = true;

let modeChangeHandler: ((_event: any, mode: WindowMode) => void) | null = null;

const closeModal = () => {
  emit("close");
};

onMounted(async () => {
  try {
    const settings = await window.api.settings.getSettings();
    windowMode.value = settings.windowMode;
    launchAtStartup.value = settings.launchAtStartup;
    appVersion.value = await window.api.settings.getVersion();
  } catch (error) {
    console.error("Failed to load settings:", error);
  }

  isInitializing = false;

  modeChangeHandler = (_event: any, mode: WindowMode) => {
    windowMode.value = mode;
    changingMode.value = false;
  };

  window.ipc.on("window:modeChanged", modeChangeHandler);
});

onUnmounted(() => {
  if (modeChangeHandler) {
    window.ipc.off("window:modeChanged", modeChangeHandler);
    modeChangeHandler = null;
  }
});

const handleModeChange = async () => {
  changingMode.value = true;
  try {
    window.ipc.send("window:switchMode", windowMode.value);
  } catch (error) {
    console.error("Failed to change window mode:", error);
    changingMode.value = false;
  }
};

const handleLaunchAtStartupChange = async () => {
  try {
    await window.api.settings.setLaunchAtStartup(launchAtStartup.value);
  } catch (error) {
    console.error("Failed to update launch at startup:", error);
    launchAtStartup.value = !launchAtStartup.value;
  }
};
</script>
