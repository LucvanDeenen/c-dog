<template>
  <main class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6" :data-window-mode="windowMode">
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
</template>

<script setup lang="ts">
import { mdiFileCode } from "@mdi/js";
import { computed } from "vue";

const props = defineProps<{
  windowMode: string;
  projects: Array<{ name: string; path: string }>;
  loadingProjects: boolean;
  searchQuery: string;
}>();
const emit = defineEmits(["openProject"]);

const filteredProjects = computed(() => {
  if (!props.searchQuery) return props.projects;
  const query = props.searchQuery.toLowerCase();
  return props.projects.filter(
    (project) =>
      project.name.toLowerCase().includes(query) ||
      project.path.toLowerCase().includes(query)
  );
});

function openProject(path: string) {
  emit("openProject", path);
}
</script>
