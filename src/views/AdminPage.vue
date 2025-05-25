<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import MainLayout from '../components/layouts/MainLayout.vue';

import { useThemeStore } from '../stores/theme';
const themeStore = useThemeStore();
const userStore = useUserStore();
const isLoading = ref(true);

// Вкладки админ-панели
const activeTab = ref('users');

// Данные для формы добавления книги
const newBook = ref({
  title: '',
  author: '',
  description: '',
  coverImage: '',
  publishYear: new Date().getFullYear(),
  pageCount: 200,
  genres: [] as string[],
});

// Список всех доступных жанров
const availableGenres = computed(() => {
  const genres = new Set<string>();
  userStore.books.forEach((book) => {
    book.genres.forEach((genre) => {
      genres.add(genre);
    });
  });
  return Array.from(genres).sort();
});

// Пользователи (кроме админа)

// Валидация формы книги
const isFormValid = computed(() => {
  return (
    newBook.value.title.trim() !== '' &&
    newBook.value.author.trim() !== '' &&
    newBook.value.description.trim() !== '' &&
    newBook.value.coverImage.trim() !== '' &&
    newBook.value.genres.length > 0
  );
});

// Обработчики
const setActiveTab = (tab: string) => {
  activeTab.value = tab;
};

const toggleGenre = (genre: string) => {
  const index = newBook.value.genres.indexOf(genre);

  if (index >= 0) {
    newBook.value.genres.splice(index, 1);
  } else {
    newBook.value.genres.push(genre);
  }
};

const addBook = () => {
  if (!isFormValid.value) return;

  userStore.addBook({
    title: newBook.value.title,
    author: newBook.value.author,
    description: newBook.value.description,
    coverImage: newBook.value.coverImage,
    publishYear: newBook.value.publishYear,
    pageCount: newBook.value.pageCount,
    genres: newBook.value.genres,
    rating: 0,
    ratingsCount: 0,
    comments: [],
    content: generateBookContent(newBook.value.pageCount),
  });

  // Сбрасываем форму
  newBook.value = {
    title: '',
    author: '',
    description: '',
    coverImage: '',
    publishYear: new Date().getFullYear(),
    pageCount: 200,
    genres: [],
  };
};

const deleteBook = (bookId: number) => {
  if (confirm('Вы уверены, что хотите удалить эту книгу?')) {
    userStore.deleteBook(bookId);
  }
};

const deleteUser = (userId: number) => {
  if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
    userStore.deleteUser(userId);
  }
};

// Генерация контента книги
const generateBookContent = (pageCount: number): string => {
  const loremText = `
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam,
    eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui
    ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit,
    sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
  `
    .replace(/\s+/g, ' ')
    .trim();

  const pageSize = 2000; // Примерное количество символов на страницу
  let content = '';

  while (content.length < pageCount * pageSize) {
    content += loremText + ' ';
  }

  return content.substring(0, pageCount * pageSize);
};

onMounted(() => {
  const rawUser = localStorage.getItem('user');
  if (rawUser) {
    userStore.user = JSON.parse(rawUser);
  }
  userStore.fetchUsers();
  setTimeout(() => {
    isLoading.value = false;
  }, (window as any).fakeDelay || 500);
});
</script>

