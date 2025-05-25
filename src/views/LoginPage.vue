<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const router = useRouter();

const loginForm = reactive({
  username: '',
  password: '',
});

const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    errorMessage.value = 'Пожалуйста, заполните все поля';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  // await axios.post('http://localhost:3000/api/login', {
  //   username:loginForm.username,
  //   password: loginForm.password
  // }).then(response => {
  //   localStorage.setItem('user', JSON.stringify(response.data.user));
  //  router.push('/books')
  // })
  // .catch(error => {
  //   errorMessage.value = 'Неверный логин или пароль'
  //   console.error('Ошибка при попытки авторизаваться:', error);
  // });

  try {
    const success = await userStore.login(
      loginForm.username,
      loginForm.password,
    );

    if (success) {
      router.push({ name: 'books' });
    } else {
      errorMessage.value = 'Неверный логин или пароль';
    }
  } catch (error) {
    errorMessage.value = 'Произошла ошибка при входе';
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Буквариум</h1>
        <p>Вход в приложение</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Логин пользователя</label>
          <input
            id="username"
            type="text"
            v-model="loginForm.username"
            placeholder="Введите логин пользователя"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            type="password"
            v-model="loginForm.password"
            placeholder="Введите пароль"
            :disabled="isLoading"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading">
            <i class="pi pi-spin pi-spinner"></i> Вход...
          </span>
          <span v-else>Войти</span>
        </button>
      </form>

      <!-- <div class="login-help">
        <p :style="{ color: themeStore?.isDarkMode ? '#cbd5e1' : '' }">
          Для демонстрации используйте:
        </p>
        <ul>
          <li :style="{ color: themeStore?.isDarkMode ? '#cbd5e1' : '' }">
            <strong>Администратор:</strong> admin / admin
          </li>
          <li :style="{ color: themeStore?.isDarkMode ? '#cbd5e1' : '' }">
            <strong>Пользователь:</strong> user1 / password
          </li>
        </ul>
      </div> -->

      <div class="login-footer">
        <button class="back-button" @click="router.push('/')">
          <i class="pi pi-arrow-left"></i> На главную
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  animation: fadeInUp 0.5s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.login-header p {
  color: var(--text-color-light);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.error-message {
  color: var(--error-color);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
}

.login-button {
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.login-button:hover:not(:disabled) {
  background-color: var(--secondary-color);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-help {
  margin-top: 2rem;
  padding: 1rem;
  background-color: var(--background-color);
  border-radius: 6px;
  font-size: 0.9rem;
}

.login-help p {
  margin-bottom: 0.5rem;
}

.login-help ul {
  padding-left: 1.5rem;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.back-button:hover {
  background-color: var(--background-color);
  color: var(--secondary-color);
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
  .login-card {
    padding: 1.5rem;
  }

  .login-header h1 {
    font-size: 1.8rem;
  }
}
</style>
