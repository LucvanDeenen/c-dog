<template>
  <div>
    <h3 class="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.05em] mt-0 mb-4">Window Mode</h3>
    <div class="flex flex-col gap-3">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          :value="'regular'"
          v-model="mode"
          @change="handleChange"
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
          v-model="mode"
          @change="handleChange"
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
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { WindowMode } from "@electron/services/settings";

const props = defineProps<{
  initialValue: WindowMode;
}>();

const mode = ref<WindowMode>(props.initialValue);
const changingMode = ref(false);

let modeChangeHandler: ((_event: any, mode: WindowMode) => void) | null = null;

onMounted(() => {
  modeChangeHandler = (_event: any, newMode: WindowMode) => {
    mode.value = newMode;
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

const handleChange = async () => {
  changingMode.value = true;
  try {
    window.ipc.send("window:switchMode", mode.value);
  } catch (error) {
    console.error("Failed to change window mode:", error);
    changingMode.value = false;
  }
};
</script>
