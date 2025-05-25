<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '../../stores/user';
import type { Book } from '../../utils/mockData';

const props = defineProps<{
  book: Book;
  compact?: boolean;
}>();

const userStore = useUserStore();

// Проверяем, добавлена ли книга в избранное
const isFavorite = computed(() => {
  return userStore.currentUser?.favorites.includes(props.book.id) || false;
});

// Проверяем, добавлена ли книга в "Читать позже"
const isReadLater = computed(() => {
  return userStore.currentUser?.readLater.includes(props.book.id) || false;
});

// Проверяем, читает ли пользователь эту книгу в данный момент
const isReading = computed(() => {
  if (!userStore.currentUser) return false;

  const progress = userStore.currentUser.readingProgress.find(
    (p) => p.bookId === props.book.id,
  );

  return progress && progress.progress < 100;
});

// Проверяем, прочитана ли книга
const isRead = computed(() => {
  return userStore.currentUser?.readBooks.includes(props.book.id) || false;
});

// Обработчики
const toggleFavorite = (event: Event) => {
  event.stopPropagation();
  userStore.toggleFavorite(props.book.id);
};

const toggleReadLater = (event: Event) => {
  event.stopPropagation();
  userStore.toggleReadLater(props.book.id);
};

// Вычисляем стиль для отображения рейтинга
const ratingStyle = computed(() => {
  const width = (props.book.rating / 5) * 100;
  return `width: ${width}%`;
});

// Формируем список жанров для отображения
const genresList = computed(() => {
  return props.book.genres.join(', ');
});
</script>

<template>
  <div class="book-card" :class="{ compact: compact }">
    <div class="book-cover">
      <img :src="book.coverImage" :alt="book.title" />
      <div class="book-actions">
        <button
          class="action-btn favorite-btn"
          :class="{ active: isFavorite }"
          @click="toggleFavorite"
          :title="isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'"
        >
          <i class="pi" :class="isFavorite ? 'pi-heart-fill' : 'pi-heart'"></i>
        </button>
        <button
          class="action-btn read-later-btn"
          :class="{ active: isReadLater }"
          @click="toggleReadLater"
          :title="isReadLater ? 'Удалить из списка чтения' : 'Читать позже'"
        >
          <i
            class="pi"
            :class="isReadLater ? 'pi-bookmark-fill' : 'pi-bookmark'"
          ></i>
        </button>
      </div>
      <div v-if="isRead" class="book-badge read-badge">Прочитано</div>
      <div v-else-if="isReading" class="book-badge reading-badge">Читаю</div>
    </div>

    <div class="book-info">
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>

      <div class="book-rating">
        <div class="rating-stars">
          <div class="stars-background">
            <i v-for="n in 5" :key="n" class="pi pi-star"></i>
          </div>
          <div class="stars-filled" :style="ratingStyle">
            <i v-for="n in 5" :key="n" class="pi pi-star-fill"></i>
          </div>
        </div>
        <span class="rating-value"
          >{{ book.rating }} ({{ book.ratingsCount }})</span
        >
      </div>

      <p v-if="!compact" class="book-genres">{{ genresList }}</p>
    </div>
  </div>
</template>

<style scoped>
.book-card {
  background-color: var(--card-background);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.book-card.compact {
  flex-direction: row;
  align-items: center;
  padding: 0.5rem;
  gap: 1rem;
}

.book-cover {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
}

.book-card.compact .book-cover {
  width: 70px;
  height: 105px;
  flex-shrink: 0;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.book-card:hover .book-cover img {
  transform: scale(1.05);
}

.book-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.book-card:hover .book-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--text-color-light);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.action-btn:hover {
  background-color: white;
  color: var(--primary-color);
}

.action-btn.active {
  color: var(--accent-color);
}

.book-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.read-badge {
  background-color: var(--success-color);
  color: white;
}

.reading-badge {
  background-color: var(--primary-color);
  color: white;
}

.book-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-card.compact .book-info {
  padding: 0;
}

.book-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.book-card.compact .book-title {
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
  -webkit-line-clamp: 1;
}

.book-author {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color-light);
}

.book-card.compact .book-author {
  font-size: 0.8rem;
  margin-bottom: 0.2rem;
}

.book-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.rating-stars {
  position: relative;
  display: inline-block;
}

.stars-background {
  display: flex;
  color: rgba(0, 0, 0, 0.1);
}

.stars-filled {
  position: absolute;
  top: 0;
  left: 0;
  white-space: nowrap;
  overflow: hidden;
  color: var(--accent-color);
}

.stars-background i,
.stars-filled i {
  font-size: 0.8rem;
}

.rating-value {
  font-size: 0.8rem;
  color: var(--text-color-light);
}

.book-genres {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-color-light);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

@media (max-width: 768px) {
  .book-title {
    font-size: 0.9rem;
  }

  .book-author {
    font-size: 0.8rem;
  }

  .stars-background i,
  .stars-filled i {
    font-size: 0.7rem;
  }

  .rating-value {
    font-size: 0.7rem;
  }
}
</style>
