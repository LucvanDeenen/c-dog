<template>
  <div class="h-screen flex flex-col">
    <HomeHeader
      :windowMode="windowMode"
      :searchQuery="searchQuery"
      @update:searchQuery="searchQuery = $event"
      @toggleWindowMode="toggleWindowMode"
      @closeToTray="closeToTray"
    />
    <HomeContent
      :windowMode="windowMode"
      :projects="projects"
      :loadingProjects="loadingProjects"
      :searchQuery="searchQuery"
      @openProject="openProject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import HomeHeader from "@/components/HomeHeader.vue";
import HomeContent from "@/components/HomeContent.vue";
import type { WindowMode } from "@electron/services/settings";

interface Project {
  name: string;
  path: string;
}

const windowMode = ref<WindowMode>("regular");
const projects = ref<Project[]>([]);
const loadingProjects = ref(true);
const searchQuery = ref("");

let modeChangeHandler: ((_event: any, mode: WindowMode) => void) | null = null;

const minimizeWindowToTray = () => {
  if (window.api && (window.api as any).window && typeof (window.api as any).window.minimize === "function") {
    (window.api as any).window.minimize();
  } else if (window.api && (window.api as any).window_minimize) {
    (window.api as any).window_minimize();
  }
};

const toggleWindowMode = async () => {
  const newMode = windowMode.value === "regular" ? "docked" : "regular";
  console.log("Toggling window mode to:", newMode);
  window.ipc.send("window:switchMode", newMode);
};

const openProject = async (projectPath: string, editor: string = "vscode") => {
  console.log("Opening project in editor:", editor, projectPath);
  try {
    const result = await window.api.fs.openInEditor(projectPath, editor);
    if (!result) {
      alert(
        `Failed to open project in ${editor}. Make sure it is installed and on your PATH.`,
      );
    } else {
      minimizeWindowToTray();
    }
  } catch (error) {
    alert(`Error opening project: ${error}`);
  }
};

const closeToTray = () => {
  minimizeWindowToTray();
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
