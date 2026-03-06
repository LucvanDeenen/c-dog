import { createApp } from "vue";
import router from "@/plugins/router";
import pinia from "@/plugins/pinia";
import App from "@/App.vue";

import "@/styles/style.css";
import "@/styles/default.css";

// Apply dark mode by default
if (!document.documentElement.classList.contains("dark")) {
  document.documentElement.classList.add("dark");
}

const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount("#app");