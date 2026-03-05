import { createRouter, createMemoryHistory, RouteRecordRaw } from "vue-router";
import Constants from "@shared/constants";

const routes: RouteRecordRaw[] = [
  {
    path: Constants.ROUTES.HOME,
    name: "Home",
    component: () => import("@/views/Home.vue"),
    meta: {
      id: "home",
    },
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
export default router;
