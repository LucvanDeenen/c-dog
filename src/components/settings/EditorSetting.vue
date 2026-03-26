<template>
  <div>
    <h3 class="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.05em] mt-0 mb-4">Default Editor</h3>

    <div v-if="loading" class="text-[0.85rem] text-gray-500">Scanning for editors...</div>

    <div v-else-if="editors.length === 0" class="text-[0.85rem] text-gray-500">
      No supported editors found on PATH.
    </div>

    <div v-else class="flex flex-col gap-3">
      <label v-for="editor in editors" :key="editor.id" class="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          :value="editor.id"
          v-model="selected"
          @change="handleChange"
          class="w-4 h-4"
        />
        <span class="font-medium text-white text-[0.9rem]">{{ editor.name }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface EditorInfo {
  id: string;
  name: string;
}

const props = defineProps<{
  initialValue: string;
}>();

const editors = ref<EditorInfo[]>([]);
const selected = ref(props.initialValue);
const loading = ref(true);

onMounted(async () => {
  try {
    editors.value = await window.api.fs.getInstalledEditors();
    if (editors.value.length > 0 && !editors.value.find((e) => e.id === selected.value)) {
      selected.value = editors.value[0].id;
      await window.api.settings.setPreferredEditor(selected.value);
    }
  } catch (error) {
    console.error("Failed to load editors:", error);
  } finally {
    loading.value = false;
  }
});

const handleChange = async () => {
  try {
    await window.api.settings.setPreferredEditor(selected.value);
  } catch (error) {
    console.error("Failed to save preferred editor:", error);
  }
};
</script>
