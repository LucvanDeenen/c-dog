<template>
  <header class="home-header">
    <div class="home-header__row">
      <IconButton
        :icon="mdiCog"
        title="Settings"
        iconClass="w-5 h-5"
        customClass="home-header__action-btn"
        @click="openSettings"
      />

      <div class="home-header__search-area">
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
      </div>

      <div class="home-header__window-controls">
        <IconButton
          :icon="windowMode === 'regular' ? mdiArrowBottomRight : mdiWindowMaximize"
          :title="`Switch to ${windowMode === 'regular' ? 'Docked' : 'Regular'} Mode`"
          iconClass="w-5 h-5"
          customClass="home-header__action-btn"
          @click="toggleWindowMode"
        />
        <IconButton
          :icon="mdiClose"
          title="Close to tray"
          iconClass="w-5 h-5"
          customClass="home-header__action-btn home-header__close-btn"
          @click="closeToTray"
        />
      </div>
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
  padding: 0.875rem 0.75rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.75));
}

.home-header__row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.home-header__search-area {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 0.25rem;
}

.home-header__search-area .search-field {
  width: 100%;
}

.home-header__window-controls {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.search-field {
  flex: 1;
  min-height: 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem 0.25rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.65);
  overflow: hidden;
}

.search-field:focus-within {
  border-color: rgba(59, 130, 246, 0.9);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.search-field__icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  color: #94a3b8;
}

.search-field__input {
  flex: 1;
  min-width: 0;
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

.search-close-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  border-radius: 0.375rem;
  padding: 0;
  transition: color 0.15s, background 0.15s;
}

.search-close-btn:hover {
  color: #e2e8f0;
  background: rgba(148, 163, 184, 0.1);
}

.search-close-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

.search-expand-enter-active,
.search-expand-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.search-expand-enter-from,
.search-expand-leave-to {
  opacity: 0;
  transform: scaleX(0.85);
  transform-origin: left center;
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

:deep(.home-header__close-btn:hover) {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}
</style>
