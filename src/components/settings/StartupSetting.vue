<template>
  <div>
    <h3 class="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.05em] mt-0 mb-4">Startup</h3>
    <label class="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        v-model="launchAtStartup"
        @change="handleChange"
        class="w-4 h-4"
      />
      <div>
        <span class="block font-medium text-white text-[0.9rem]">Launch at startup</span>
        <span class="block text-[0.8rem] text-gray-500 mt-[0.1rem]">Start minimized to tray when you log in</span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  initialValue: boolean;
}>();

const launchAtStartup = ref(props.initialValue);

const handleChange = async () => {
  try {
    await window.api.settings.setLaunchAtStartup(launchAtStartup.value);
  } catch (error) {
    console.error("Failed to update launch at startup:", error);
    launchAtStartup.value = !launchAtStartup.value;
  }
};
</script>
