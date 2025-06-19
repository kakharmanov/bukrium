<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useThemeStore } from '../stores/theme'
import MainLayout from '../components/layouts/MainLayout.vue'
import BookCard from '../components/books/BookCard.vue'

const userStore = useUserStore()
const themeStore = useThemeStore()

const isLoading = ref(true)
const isEditMode = ref(false)
const editedName = ref('')
const selectedGenres = ref<string[]>([])
const availableGenres = ref<string[]>([])

// Получаем пользователя из хранилища
const user = computed(() => userStore.currentUser)

// Получаем книги, прочитанные пользователем
const readBooks = computed(() => {
  if (!user.value) return []

  return userStore.books.filter(book => user.value?.readBooks.includes(book.id))
})

// Получаем избранные книги пользователя
const favoriteBooks = computed(() => userStore.favoriteBooks)

// Суммарная статистика чтения
const totalBooksRead = computed(() => user.value?.readBooks.length || 0)
const totalPagesRead = computed(() => user.value?.stats.totalPagesRead || 0)

// Статистика по жанрам
const genreStats = computed(() => {
  if (!user.value) return []

  const stats = Object.entries(user.value.stats.pagesReadByGenre)
    .map(([genre, pages]) => ({ genre, pages }))
    .sort((a, b) => b.pages - a.pages)

  return stats
})

// Любимые жанры пользователя (на основе статистики чтения)
const favoriteGenres = computed(() => {
  return genreStats.value.slice(0, 3).map(stat => stat.genre)
})

// Прогресс чтения книг
const readingProgress = computed(() => {
  if (!user.value) return []

  return user.value.readingProgress
    .filter(progress => progress.progress < 100)
    .map(progress => {
      const book = userStore.books.find(b => b.id === progress.bookId)
      return {
        ...progress,
        book
      }
    })
    .filter(item => item.book)
})

// Обработчики
const startEdit = () => {
  if (!user.value) return

  isEditMode.value = true
  editedName.value = user.value.name
  selectedGenres.value = [...user.value.preferredGenres]
}

const cancelEdit = () => {
  isEditMode.value = false
}

const saveProfile = () => {
  if (!user.value) return

  if (editedName.value.trim()) {
    userStore.updateUserName(editedName.value.trim())
  }

  userStore.updatePreferredGenres(selectedGenres.value)
  isEditMode.value = false
}

const toggleGenre = (genre: string) => {
  const index = selectedGenres.value.indexOf(genre)

  if (index >= 0) {
    selectedGenres.value.splice(index, 1)
  } else {
    selectedGenres.value.push(genre)
  }
}

onMounted(() => {
  // Собираем все доступные жанры из книг
  const genres = new Set<string>()
  userStore.books.forEach(book => {
    book.genres.forEach(genre => {
      genres.add(genre)
    })
  })
  availableGenres.value = Array.from(genres).sort()

  setTimeout(() => {
    isLoading.value = false
  }, (window as any).fakeDelay || 500)
})
</script>

