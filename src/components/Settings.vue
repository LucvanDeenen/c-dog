<template>
  <div v-if="isOpen" class="settings-overlay" @click.self="closeModal">
    <div class="settings-modal" @click.stop>
      <div class="modal-header">
        <div class="modal-header__title-row">
          <h2 class="modal-title">Settings</h2>
          <span v-if="appVersion" class="modal-version">v{{ appVersion }}</span>
        </div>
      </div>

      <div class="modal-body">
        <!-- Window Mode Setting -->
        <div class="setting-section">
          <h3 class="section-title">Window Mode</h3>
          <div class="setting-options">
            <label class="setting-option">
              <input
                type="radio"
                :value="'regular'"
                v-model="windowMode"
                @change="handleModeChange"
                class="w-4 h-4"
              />
              <div>
                <span class="option-label">Regular Mode</span>
                <span class="option-desc">Full-size window (1500x1000)</span>
              </div>
            </label>

            <label class="setting-option">
              <input
                type="radio"
                :value="'docked'"
                v-model="windowMode"
                @change="handleModeChange"
                class="w-4 h-4"
              />
              <div>
                <span class="option-label">Docked Mode</span>
                <span class="option-desc"
                  >Floating window near tray (400x300)</span
                >
              </div>
            </label>
          </div>

          <p v-if="changingMode" class="switching-note">
            Switching window mode...
          </p>
        </div>

        <!-- Startup Setting -->
        <div class="setting-section setting-section--bordered">
          <h3 class="section-title">Startup</h3>
          <label class="setting-option">
            <input
              type="checkbox"
              v-model="launchAtStartup"
              @change="handleLaunchAtStartupChange"
              class="w-4 h-4"
            />
            <div>
              <span class="option-label">Launch at startup</span>
              <span class="option-desc"
                >Start minimized to tray when you log in</span
              >
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { mdiClose } from "@mdi/js";
import type { WindowMode } from "@electron/services/settings";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const windowMode = ref<WindowMode>("regular");
const changingMode = ref(false);
const launchAtStartup = ref(false);
const appVersion = ref("");
let isInitializing = true;

let modeChangeHandler: ((_event: any, mode: WindowMode) => void) | null = null;

const closeModal = () => {
  emit("close");
};

onMounted(async () => {
  // Fetch current window mode on mount
  console.log(
    "Initializing Settings.vue, fetching current window mode: ",
    isInitializing,
  );
  try {
    const settings = await window.api.settings.getSettings();
    windowMode.value = settings.windowMode;
    launchAtStartup.value = settings.launchAtStartup;
    appVersion.value = await window.api.settings.getVersion();
    console.log(
      "Settings component mounted, loaded window mode:",
      windowMode.value,
    );
  } catch (error) {
    console.error("Failed to load settings:", error);
  }

  isInitializing = false;

  // Create a named handler so we can remove it later
  modeChangeHandler = (_event: any, mode: WindowMode) => {
    console.log(
      "Settings.vue received window:modeChanged event with mode:",
      mode,
    );
    windowMode.value = mode;
    changingMode.value = false;
  };

  // Listen for mode changes (indicates new window loaded after switch)
  window.ipc.on("window:modeChanged", modeChangeHandler);
});

onUnmounted(() => {
  // Clean up the listener when the component is unmounted
  if (modeChangeHandler) {
    window.ipc.off("window:modeChanged", modeChangeHandler);
    modeChangeHandler = null;
  }
});

const handleModeChange = async () => {
  console.log("handleModeChange triggered, new mode:", windowMode.value);
  changingMode.value = true;

  try {
    // Send IPC message to main process to switch mode
    // The main process will save the setting and recreate the window
    console.log(
      "Sending window:switchMode IPC message with mode:",
      windowMode.value,
    );
    window.ipc.send("window:switchMode", windowMode.value);
    console.log("IPC message sent");
    // Once window recreates, window:modeChanged event will fire and update the UI
  } catch (error) {
    console.error("Failed to change window mode:", error);
    changingMode.value = false;
  }
};

const handleLaunchAtStartupChange = async () => {
  try {
    await window.api.settings.setLaunchAtStartup(launchAtStartup.value);
  } catch (error) {
    console.error("Failed to update launch at startup:", error);
    launchAtStartup.value = !launchAtStartup.value;
  }
};
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.settings-modal {
  background: #1e2336;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 28rem;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  color: #e2e8f0;
}

.modal-header {
  position: sticky;
  top: 0;
  background: #1e2336;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header__title-row {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.modal-version {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.modal-close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}

.modal-close-btn:hover {
  color: #e2e8f0;
}

.modal-body {
  padding: 1.5rem;
}

.setting-section {
  padding-bottom: 1.5rem;
}

.setting-section--bordered {
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  padding-top: 1.5rem;
  padding-bottom: 0;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem;
}

.setting-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.setting-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.option-label {
  display: block;
  font-weight: 500;
  color: #e2e8f0;
  font-size: 0.9rem;
}

.option-desc {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.1rem;
}

.switching-note {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #60a5fa;
}
</style>
