<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" @click.self="closeModal">
    <div class="bg-neutral-800 border border-neutral-700/50 rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.5)] w-full max-w-[28rem] max-h-[calc(100vh-10rem)] overflow-y-auto text-white" @click.stop>
      <div class="sticky top-0 bg-neutral-800 border-b border-neutral-700/50 px-6 py-5 flex items-center justify-between">
        <div class="flex items-baseline gap-[0.6rem]">
          <h2 class="text-xl font-bold text-white m-0">Settings</h2>
          <span v-if="appVersion" class="text-xs text-gray-500 font-medium">v{{ appVersion }}</span>
        </div>
      </div>

      <div v-if="settings" class="p-6 flex flex-col gap-6">
        <StartupSetting :initial-value="settings.launchAtStartup" />
        <div class="border-t border-neutral-700/50" />
        <RepositoriesSetting :initial-value="settings.repoPaths" @paths-changed="emit('pathsChanged')" />
        <div class="border-t border-neutral-700/50" />
        <WindowModeSetting :initial-value="settings.windowMode" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Settings } from "@electron/services/settings";
import WindowModeSetting from "./WindowModeSetting.vue";
import RepositoriesSetting from "./RepositoriesSetting.vue";
import StartupSetting from "./StartupSetting.vue";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  pathsChanged: [];
}>();

const settings = ref<Settings | null>(null);
const appVersion = ref("");

const closeModal = () => {
  emit("close");
};

const loadSettings = async () => {
  try {
    settings.value = null;
    settings.value = await window.api.settings.getSettings();
    if (!appVersion.value) {
      appVersion.value = await window.api.settings.getVersion();
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
};

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) loadSettings();
}, { immediate: true });
</script>
