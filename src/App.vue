<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from './stores/user';
import { useThemeStore } from './stores/theme';
import LoadingOverlay from './components/common/LoadingOverlay.vue';

const userStore = useUserStore();
const themeStore = useThemeStore();
const router = useRouter();
const route = useRoute();

const isLoading = ref(false);
const appClass = computed(() => (themeStore.isDarkMode ? 'dark-theme' : ''));

watch(
  () => route.fullPath,
  () => {
    if (route.meta.requiresAuth && !userStore.isLoggedIn) {
      router.push('/login');
    }

    if (route.meta.requiresAdmin && !userStore.isAdmin) {
      router.push('/books');
    }
  },
);

onMounted(() => {
  // Загрузка данных, если первый запуск
  // if (!userStore.isInitialized) {
  //   userStore.initializeData()
  // }
});
</script>

<template>
  <div :class="appClass">
    <LoadingOverlay v-if="isLoading" />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

#app {
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}
</style>
