<template>
  <div class="h-full flex flex-col" :data-window-mode="windowMode">
    <HomeHeader
      :windowMode="windowMode"
      :searchQuery="searchQuery"
      @update:searchQuery="searchQuery = $event"
      @toggleWindowMode="toggleWindowMode"
      @closeToTray="minimizeWindowToTray"
      @openSettings="isSettingsOpen = true"
    />
    <QuickActionsBar
      :preferredEditor="preferredEditor"
      :loading="loadingProjects"
      :groups="groups"
      :grouped="grouped"
      :sortByRecent="sortByRecent"
      :hiddenGroups="hiddenGroups"
      @editorChanged="preferredEditor = $event"
      @refresh="loadProjects"
      @sectionsChanged="hiddenGroups = $event"
      @toggleGrouping="grouped = !grouped"
      @toggleSort="sortByRecent = !sortByRecent"
    />
    <HomeContent
      :windowMode="windowMode"
      :projects="projects"
      :loadingProjects="loadingProjects"
      :searchQuery="searchQuery"
      :hiddenGroups="hiddenGroups"
      :grouped="grouped"
      :sortByRecent="sortByRecent"
      :recentlyOpened="recentlyOpened"
      @openProject="openProject"
    />
  </div>
  <Settings :isOpen="isSettingsOpen" @close="isSettingsOpen = false" @paths-changed="loadProjects" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import type { WindowMode } from "@electron/services/settings";
import HomeHeader from "@/components/home/HomeHeader.vue";
import HomeContent from "@/components/home/HomeContent.vue";
import QuickActionsBar from "@/components/home/QuickActionsBar.vue";
import Settings from "@/components/settings/Settings.vue";

interface Project {
  name: string;
  path: string;
  branch?: string;
  group: string;
  editorHint?: string;
  editorExplicit?: boolean;
}

function loadUIState() {
  try {
    const raw = localStorage.getItem("shelf:uiState");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUIState(state: Record<string, unknown>) {
  try {
    const current = loadUIState();
    localStorage.setItem("shelf:uiState", JSON.stringify({ ...current, ...state }));
  } catch {}
}

const saved = loadUIState();
const cachedProjects: Project[] = (() => {
  try {
    const raw = localStorage.getItem("shelf:projectsCache");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
})();

const windowMode = ref<WindowMode>("regular");
const projects = ref<Project[]>(cachedProjects);
const loadingProjects = ref(cachedProjects.length === 0);
const searchQuery = ref<string>(saved.searchQuery ?? "");
const isSettingsOpen = ref(false);
const preferredEditor = ref("vscode");
const hiddenGroups = ref<string[]>(saved.hiddenGroups ?? []);
const grouped = ref<boolean>(saved.grouped ?? true);
const sortByRecent = ref<boolean>(saved.sortByRecent ?? false);
const recentlyOpened = ref<Record<string, number>>({});

watch(searchQuery, (v) => saveUIState({ searchQuery: v }));
watch(hiddenGroups, (v) => saveUIState({ hiddenGroups: v }), { deep: true });
watch(grouped, (v) => saveUIState({ grouped: v }));
watch(sortByRecent, (v) => saveUIState({ sortByRecent: v }));

const groups = computed(() => [...new Set(projects.value.map((p) => p.group))]);

let modeChangeHandler: ((_event: any, mode: WindowMode) => void) | null = null;

const minimizeWindowToTray = () => {
  (window.api as any).window.minimize();
};

const toggleWindowMode = async () => {
  const newMode = windowMode.value === "regular" ? "docked" : "regular";
  window.ipc.send("window:switchMode", newMode);
};

const loadProjects = async () => {
  if (projects.value.length === 0) loadingProjects.value = true;
  try {
    const result = await window.api.fs.listGitProjects();
    projects.value = result;
    try { localStorage.setItem("shelf:projectsCache", JSON.stringify(result)); } catch {}
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
      (window.api.settings as any).recordProjectOpen(projectPath);
      recentlyOpened.value = { ...recentlyOpened.value, [projectPath]: Date.now() };
      minimizeWindowToTray();
    }
  } catch (error) {
    alert(`Error opening project: ${error}`);
  }
};

onMounted(async () => {
  // Fetch current window mode on mount
  try {
    const settings = await window.api.settings.getSettings();
    windowMode.value = settings.windowMode;
    preferredEditor.value = settings.preferredEditor ?? "vscode";
    recentlyOpened.value = settings.recentlyOpened ?? {};
  } catch (error) {
    console.error("Failed to load settings:", error);
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
