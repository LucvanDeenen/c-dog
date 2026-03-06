<template>
  <div class="h-screen flex flex-col">
    <!-- Quick Actions Bar -->
    <div
      class="bg-slate-800 border-slate-700 flex items-center gap-3 px-6 py-3 flex-shrink-0 h-[75px]"
    >
      <div class="flex-1 flex items-center bg-slate-900 rounded px-3 py-2">
        <svg class="w-4 h-4 text-slate-400 mr-2 icon-sm" viewBox="0 0 24 24">
          <path :d="mdiMagnify" fill="currentColor" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search projects..."
          class="bg-transparent text-sm text-slate-200 outline-none flex-1 placeholder-slate-500"
        />
      </div>
      <button
        @click="toggleWindowMode"
        class="icon-button"
        :title="`Switch to ${windowMode === 'regular' ? 'Docked' : 'Regular'} Mode`"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path
            :d="
              windowMode === 'regular' ? mdiWindowMinimize : mdiWindowMaximize
            "
            fill="currentColor"
          />
        </svg>
      </button>
    </div>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto p-6" :data-window-mode="windowMode">
      <!-- Projects Section -->
      <div class="projects-section">
        <div v-if="loadingProjects" class="loading-state">
          Loading projects...
        </div>

        <div v-else-if="projects.length === 0" class="empty-state">
          No git projects found in ~/repos
        </div>

        <div v-else-if="filteredProjects.length === 0" class="empty-state">
          No projects match your search
        </div>

        <div v-else class="projects-grid">
          <div
            v-for="project in filteredProjects"
            :key="project.path"
            class="project-card"
            @click="openProject(project.path)"
          >
            <div class="project-info">
              <svg class="w-4 h-4 icon" viewBox="0 0 24 24">
                <path :d="mdiFileCode" fill="currentColor" />
              </svg>
              <div class="flex flex-col">
                <p class="project-name">{{ project.name }}</p>
                <p class="project-path italic">{{ project.path }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
  mdiFileCode,
  mdiWindowMinimize,
  mdiWindowMaximize,
  mdiMagnify,
} from "@mdi/js";
import type { WindowMode } from "@electron/services/settings";

interface Project {
  name: string;
  path: string;
}

const windowMode = ref<WindowMode>("regular");
const projects = ref<Project[]>([]);
const loadingProjects = ref(true);
const searchQuery = ref("");

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value;
  const query = searchQuery.value.toLowerCase();
  return projects.value.filter(
    (project) =>
      project.name.toLowerCase().includes(query) ||
      project.path.toLowerCase().includes(query),
  );
});

let modeChangeHandler: ((_event: any, mode: WindowMode) => void) | null = null;

const toggleWindowMode = async () => {
  const newMode = windowMode.value === "regular" ? "docked" : "regular";
  console.log("Toggling window mode to:", newMode);
  window.ipc.send("window:switchMode", newMode);
};

const openProject = (projectPath: string) => {
  console.log("Opening project:", projectPath);
  // TODO: Implement functionality to open the project (e.g., open in VS Code)
};

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
</script>
