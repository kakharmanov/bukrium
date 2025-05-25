import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

import HomePage from '../views/HomePage.vue';
import BooksPage from '../views/BooksPage.vue';
import BookDetailsPage from '../views/BookDetailsPage.vue';
import BookReaderPage from '../views/BookReaderPage.vue';
import LoginPage from '../views/LoginPage.vue';
import ProfilePage from '../views/ProfilePage.vue';
import AdminPage from '../views/AdminPage.vue';
import NotFoundPage from '../views/NotFoundPage.vue';
import RegistrationPage from '../views/RegistrationPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/books',
      name: 'books',
      component: BooksPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/books/:id',
      name: 'book-details',
      component: BookDetailsPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/books/:id/read',
      name: 'book-reader',
      component: BookReaderPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/registration',
      name: 'Registration',
      component: RegistrationPage,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPage,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage,
    },
  ],
  // scrollBehavior(to, from, savedPosition) {
  //   if (savedPosition) {
  //     return savedPosition;
  //   } else {
  //     return { top: 0 };
  //   }
  // },
});

router.beforeEach((to, _, next) => {
  const userStore = useUserStore();

  // Искусственная задержка загрузки для имитации реального приложения
  const delay = (window as any).fakeDelay || 0;

  if (delay > 0) {
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.classList.add('loading');
    }

    setTimeout(() => {
      if (appElement) {
        appElement.classList.remove('loading');
      }

      // Проверка авторизации
      if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        next({ name: 'login' });
      } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
        next({ name: 'books' });
      } else {
        next();
      }
    }, delay);
  } else {
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
      next({ name: 'login' });
    } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
      next({ name: 'books' });
    } else {
      next();
    }
  }
});

export default router;
