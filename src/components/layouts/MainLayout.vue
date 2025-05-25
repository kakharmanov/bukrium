<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { useThemeStore } from '../../stores/theme';

const router = useRouter();
const userStore = useUserStore();
const themeStore = useThemeStore();

const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);

// const currentUser = computed(() => userStore.currentUser);
const isAdmin = computed(() => userStore.isAdmin);

// const userJson = localStorage.getItem('user');
// const user = userJson ? JSON.parse(userJson) : null;

// const isAdmin = computed(() => user?.isAdmin === true);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const logout = () => {
  userStore.logout();
  router.push('/login');
};

const toggleTheme = () => {
  themeStore.toggleDarkMode();
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);

  // Инициализация темы
  themeStore.initializeTheme();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="main-layout">
    <header class="main-header" :class="{ scrolled: isScrolled }">
      <div class="header-container">
        <div class="logo-container">
          <router-link to="/books" class="logo"> Буквариум </router-link>
        </div>

        <nav class="main-nav" :class="{ 'is-open': isMobileMenuOpen }">
          <ul class="nav-list">
            <li>
              <router-link to="/books" @click="closeMobileMenu">
                <i class="pi pi-book"></i> Книги
              </router-link>
            </li>
            <li v-if="isAdmin">
              <router-link to="/admin" @click="closeMobileMenu">
                <i class="pi pi-cog"></i> Управление
              </router-link>
            </li>
            <li>
              <router-link to="/profile" @click="closeMobileMenu">
                <i class="pi pi-user"></i> Профиль
              </router-link>
            </li>
            <li class="theme-toggle-item">
              <button class="theme-toggle" @click="toggleTheme">
                <i
                  class="pi"
                  :class="themeStore.isDarkMode ? 'pi-sun' : 'pi-moon'"
                ></i>
              </button>
            </li>
            <li class="logout-item">
              <button class="logout-button" @click="logout">
                <i class="pi pi-sign-out"></i> Выйти
              </button>
            </li>
          </ul>
        </nav>

        <div class="mobile-actions">
          <button class="theme-toggle" @click="toggleTheme">
            <i
              class="pi"
              :class="themeStore.isDarkMode ? 'pi-sun' : 'pi-moon'"
            ></i>
          </button>
          <button class="menu-toggle" @click="toggleMobileMenu">
            <i
              class="pi"
              :class="isMobileMenuOpen ? 'pi-times' : 'pi-bars'"
            ></i>
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="content-header">
        <div class="container">
          <slot name="header"></slot>
        </div>
      </div>

      <div class="container">
        <slot></slot>
      </div>
    </main>

    <footer class="main-footer">
      <div class="container">
        <p>&copy; 2025 Буквариум. Все права защищены.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-header {
  background-color: var(--card-background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.main-header.scrolled {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1280px;
  margin: 0 auto;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(
    45deg,
    var(--primary-color),
    var(--secondary-color)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-decoration: none;
}

.main-nav {
  display: flex;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1.5rem;
  align-items: center;
}

.nav-list a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  position: relative;
}

.nav-list a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: width 0.3s;
}

.nav-list a:hover::after,
.nav-list a.router-link-active::after {
  width: 100%;
}

.theme-toggle,
.menu-toggle {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover,
.menu-toggle:hover {
  color: var(--primary-color);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.logout-button:hover {
  background-color: var(--error-color);
  color: white;
  border-color: var(--error-color);
}

.mobile-actions {
  display: none;
  align-items: center;
  gap: 1rem;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-header {
  background-color: var(--card-background);
  padding: 2rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.content-header h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--primary-color);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}

.main-footer {
  background-color: var(--card-background);
  padding: 2rem 0;
  margin-top: 3rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--text-color-light);
}

@media (max-width: 768px) {
  .header-container {
    padding: 1rem;
  }

  .main-nav {
    position: fixed;
    top: 0;
    right: -100%;
    height: 100vh;
    width: 80%;
    max-width: 300px;
    background-color: var(--card-background);
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease;
    flex-direction: column;
    padding: 4rem 2rem 2rem;
    z-index: 200;
  }

  .main-nav.is-open {
    right: 0;
  }

  .nav-list {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .nav-list a::after {
    display: none;
  }

  .mobile-actions {
    display: flex;
  }

  .theme-toggle-item {
    display: none;
  }

  .content-header {
    padding: 1.5rem 0;
    margin-bottom: 1.5rem;
  }

  .content-header h1 {
    font-size: 1.8rem;
  }

  .container {
    padding: 0 1rem;
  }
}
</style>
