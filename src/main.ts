import { createApp } from "vue";
import router from "@/plugins/router";
import pinia from "@/plugins/pinia";
import App from "@/App.vue";

import "@/styles/style.css";
import "@/styles/default.css";

const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount("#app");