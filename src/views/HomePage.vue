<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false

    // Если пользователь уже авторизован, перенаправляем на страницу с книгами
    if (userStore.isLoggedIn) {
      router.push('/books')
    }
  }, (window as any).fakeDelay || 500)
})
</script>

<template>
  <div class="home-container">
    <div v-if="isLoading" class="loading-wrapper">
      <div class="loading-spinner"></div>
      <div class="loading-text">Загрузка приложения...</div>
    </div>
    <div v-else class="home-content">
      <header class="home-header">
        <div class="logo">
          <h1>Буквариум</h1>
          <p class="tagline">Ваша личная вселенная книг</p>
        </div>
      </header>

      <main class="home-main">
        <div class="hero-section">
          <h2>Добро пожаловать в мир литературы</h2>
          <p>
            Буквариум — это современное приложение для чтения и анализа книг с возможностью
            обсуждения и персонализированных рекомендаций на основе ваших предпочтений.
          </p>

          <div class="cta-buttons">
            <button class="primary-btn" @click="router.push('/login')">
              Войти в приложение
            </button>

            <button class="primary-btn" @click="router.push('/registration')">
             Регистрация
            </button>
          </div>
        </div>

        <div class="features-section">
          <h3>Основные возможности:</h3>
          <div class="features-grid">
            <div class="feature-card">
              <i class="pi pi-book feature-icon"></i>
              <h4>Удобное чтение</h4>
              <p>Настраиваемый интерфейс читалки с возможностью изменять шрифт и тему</p>
            </div>

            <div class="feature-card">
              <i class="pi pi-star feature-icon"></i>
              <h4>Рейтинги и обзоры</h4>
              <p>Оценивайте книги и делитесь своим мнением с другими пользователями</p>
            </div>

            <div class="feature-card">
              <i class="pi pi-chart-bar feature-icon"></i>
              <h4>Персональная аналитика</h4>
              <p>Отслеживайте статистику чтения и прогресс по каждой книге</p>
            </div>

            <div class="feature-card">
              <i class="pi pi-thumbs-up feature-icon"></i>
              <h4>Рекомендации</h4>
              <p>Получайте персонализированные рекомендации на основе ваших предпочтений</p>
            </div>
          </div>
        </div>
      </main>

      <footer class="home-footer">
        <p>&copy; 2025 Буквариум. Все права защищены.</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.loading-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(90, 103, 216, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: var(--text-color);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.home-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.home-header {
  padding: 2rem;
  text-align: center;
  animation: fadeInDown 0.8s ease-out;
}

.logo h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tagline {
  font-size: 1.2rem;
  color: var(--text-color-light);
}

.home-main {
  flex: 1;
  padding: 1rem 2rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.hero-section {
  text-align: center;
  margin-bottom: 4rem;
  animation: fadeInUp 0.8s ease-out;
}

.hero-section h2 {
  font-size: 2.2rem;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.primary-btn {
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.primary-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

.features-section {
  animation: fadeIn 1s ease-out 0.3s both;
}

.features-section h3 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.feature-card h4 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: var(--text-color-light);
}

.home-footer {
  text-align: center;
  padding: 2rem;
  background-color: var(--card-background);
  color: var(--text-color-light);
  border-top: 1px solid var(--border-color);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .home-header {
    padding: 1.5rem 1rem;
  }

  .logo h1 {
    font-size: 2.2rem;
  }

  .home-main {
    padding: 1rem 1rem 2rem;
  }

  .hero-section h2 {
    font-size: 1.8rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>