<template>
  <MainLayout>
    <template #header>
      <h1 :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }">
        Панель администратора
      </h1>
    </template>

    <div class="admin-page">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <div>Загрузка панели администратора...</div>
      </div>

      <template v-else-if="userStore.isAdmin">
        <div class="admin-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'users' }"
            @click="setActiveTab('users')"
          >
            <i class="pi pi-users"></i> Пользователи
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'books' }"
            @click="setActiveTab('books')"
          >
            <i class="pi pi-book"></i> Книги
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'add-book' }"
            @click="setActiveTab('add-book')"
          >
            <i class="pi pi-plus"></i> Добавить книгу
          </button>
        </div>

        <div class="admin-content">
          <!-- Управление пользователями -->
          <div v-if="activeTab === 'users'" class="users-management">
            <h2 :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }">
              Управление пользователями
            </h2>

            <div class="admin-stats">
              <div class="admin-stat-card">
                <i class="pi pi-users stat-icon"></i>
                <div class="stat-info">
                  <div
                    class="stat-value"
                    :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }"
                  >
                    {{ userStore.users.length }}
                  </div>
                  <div class="stat-label">Всего пользователей</div>
                </div>
              </div>
            </div>

            <div class="users-list">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Логин</th>
                    <th>Роль</th>
                    <th>Книг прочитано</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in userStore.users" :key="user.id">
                    <td
                      :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }"
                    >
                      {{ user.id }}
                    </td>
                    <td
                      :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }"
                    >
                      {{ user.name }}
                    </td>
                    <td
                      :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }"
                    >
                      {{ user.username }}
                    </td>
                    <td>
                      <span
                        class="role-badge"
                        :class="{ 'admin-badge': user.role === 'admin' }"
                      >
                        {{
                          user.role === 'admin'
                            ? 'Администратор'
                            : 'Пользователь'
                        }}
                      </span>
                    </td>
                    <td
                      :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }"
                    >
                      {{ user.readBooks.length }}
                    </td>
                    <td>
                      <button
                        v-if="user.id !== 1748116008156"
                        class="delete-btn"
                        @click="deleteUser(user.id)"
                      >
                        <i class="pi pi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Управление книгами -->
          <div v-if="activeTab === 'books'" class="books-management">
            <h2>Управление книгами</h2>

            <div class="admin-stats">
              <div class="admin-stat-card">
                <i class="pi pi-book stat-icon"></i>
                <div class="stat-info">
                  <div
                    class="stat-value"
                    :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }"
                  >
                    {{ userStore.books.length }}
                  </div>
                  <div class="stat-label">Всего книг</div>
                </div>
              </div>
            </div>

            <div class="books-list">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Обложка</th>
                    <th>Название</th>
                    <th>Автор</th>
                    <th>Жанры</th>
                    <th>Рейтинг</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="book in userStore.books" :key="book.id">
                    <td
                      :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }"
                    >
                      {{ book.id }}
                    </td>
                    <td>
                      <div class="book-cover-thumbnail">
                        <img :src="book.coverImage" :alt="book.title" />
                      </div>
                    </td>
                    <td
                      :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }"
                    >
                      {{ book.title }}
                    </td>
                    <td
                      :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }"
                    >
                      {{ book.author }}
                    </td>
                    <td>
                      <div class="book-genres">
                        <span
                          v-for="genre in book.genres"
                          :key="genre"
                          class="genre-badge"
                        >
                          {{ genre }}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div class="book-rating">
                        <i class="pi pi-star-fill"></i>
                        <span>{{ book.rating }} ({{ book.ratingsCount }})</span>
                      </div>
                    </td>
                    <td>
                      <button
                        class="view-btn"
                        @click="$router.push(`/books/${book.id}`)"
                      >
                        <i class="pi pi-eye"></i>
                      </button>
                      <button class="delete-btn" @click="deleteBook(book.id)">
                        <i class="pi pi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Добавление книги -->
          <div v-if="activeTab === 'add-book'" class="add-book-form">
            <h2>Добавить новую книгу</h2>

            <form @submit.prevent="addBook">
              <div class="form-group">
                <label for="title">Название книги</label>
                <input
                  id="title"
                  type="text"
                  v-model="newBook.title"
                  required
                  placeholder="Введите название книги"
                />
              </div>

              <div class="form-group">
                <label for="author">Автор</label>
                <input
                  id="author"
                  type="text"
                  v-model="newBook.author"
                  required
                  placeholder="Введите имя автора"
                />
              </div>

              <div class="form-group">
                <label for="description">Описание</label>
                <textarea
                  id="description"
                  v-model="newBook.description"
                  required
                  rows="4"
                  placeholder="Введите описание книги"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="coverImage">URL обложки</label>
                <input
                  id="coverImage"
                  type="url"
                  v-model="newBook.coverImage"
                  required
                  placeholder="Введите URL изображения обложки"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="publishYear">Год издания</label>
                  <input
                    id="publishYear"
                    type="number"
                    v-model="newBook.publishYear"
                    required
                    min="1800"
                    :max="new Date().getFullYear()"
                  />
                </div>

                <div class="form-group">
                  <label for="pageCount">Количество страниц</label>
                  <input
                    id="pageCount"
                    type="number"
                    v-model="newBook.pageCount"
                    required
                    min="1"
                    max="10000"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Жанры</label>
                <div class="genres-checkboxes">
                  <div
                    v-for="genre in availableGenres"
                    :key="genre"
                    class="genre-checkbox"
                  >
                    <label :for="`genre-${genre}`" class="checkbox-label">
                      <input
                        :id="`genre-${genre}`"
                        type="checkbox"
                        :checked="newBook.genres.includes(genre)"
                        @change="toggleGenre(genre)"
                      />
                      <span>{{ genre }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="selected-genres" v-if="newBook.genres.length > 0">
                <h3>Выбранные жанры:</h3>
                <div class="genre-tags">
                  <span
                    v-for="genre in newBook.genres"
                    :key="genre"
                    class="genre-badge"
                  >
                    {{ genre }}
                  </span>
                </div>
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  class="submit-btn"
                  :disabled="!isFormValid"
                >
                  Добавить книгу
                </button>
              </div>
            </form>
          </div>
        </div>
      </template>
      <div v-else class="access-denied">
        <i class="pi pi-lock access-denied-icon"></i>
        <h2>Доступ запрещен</h2>
        <p>У вас нет прав для просмотра этой страницы</p>
        <router-link to="/books" class="primary-btn">
          Вернуться к книгам
        </router-link>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.admin-page {
  padding-bottom: 3rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
  color: var(--text-color-light);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(90, 103, 216, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-btn {
  background-color: var(--card-background);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
  flex-shrink: 0;
}

.tab-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.tab-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.admin-content {
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 2rem;
}

.admin-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.admin-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.admin-stat-card {
  background-color: var(--background-color);
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-width: 200px;
}

.stat-icon {
  font-size: 2rem;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-color-light);
}

.users-list,
.books-list {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  font-weight: 600;
  color: var(--text-color-light);
  background-color: var(--background-color);
}

td {
  vertical-align: middle;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  background-color: var(--secondary-color);
  color: white;
}

.role-badge.admin-badge {
  background-color: var(--accent-color);
}

.book-cover-thumbnail {
  width: 40px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}

.book-cover-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.genre-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  background-color: var(--primary-color);
  color: white;
}

.book-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-color);
}

