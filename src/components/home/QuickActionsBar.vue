<template>
  <div class="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-neutral-700/50 bg-neutral-900/40">
    <!-- Configuration: default editor + section visibility -->
    <EditorQuickAction :preferred-editor="preferredEditor" @editor-changed="emit('editorChanged', $event)" />
    <SectionsQuickAction :groups="groups" :initial-hidden-groups="hiddenGroups" @sections-changed="emit('sectionsChanged', $event)" />

    <div class="w-px h-5 bg-neutral-700/60 mx-1" />

    <!-- Access: open editor + open terminal -->
    <OpenEditorQuickAction :preferred-editor="preferredEditor" />
    <TerminalQuickAction />

    <div class="flex-1" />

    <div class="w-px h-5 bg-neutral-700/60 mx-1" />

    <!-- Actions: sort + toggle grouping + refresh -->
    <SortQuickAction :sort-by-recent="sortByRecent" @toggle="emit('toggleSort')" />
    <ToggleGroupingQuickAction :grouped="grouped" @toggle="emit('toggleGrouping')" />
    <RefreshQuickAction :loading="loading" @refresh="emit('refresh')" />
  </div>
</template>

<script setup lang="ts">
import EditorQuickAction from "./quick-actions/EditorQuickAction.vue";
import SectionsQuickAction from "./quick-actions/SectionsQuickAction.vue";
import OpenEditorQuickAction from "./quick-actions/OpenEditorQuickAction.vue";
import TerminalQuickAction from "./quick-actions/TerminalQuickAction.vue";
import RefreshQuickAction from "./quick-actions/RefreshQuickAction.vue";
import ToggleGroupingQuickAction from "./quick-actions/ToggleGroupingQuickAction.vue";
import SortQuickAction from "./quick-actions/SortQuickAction.vue";

defineProps<{
  preferredEditor: string;
  loading?: boolean;
  groups?: string[];
  grouped: boolean;
  sortByRecent: boolean;
  hiddenGroups?: string[];
}>();

const emit = defineEmits<{
  editorChanged: [id: string];
  refresh: [];
  sectionsChanged: [hiddenGroups: string[]];
  toggleGrouping: [];
  toggleSort: [];
}>();
</script>
