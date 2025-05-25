<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import MainLayout from '../components/layouts/MainLayout.vue';
import BookCard from '../components/books/BookCard.vue';
import type { Book } from '../utils/mockData';
import { useThemeStore } from '../stores/theme';
import axios from 'axios';

const themeStore = useThemeStore();

const userStore = useUserStore();
const router = useRouter();

const searchQuery = ref('');
const selectedFilter = ref('all');
const selectedGenre = ref('');
const isLoading = ref(true);

// Вычисляемые свойства для фильтрации книг
const filteredBooks = computed(() => {
  let result = [...userStore.books];

  // Фильтр по поисковому запросу
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query),
    );
  }

  // Фильтр по категории
  if (selectedFilter.value === 'favorites') {
    result = userStore.favoriteBooks;
  } else if (selectedFilter.value === 'readLater') {
    result = userStore.readLaterBooks;
  } else if (selectedFilter.value === 'read') {
    result = userStore.readBooks;
  }

  // Фильтр по жанру
  if (selectedGenre.value) {
    result = result.filter((book) => book.genres.includes(selectedGenre.value));
  }

  return result;
});

const getBooks = async () => {
  try {
    const response = await axios.get(
      'https://simple-server-09r4.onrender.com/api/books',
    );
    userStore.books = response.data;
  } catch (error) {
    console.error('Ошибка при получении книг:', error);
  }
};

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

// Рекомендованные книги, основанные на предпочтениях пользователя
const recommendedBooks = computed(() => {
  const preferredGenres = userStore.currentUser?.preferredGenres || [];
  if (preferredGenres.length === 0) return [];

  const readBookIds = userStore.currentUser?.readBooks || [];
  const recommendations = userStore.books
    .filter(
      (book) =>
        book.genres.some((genre) => preferredGenres.includes(genre)) &&
        !readBookIds.includes(book.id),
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return recommendations;
});

// Обработчики
const handleFilterChange = (filter: string) => {
  selectedFilter.value = filter;
  selectedGenre.value = '';
};

const handleGenreChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  selectedGenre.value = target.value;
  selectedFilter.value = 'all';
};

const viewBookDetails = (book: Book) => {
  router.push(`/books/${book.id}`);
};

onMounted(() => {
  getBooks();
  setTimeout(() => {
    isLoading.value = false;
  }, (window as any).fakeDelay || 500);
});
</script>

<template>
  <MainLayout>
    <template #header>
      <h1 :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }">
        Библиотека книг
      </h1>
    </template>

    <div class="books-page">
      <div class="search-filters-section">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск по названию или автору..."
          />
          <i class="pi pi-search search-icon"></i>
        </div>

        <div class="filters">
          <button
            class="filter-btn"
            :class="{ active: selectedFilter === 'all' }"
            @click="handleFilterChange('all')"
          >
            <i class="pi pi-book"></i> Все книги
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedFilter === 'favorites' }"
            @click="handleFilterChange('favorites')"
          >
            <i class="pi pi-heart"></i> Избранное
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedFilter === 'readLater' }"
            @click="handleFilterChange('readLater')"
          >
            <i class="pi pi-bookmark"></i> Читать позже
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedFilter === 'read' }"
            @click="handleFilterChange('read')"
          >
            <i class="pi pi-check"></i> Прочитанные
          </button>
        </div>

        <div class="genre-filter">
          <select v-model="selectedGenre" @change="handleGenreChange($event)">
            <option value="">Все жанры</option>
            <option
              v-for="genre in availableGenres"
              :key="genre"
              :value="genre"
            >
              {{ genre }}
            </option>
          </select>
        </div>
      </div>

      <!-- Основной список книг -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <div>Загрузка книг...</div>
      </div>
      <div v-else-if="filteredBooks.length === 0" class="empty-state">
        <i class="pi pi-book empty-icon"></i>
        <h3>Книги не найдены</h3>
        <p>Попробуйте изменить параметры поиска или фильтрации</p>
      </div>
      <div v-else class="books-grid">
        <BookCard
          v-for="book in filteredBooks"
          :key="book.id"
          :book="book"
          @click="viewBookDetails(book)"
        />
      </div>

      <!-- Рекомендации -->
      <div v-if="recommendedBooks.length > 0" class="recommendations-section">
        <h2>Рекомендуем также прочитать</h2>
        <div class="recommended-books">
          <BookCard
            v-for="book in recommendedBooks"
            :key="book.id"
            :book="book"
            @click="viewBookDetails(book)"
          />
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.books-page {
  padding: 1.5rem 0;
}

.search-filters-section {
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--card-background);
  color: var(--text-color);
  font-family: 'Montserrat', sans-serif;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-light);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  background-color: var(--card-background);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn i {
  font-size: 1rem;
}

.filter-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.genre-filter select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--card-background);
  color: var(--text-color);
  font-size: 0.9rem;
  min-width: 150px;
  font-family: 'Montserrat', sans-serif;
}

.genre-filter select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.recommendations-section {
  margin-bottom: 2.5rem;
}

.recommendations-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
}

.recommended-books {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
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

.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: var(--text-color-light);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .search-filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    justify-content: flex-start;
  }

  .books-grid,
  .recommended-books {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .filter-btn {
    width: 100%;
    justify-content: center;
  }

  .genre-filter select {
    width: 100%;
  }
}
</style>
