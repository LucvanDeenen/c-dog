<template>
  <div class="min-h-screen p-6 flex flex-col" :data-window-mode="windowMode">
    <Settings />

    <!-- Projects Section -->
    <div class="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Git Projects</h2>
      
      <div v-if="loadingProjects" class="text-gray-600 dark:text-gray-300">
        Loading projects...
      </div>
      
      <div v-else-if="projects.length === 0" class="text-gray-600 dark:text-gray-300">
        No git projects found in ~/repos
      </div>
      
      <div v-else class="space-y-2">
        <div 
          v-for="project in projects" 
          :key="project.path"
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">{{ project.name }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ project.path }}</p>
          </div>
          <button
            @click="openProject(project.path)"
            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Settings from "@components/Settings.vue";
import { ref, onMounted, onUnmounted } from "vue";
import type { WindowMode } from "@electron/services/settings";

interface Project {
  name: string;
  path: string;
}

const windowMode = ref<WindowMode>("regular");
const projects = ref<Project[]>([]);
const loadingProjects = ref(true);

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

  // Fetch git projects on mount
  try {
    projects.value = await window.api.fs.listGitProjects();
    console.log("Projects loaded:", projects.value);
  } catch (error) {
    console.error("Failed to load projects:", error);
  } finally {
    loadingProjects.value = false;
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

const openProject = (projectPath: string) => {
  console.log("Opening project:", projectPath);
  // TODO: Implement functionality to open the project (e.g., open in VS Code)
};
</script>
