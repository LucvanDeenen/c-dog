import type { File } from "@shared/types";
import { defineStore } from "pinia";
import Constants from "@shared/constants";

export const useFileStore = defineStore(Constants.STORE.FILES, {
  state: (): { selectedFile: File | null; files: File[] } => ({
    selectedFile: null,
    files: [],
  }),

  getters: {
    getSelectedFile: (state) => state.selectedFile,
    getFiles: (state) => state.files,
  },

  actions: {
    setSelectedFile(file: File | null) {
      this.selectedFile = file;
    },

    async syncDocuments() {
      try {
        // this.files = await window.api.fs.syncDocuments();
      } catch (error) {
        console.error("Failed to sync documents:", error);
      }
    },
  },

  persist: {
    key: Constants.STORE.FILES,
    storage: localStorage,
  },
});
