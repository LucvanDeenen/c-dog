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
      <div v-else class="projects-sections">
        <section
          v-for="group in groupedProjects"
          :key="group.name"
          class="projects-section"
        >
          <h2 v-if="groupedProjects.length > 1" class="projects-section__heading">
            {{ group.name }}
          </h2>
          <div class="projects-grid">
            <div
              v-for="project in group.projects"
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
                  <div class="project-card__info-row">
                    <button
                      class="project-card__path-btn"
                      title="Open folder"
                      @click="openFolder($event, project.path)"
                    >
                      <svg viewBox="0 0 24 24" class="project-card__folder-icon">
                        <path :d="mdiFolder" fill="currentColor" />
                      </svg>
                      <span class="project-card__path">{{ relativePath(project.path) }}</span>
                    </button>
                    <span v-if="project.branch" class="project-card__branch">
                      <svg class="project-card__branch-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path :d="mdiSourceBranch" fill="currentColor" />
                      </svg>
                      {{ project.branch }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { mdiFileCode, mdiSourceBranch, mdiFolder } from "@mdi/js";
import { computed } from "vue";

const props = defineProps<{
  windowMode: string;
  projects: Array<{ name: string; path: string; branch?: string; group: string }>;
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

const groupedProjects = computed(() => {
  const map = new Map<string, typeof filteredProjects.value>();
  for (const project of filteredProjects.value) {
    if (!map.has(project.group)) map.set(project.group, []);
    map.get(project.group)!.push(project);
  }
  return [...map.entries()].map(([name, projects]) => ({ name, projects }));
});

function openProject(path: string) {
  emit("openProject", path);
}

async function openFolder(event: MouseEvent, projectPath: string) {
  event.stopPropagation();
  await (window.api.fs as any).openFolder(projectPath);
}

function relativePath(fullPath: string): string {
  // Replace the home directory prefix with ~
  const home = fullPath.includes("\\") 
    ? (fullPath.match(/^([A-Za-z]:\\Users\\[^\\]+)/) || [])[1] ?? ""
    : (fullPath.match(/^\/home\/[^\/]+/) || [])[0] ?? "";
  if (home && fullPath.startsWith(home)) {
    return "~" + fullPath.slice(home.length).replace(/\\/g, "/");
  }
  return fullPath;
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

.projects-sections {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.projects-section__heading {
  margin: 0 0 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #475569;
}

.projects-state {
  padding: 2.5rem 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.95rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.5rem;
}

.project-card {
  padding: 0.6rem 0.75rem;
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
  gap: 0.5rem;
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
  font-size: 0.875rem;
  font-weight: 600;
}

.project-card__path {
  color: #94a3b8;
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.project-card__info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.1rem;
  min-width: 0;
}

.project-card__path-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #64748b;
  min-width: 0;
  overflow: hidden;
  transition: color 0.15s;
}

.project-card__path-btn:hover {
  color: #94a3b8;
}

.project-card__branch {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: #64748b;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.15s;
}

.project-card__branch-icon {
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
}

.project-card__folder-icon {
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
