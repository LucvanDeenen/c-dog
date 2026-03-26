<template>
  <div class="relative">
    <button
      type="button"
      title="Change default editor"
      class="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-yellow-500/60 bg-yellow-500/10 text-yellow-400 transition-colors duration-150 cursor-pointer hover:bg-yellow-500/20"
      @click="showPicker = !showPicker"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
        <path :d="editorIcon(preferredEditor)" fill="currentColor" />
      </svg>
    </button>

    <EditorPicker
      v-if="showPicker"
      :editors="editors"
      :selected-id="preferredEditor"
      :explicit="true"
      @select="selectDefault"
      @clear="showPicker = false"
    />
  </div>

  <div v-if="showPicker" class="fixed inset-0 z-40" @click="showPicker = false" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import EditorPicker from "@/components/common/EditorPicker.vue";
import { type EditorInfo, editorIcon } from "@/util/editors";

const props = defineProps<{
  preferredEditor: string;
}>();

const emit = defineEmits<{
  editorChanged: [id: string];
}>();

const editors = ref<EditorInfo[]>([]);
const showPicker = ref(false);

onMounted(async () => {
  try {
    editors.value = await window.api.fs.getInstalledEditors();
  } catch (error) {
    console.error("Failed to load editors:", error);
  }
});

async function selectDefault(id: string) {
  await window.api.settings.setPreferredEditor(id);
  emit("editorChanged", id);
  showPicker.value = false;
}

</script>
