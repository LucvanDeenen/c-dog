<template>
  <main class="home-content" :data-window-mode="windowMode">
    <section class="projects-panel">
      <div v-if="loadingProjects" class="projects-state">
        Loading projects...
      </div>
      <div v-else-if="projects.length === 0" class="projects-state">
        No git projects found in ~/repos
      </div>
      <div v-else-if="filteredProjects.length === 0" class="projects-state">
        No projects match your search
      </div>
      <div v-else class="projects-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.path"
          class="project-card"
          @click="openProject(project.path)"
        >
          <div class="project-card__row">
            <svg class="project-card__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path :d="mdiFileCode" fill="currentColor" />
            </svg>
            <div class="project-card__meta">
              <p class="project-card__name">{{ project.name }}</p>
              <p class="project-card__path">{{ project.path }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
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

<style scoped>
.home-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.1rem 1.25rem 0;
}

.projects-panel {
  margin: 0 auto;
}

.projects-state {
  padding: 2.5rem 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.95rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.95rem;
}

.project-card {
  padding: 1rem;
  border: 1px solid rgba(100, 116, 139, 0.35);
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  border-color: rgba(96, 165, 250, 0.8);
  box-shadow: 0 8px 18px rgba(2, 132, 199, 0.18);
  cursor: pointer;
}

.project-card__row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.project-card__icon {
  width: 1.1rem;
  height: 1.1rem;
  color: #60a5fa;
  flex-shrink: 0;
}

.project-card__meta {
  min-width: 0;
}

.project-card__name {
  margin: 0;
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
}

.project-card__path {
  margin: 0.15rem 0 0;
  color: #94a3b8;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