<template>
  <MainLayout>
    <template #header>
      <h1 :style="{ color: themeStore.isDarkMode ? '#fff' : '' }">Мой профиль</h1>
    </template>

    <div class="profile-page">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <div>Загрузка профиля...</div>
      </div>

      <template v-else-if="user">
        <div class="profile-section main-info">
          <div class="section-header">
            <h2 :style="{ color: themeStore.isDarkMode ? '#fff' : '' }">Личная информация</h2>
            <button v-if="!isEditMode" class="edit-btn" @click="startEdit">
              <i class="pi pi-pencil"></i> Редактировать
            </button>
            <div v-else class="edit-actions">
              <button class="save-btn" @click="saveProfile">
                <i class="pi pi-check"></i> Сохранить
              </button>
              <button class="cancel-btn" @click="cancelEdit">
                <i class="pi pi-times"></i> Отмена
              </button>
            </div>
          </div>

          <div class="profile-info">
            <div v-if="!isEditMode" class="info-item">
              <span class="info-label">Имя:</span>
              <span class="info-value" :style="{ color: themeStore.isDarkMode ? '#fff' : '' }">{{ user.name }}</span>
            </div>
            <div v-else class="edit-item">
              <label :style="{ color: themeStore.isDarkMode ? '#fff' : '' }" for="name">Имя:</label>
              <input
                id="name"
                type="text"
                v-model="editedName"
                placeholder="Введите ваше имя"
              />
            </div>

            <div class="info-item">
              <span class="info-label" :style="{ color: themeStore.isDarkMode ? '#fff' : '' }">Логин:</span>
              <span class="info-value" :style="{ color: themeStore.isDarkMode ? '#fff' : '' }">{{ user.username }}</span>
            </div>

            <div v-if="!isEditMode" class="info-item">
              <span class="info-label">Предпочитаемые жанры:</span>
              <div class="genre-tags">
                <span
                  v-for="genre in user.preferredGenres"
                  :key="genre"
                  class="genre-tag"
                >
                  {{ genre }}
                </span>
                <span v-if="user.preferredGenres.length === 0" class="empty-message">
                  Не выбраны
                </span>
              </div>
            </div>
            <div v-else class="edit-item">
              <label>Предпочитаемые жанры:</label>
              <div class="genre-checkboxes">
                <div
                  v-for="genre in availableGenres"
                  :key="genre"
                  class="genre-checkbox"
                >
                  <label :for="`genre-${genre}`" class="checkbox-label">
                    <input
                      :id="`genre-${genre}`"
                      type="checkbox"
                      :checked="selectedGenres.includes(genre)"
                      @change="toggleGenre(genre)"
                    />
                    <span>{{ genre }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-section stats">
          <h2>Статистика чтения</h2>

          <div class="stats-overview">
            <div class="stat-card">
              <div class="stat-value">{{ totalBooksRead }}</div>
              <div class="stat-label">Прочитано книг</div>
            </div>

            <div class="stat-card">
              <div class="stat-value">{{ totalPagesRead }}</div>
              <div class="stat-label">Прочитано страниц</div>
            </div>

            <div class="stat-card">
              <div class="stat-value">{{ favoriteGenres[0] || 'Нет данных' }}</div>
              <div class="stat-label">Любимый жанр</div>
            </div>
          </div>

          <div class="genres-stats">
            <h3  :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }">Страниц по жанрам</h3>

            <div v-if="genreStats.length === 0" class="empty-message">
              У вас пока нет статистики чтения по жанрам
            </div>

            <div v-else class="genres-chart">
              <div
                v-for="stat in genreStats"
                :key="stat.genre"
                class="genre-bar"
              >
                <div class="genre-name"  :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }">{{ stat.genre }}</div>
                <div class="bar-container">
                  <div
                    class="bar-fill"
                    :style="`width: ${(stat.pages / genreStats[0].pages) * 100}%`"
                  ></div>
                  <span class="bar-value">{{ stat.pages }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="readingProgress.length > 0" class="profile-section reading-now">
          <h2>Читаю сейчас</h2>

          <div class="reading-grid">
            <div
              v-for="item in readingProgress"
              :key="item.bookId"
              class="reading-item"
            >
              <div class="reading-book-info">
                <div v-if="item.book" class="reading-book-cover">
                  <img :src="item.book.coverImage" :alt="item.book.title" />
                </div>

                <div class="reading-details">
                  <h3 v-if="item.book" class="reading-book-title">
                    {{ item.book.title }}
                  </h3>
                  <div class="reading-progress">
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        :style="`width: ${item.progress}%`"
                      ></div>
                    </div>
                    <div class="progress-info">
                      <span>{{ Math.round(item.progress) }}%</span>
                      <span v-if="item.book">
                        стр. {{ item.currentPage }} из {{ item.book.pageCount }}
                      </span>
                    </div>
                  </div>
                  <button
                    v-if="item.book"
                    class="continue-btn"
                    @click="$router.push(`/books/${item.bookId}/read`)"
                  >
                    Продолжить чтение
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="readBooks.length > 0" class="profile-section read-books">
          <h2  :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }">Прочитанные книги</h2>

          <div class="books-grid">
            <BookCard
              v-for="book in readBooks"
              :key="book.id"
              :book="book"
              @click="$router.push(`/books/${book.id}`)"
            />
          </div>
        </div>

        <div v-if="favoriteBooks.length > 0" class="profile-section favorite-books">
          <h2>Избранные книги</h2>

          <div class="books-grid">
            <BookCard
              v-for="book in favoriteBooks"
              :key="book.id"
              :book="book"
              @click="$router.push(`/books/${book.id}`)"
            />
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
.profile-page {
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

.profile-section {
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.edit-btn,
.save-btn,
.cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.edit-btn {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.edit-btn:hover {
  background-color: var(--primary-color);
  color: white;
}

.save-btn {
  background-color: var(--success-color);
  color: white;
  border: none;
}

.save-btn:hover {
  background-color: var(--success-color);
  filter: brightness(1.1);
}

.cancel-btn {
  background-color: transparent;
  color: var(--text-color-light);
  border: 1px solid var(--border-color);
  margin-left: 0.5rem;
}

.cancel-btn:hover {
  background-color: var(--error-color);
  color: white;
  border-color: var(--error-color);
}

.edit-actions {
  display: flex;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-weight: 500;
  color: var(--text-color-light);
}

.info-value {
  font-size: 1.1rem;
}

.edit-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-item label {
  font-weight: 500;
  color: var(--text-color-light);
}

.edit-item input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  background-color: var(--background-color);
  color: var(--text-color);
}

.edit-item input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.genre-tag {
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.genre-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
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

.empty-message {
  color: var(--text-color-light);
  font-style: italic;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: var(--background-color);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-color-light);
}

.genres-stats h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.genres-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.genre-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.genre-name {
  width: 150px;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.bar-container {
  flex: 1;
  background-color: var(--background-color);
  height: 25px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.5s;
}

.bar-value {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.reading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.reading-item {
  background-color: var(--background-color);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.reading-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.reading-book-info {
  display: flex;
  gap: 1rem;
  padding: 1rem;
}

.reading-book-cover {
  width: 80px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.reading-book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reading-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reading-book-title {
  margin: 0;
  font-size: 1.1rem;
}

.reading-progress {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.progress-bar {
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.5s;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-color-light);
}

.continue-btn {
  margin-top: auto;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.continue-btn:hover {
  background-color: var(--secondary-color);
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.profile-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-overview {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .genre-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .genre-name {
    width: 100%;
    margin-bottom: 0.25rem;
  }

  .reading-grid {
    grid-template-columns: 1fr;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
}
</style>