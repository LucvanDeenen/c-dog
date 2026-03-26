<template>
  <main class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden" :data-window-mode="windowMode">
    <section class="max-w-[500px] mx-auto w-full p-6">
      <div v-if="loadingProjects" class="py-10 px-4 text-center text-gray-400 text-[0.95rem]">
        Loading projects...
      </div>
      <div v-else-if="projects.length === 0" class="py-10 px-4 text-center text-gray-400 text-[0.95rem]">
        No git projects found
      </div>
      <div v-else-if="filteredProjects.length === 0" class="py-10 px-4 text-center text-gray-400 text-[0.95rem]">
        No projects match your search
      </div>
      <div v-else class="flex flex-col gap-3">
        <section
          v-for="group in groupedProjects"
          :key="group.name"
          class="mb-2"
        >
          <h2 v-if="groupedProjects.length > 1" class="mb-[0.4rem] text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
            {{ group.name }}
          </h2>
          <div class="flex flex-col gap-[0.4rem] pt-[1rem]">
            <ProjectCard
              v-for="project in group.projects"
              :key="project.path"
              :project="project"
              @open="openProject"
            />
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ProjectCard from "./ProjectCard.vue";

const props = defineProps<{
  windowMode: string;
  projects: Array<{ name: string; path: string; branch?: string; group: string; editorHint?: string; editorExplicit?: boolean }>;
  loadingProjects: boolean;
  searchQuery: string;
  hiddenGroups?: string[];
  grouped?: boolean;
  sortByRecent?: boolean;
  recentlyOpened?: Record<string, number>;
}>();
const emit = defineEmits(["openProject"]);

const filteredProjects = computed(() => {
  const hidden = new Set(props.hiddenGroups ?? []);
  const visible = hidden.size > 0
    ? props.projects.filter((p) => !hidden.has(p.group))
    : props.projects;
  const searched = props.searchQuery
    ? (() => {
        const query = props.searchQuery.toLowerCase();
        return visible.filter(
          (p) => p.name.toLowerCase().includes(query) || p.path.toLowerCase().includes(query)
        );
      })()
    : visible;
  if (!props.sortByRecent) return searched;
  const recent = props.recentlyOpened ?? {};
  return [...searched].sort((a, b) => {
    const ta = recent[a.path] ?? 0;
    const tb = recent[b.path] ?? 0;
    if (tb !== ta) return tb - ta;
    return a.name.localeCompare(b.name);
  });
});

const groupedProjects = computed(() => {
  if (props.grouped === false) return [{ name: "", projects: filteredProjects.value }];
  const map = new Map<string, typeof filteredProjects.value>();
  for (const project of filteredProjects.value) {
    if (!map.has(project.group)) map.set(project.group, []);
    map.get(project.group)!.push(project);
  }
  return [...map.entries()].map(([name, projects]) => ({ name, projects }));
});

function openProject(path: string, editorHint?: string) {
  emit("openProject", path, editorHint);
}
</script>
