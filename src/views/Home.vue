<template>
  <div class="h-full" :data-window-mode="windowMode">
    <HomeHeader
      :windowMode="windowMode"
      :searchQuery="searchQuery"
      @update:searchQuery="searchQuery = $event"
      @toggleWindowMode="toggleWindowMode"
      @closeToTray="minimizeWindowToTray"
      @openSettings="isSettingsOpen = true"
    />
    <HomeContent
      :windowMode="windowMode"
      :projects="projects"
      :loadingProjects="loadingProjects"
      :searchQuery="searchQuery"
      @openProject="openProject"
    />
  </div>
  <Settings :isOpen="isSettingsOpen" @close="isSettingsOpen = false" @paths-changed="loadProjects" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { WindowMode } from "@electron/services/settings";
import HomeHeader from "@/components/home/HomeHeader.vue";
import HomeContent from "@/components/home/HomeContent.vue";
import Settings from "@/components/settings/Settings.vue";

interface Project {
  name: string;
  path: string;
  branch?: string;
  group: string;
  editorHint?: string;
}

const windowMode = ref<WindowMode>("regular");
const projects = ref<Project[]>([]);
const loadingProjects = ref(true);
const searchQuery = ref("");
const isSettingsOpen = ref(false);

let modeChangeHandler: ((_event: any, mode: WindowMode) => void) | null = null;

const minimizeWindowToTray = () => {
  (window.api as any).window.minimize();
};

const toggleWindowMode = async () => {
  const newMode = windowMode.value === "regular" ? "docked" : "regular";
  window.ipc.send("window:switchMode", newMode);
};

const loadProjects = async () => {
  loadingProjects.value = true;
  try {
    projects.value = await window.api.fs.listGitProjects();
  } catch (error) {
    console.error("Failed to load projects:", error);
  } finally {
    loadingProjects.value = false;
  }
};

const openProject = async (projectPath: string, editorHint?: string) => {
  try {
    const result = await window.api.fs.openInEditor(projectPath, editorHint);
    if (!result) {
      alert("Failed to open project. Make sure your preferred editor is installed and on your PATH.");
    } else {
      minimizeWindowToTray();
    }
  } catch (error) {
    alert(`Error opening project: ${error}`);
  }
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

  loadProjects();

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
