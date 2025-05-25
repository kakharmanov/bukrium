<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/books')
}
</script>

<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Страница не найдена</h1>
      <p>Запрашиваемая страница не существует или была перемещена</p>
      
      <div class="action-buttons">
        <button class="back-btn" @click="goBack">
          <i class="pi pi-arrow-left"></i> Назад
        </button>
        <button class="home-btn" @click="goHome">
          <i class="pi pi-home"></i> На главную
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.error-code {
  font-size: 6rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  color: var(--text-color-light);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.back-btn,
.home-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.back-btn {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.back-btn:hover {
  background-color: var(--border-color);
  transform: translateY(-2px);
}

.home-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.home-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
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

@media (max-width: 480px) {
  .error-code {
    font-size: 4rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>