<template>
  <header class="home-header">
    <div class="home-header__search-row">
      <label class="search-field" for="project-search">
        <svg class="search-field__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path :d="mdiMagnify" fill="currentColor" />
        </svg>
        <input
          id="project-search"
          :value="searchQuery"
          @input="(e: Event) => emit('update:searchQuery', (e.target && (e.target as HTMLInputElement).value) || '')"
          type="text"
          placeholder="Search projects..."
          class="search-field__input"
        />
      </label>
      <IconButton
        :icon="windowMode === 'regular' ? mdiArrowBottomRight : mdiWindowMaximize"
        :title="`Switch to ${windowMode === 'regular' ? 'Docked' : 'Regular'} Mode`"
        iconClass="w-5 h-5"
        customClass="home-header__action-btn"
        @click="toggleWindowMode"
      />
      <IconButton
        :icon="mdiClose"
        iconClass="w-5 h-5"
        customClass="home-header__icon-btn"
        @click="closeToTray"
      />
    </div>

    <div class="home-header__actions-row">
      <IconButton
        :icon="mdiCog"
        title="Settings"
        iconClass="w-5 h-5"
        customClass="home-header__action-btn"
        @click="openSettings"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { mdiArrowBottomRight, mdiWindowMaximize, mdiMagnify, mdiClose, mdiCog } from "@mdi/js";
import IconButton from "@/components/common/IconButton.vue";

const emit = defineEmits(["update:searchQuery", "toggleWindowMode", "closeToTray", "openSettings"]);

defineProps<{
  windowMode: string;
  searchQuery: string;
}>();

function toggleWindowMode() {
  emit("toggleWindowMode");
}

function closeToTray() {
  emit("closeToTray");
}

function openSettings() {
  emit("openSettings");
}
</script>

<style scoped>
.home-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.75));
}

.home-header__search-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-field {
  flex: 1;
  min-height: 2.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.65);
}

.search-field:focus-within {
  border-color: rgba(59, 130, 246, 0.9);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.search-field__icon {
  width: 1rem;
  height: 1rem;
  color: #94a3b8;
}

.search-field__input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #e2e8f0;
  font-size: 0.9rem;
  line-height: 1.3;
}

.search-field__input::placeholder {
  color: #64748b;
}

:deep(.home-header__icon-btn),
:deep(.home-header__mode-btn) {
  height: 2.75rem;
  width: 2.75rem;
  border-radius: 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

:deep(.home-header__action-btn) {
  height: 2.25rem;
  width: 2.25rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  transition: background 0.15s, color 0.15s;
}

:deep(.home-header__action-btn:hover) {
  background: rgba(148, 163, 184, 0.1);
  color: #e2e8f0;
}

.home-header__actions-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.home-header__icon-btn:hover),
:deep(.home-header__mode-btn:hover) {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(96, 165, 250, 0.7);
}

.home-header__actions-row {
  display: flex;
  align-items: center;
}

@media (max-width: 640px) {
  .home-header {
    padding: 0.85rem;
  }

  .home-header__search-row {
    gap: 0.5rem;
  }
}
</style>