.view-btn,
.delete-btn {
  background: none;
  border: none;
  padding: 0.4rem;
  cursor: pointer;
  border-radius: 4px;
  margin-right: 0.25rem;
}

.view-btn {
  color: var(--primary-color);
}

.delete-btn {
  color: var(--error-color);
}

.view-btn:hover {
  background-color: rgba(90, 103, 216, 0.1);
}

.delete-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.add-book-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  background-color: var(--background-color);
  color: var(--text-color);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.genres-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  background-color: var(--background-color);
  padding: 1rem;
  border-radius: 6px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  accent-color: var(--primary-color);
}

.selected-genres {
  margin-bottom: 1.5rem;
}

.selected-genres h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--secondary-color);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.access-denied {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.access-denied-icon {
  font-size: 4rem;
  color: var(--error-color);
  margin-bottom: 1.5rem;
}

.access-denied h2 {
  margin: 0 0 1rem;
  font-size: 2rem;
}

.access-denied p {
  margin: 0 0 2rem;
  color: var(--text-color-light);
}

.primary-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.3s;
}

.primary-btn:hover {
  background-color: var(--secondary-color);
}

@media (max-width: 768px) {
  .admin-content {
    padding: 1.5rem 1rem;
  }

  .admin-tabs {
    justify-content: flex-start;
  }

  .admin-stats {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  th,
  td {
    padding: 0.5rem;
  }

  .book-genres {
    max-width: 150px;
  }
}
</style>
