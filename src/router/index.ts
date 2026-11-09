import { createRouter, createWebHistory } from "vue-router";
import SupportPage from "../pages/SupportPage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: "/", name: "support", component: SupportPage }],
});

export default router;
