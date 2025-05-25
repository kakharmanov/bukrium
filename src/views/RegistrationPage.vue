<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const form = reactive({
  username: '',
  password: '',
  passwordRepeat: '',
  name: '',
  role: 'user', // по умолчанию
});

const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  if (!form.username || !form.password || !form.name || !form.passwordRepeat) {
    errorMessage.value = 'Пожалуйста, заполните все поля';
    return;
  }

  if (form.password !== form.passwordRepeat) {
    errorMessage.value = 'Введенный пароль не сопадает';
    return;
  }

  await axios
    .post('https://simple-server-09r4.onrender.com/api/create-user', form)
    .then(() => {
      router.push('/login');
    })
    .catch((error) => {
      errorMessage.value = 'Ошибка при создании пользователя';
      console.error('Ошибка при попытки регистрации:', error);
    });
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Буквариум</h1>
        <p>Регистрация в приложении</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Логин</label>
          <input
            id="username"
            type="text"
            v-model="form.username"
            placeholder="Введите логин"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="username">имя пользователя</label>
          <input
            id="username"
            type="text"
            v-model="form.name"
            placeholder="Введите имя"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            placeholder="Введите пароль"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Повторный пароль</label>
          <input
            id="passwordRepeat"
            type="password"
            v-model="form.passwordRepeat"
            placeholder="Введите пароль еще раз"
            :disabled="isLoading"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading">
            <i class="pi pi-spin pi-spinner"></i> Создание...
          </span>
          <span v-else>Создать</span>
        </button>
      </form>

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
