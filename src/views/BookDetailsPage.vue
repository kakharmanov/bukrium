<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import MainLayout from '../components/layouts/MainLayout.vue';
import BookCard from '../components/books/BookCard.vue';
import type { Book } from '../utils/mockData';
import { useThemeStore } from '../stores/theme';

const themeStore = useThemeStore();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const bookId = computed(() => parseInt(route.params.id as string));
const book = computed(() => userStore.books.find((b) => b.id === bookId.value));
const isLoading = ref(true);
const newComment = ref('');
const userRating = ref(0);

// Получаем рекомендации на основе похожих книг
const recommendations = computed(() => {
  if (!book.value) return [];

  // Фильтруем книги по схожим жанрам
  const similarBooks = userStore.books
    .filter(
      (b) =>
        b.id !== bookId.value &&
        b.genres.some((genre) => book.value?.genres.includes(genre)),
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return similarBooks;
});

// Проверяем, есть ли у текущего пользователя рейтинг для этой книги
const userBookRating = computed(() => {
  if (!userStore.currentUser || !book.value) return 0;

  const rating = userStore.currentUser.ratings.find(
    (r) => r.bookId === book.value?.id,
  );
  return rating ? rating.rating : 0;
});

// Обработчики
const handleReadBook = () => {
  router.push(`/books/${bookId.value}/read`);
};

const handleRateBook = (rating: number) => {
  if (!book.value) return;

  userRating.value = rating;
  userStore.rateBook(book.value.id, rating);
};

const submitComment = () => {
  if (!book.value || !newComment.value.trim()) return;

  userStore.addComment(book.value.id, newComment.value.trim());
  newComment.value = '';
};

const deleteComment = (commentId: number) => {
  if (!book.value) return;

  userStore.deleteComment(book.value.id, commentId);
};

const handleBookSelect = (selectedBook: Book) => {
  router.push(`/books/${selectedBook.id}`);
  window.scrollTo(0, 0);
};

const toggleFavorite = () => {
  if (!book.value) return;
  userStore.toggleFavorite(book.value.id);
};

const toggleReadLater = () => {
  if (!book.value) return;
  userStore.toggleReadLater(book.value.id);
};

// Форматируем дату комментария
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  userStore.getCommets(Number(route?.params?.id));
  setTimeout(() => {
    isLoading.value = false;

    // Устанавливаем рейтинг пользователя, если он уже оценивал книгу
    userRating.value = userBookRating.value;
  }, (window as any).fakeDelay || 500);
});
</script>

<template>
  <MainLayout>
    <template #header>
      <div class="book-details-header">
        <router-link to="/books" class="back-link">
          <i class="pi pi-arrow-left"></i> К списку книг
        </router-link>
        <h1 v-if="book">{{ book.title }}</h1>
      </div>
    </template>

    <div class="book-details-page">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <div>Загрузка информации о книге...</div>
      </div>

      <div v-else-if="!book" class="error-container">
        <i class="pi pi-exclamation-circle error-icon"></i>
        <h2>Книга не найдена</h2>
        <p>Указанная книга не существует или была удалена</p>
        <router-link to="/books" class="primary-btn">
          Вернуться к списку книг
        </router-link>
      </div>

      <template v-else>
        <div class="book-details-container">
          <div class="book-details-main">
            <div class="book-cover">
              <img :src="book.coverImage" :alt="book.title" />
            </div>

            <div class="book-info">
              <h2 class="book-title" style="color:#1e293b">{{ book.title }}</h2>
              <p class="book-author" style="color:#64748b">{{ book.author }}</p>

              <div class="book-meta">
                <div class="meta-item">
                  <i class="pi pi-calendar"></i>
                  <span style="color:#64748b">{{ book.publishYear }} г.</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-file"></i>
                  <span style="color:#64748b">{{ book.pageCount }} стр.</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-tag"></i>
                  <span style="color:#64748b">{{ book.genres.join(', ') }}</span>
                </div>
              </div>

              <div class="book-rating-container">
                <h3 style="color:#1e293b">Рейтинг</h3>
                <div class="book-rating">
                  <div class="rating-stars large">
                    <div class="stars-background">
                      <i v-for="n in 5" :key="n" class="pi pi-star"></i>
                    </div>
                    <div
                      class="stars-filled"
                      :style="`width: ${(book.rating / 5) * 100}%`"
                    >
                      <i v-for="n in 5" :key="n" class="pi pi-star-fill"></i>
                    </div>
                  </div>
                  <span class="rating-value" style="color:#1e293b"
                    >{{ book.rating }} ({{ book.ratingsCount }})</span
                  >
                </div>

                <div class="user-rating">
                  <h4 style="color:#1e293b">Ваша оценка</h4>
                  <div class="rating-input">
                    <button
                      v-for="n in 5"
                      :key="n"
                      class="rating-btn"
                      :class="{ active: userRating >= n }"
                      @click="handleRateBook(n)"
                    >
                      <i
                        class="pi"
                        :class="userRating >= n ? 'pi-star-fill' : 'pi-star'"
                      ></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="book-actions">
                <button class="primary-btn" @click="handleReadBook">
                  <i class="pi pi-book"></i> Читать
                </button>

                <button
                  class="action-btn"
                  :class="{
                    active: userStore.currentUser?.favorites.includes(book.id),
                  }"
                  @click="toggleFavorite"
                >
                  <i
                    class="pi"
                    :class="
                      userStore.currentUser?.favorites.includes(book.id)
                        ? 'pi-heart-fill'
                        : 'pi-heart'
                    "
                  ></i>
                  {{
                    userStore.currentUser?.favorites.includes(book.id)
                      ? 'В избранном'
                      : 'В избранное'
                  }}
                </button>

                <button
                  class="action-btn"
                  :class="{
                    active: userStore.currentUser?.readLater.includes(book.id),
                  }"
                  @click="toggleReadLater"
                >
                  <i
                    class="pi"
                    :class="
                      userStore.currentUser?.readLater.includes(book.id)
                        ? 'pi-bookmark-fill'
                        : 'pi-bookmark'
                    "
                  ></i>
                  {{
                    userStore.currentUser?.readLater.includes(book.id)
                      ? 'В списке чтения'
                      : 'Читать позже'
                  }}
                </button>
              </div>
            </div>
          </div>

          <div class="book-description">
            <h3 :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }">
              Описание
            </h3>
            <p :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }">
              {{ book.description }}
            </p>
          </div>

          <div class="book-comments">
            <h3>Обсуждение ({{ book.comments.length }})</h3>

            <div class="comment-input">
              <textarea
                v-model="newComment"
                placeholder="Напишите свой комментарий..."
                rows="3"
              ></textarea>
              <button
                class="comment-btn"
                @click="submitComment"
                :disabled="!newComment.trim()"
              >
                Отправить
              </button>
            </div>

            <div v-if="book.comments.length === 0" class="empty-comments">
              <p>
                Пока нет комментариев. Будьте первым, кто оставит свое мнение о
                книге!
              </p>
            </div>

            <div v-else class="comments-list">
              <div
                v-for="comment in book.comments"
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-header">
                  <div class="comment-author">
                    <i class="pi pi-user"></i>
                    <span
                      :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }"
                      >{{ comment?.author }}</span
                    >
                  </div>
                  <div class="comment-date">
                    {{ formatDate(comment.date) }}
                  </div>
                  <button
                    v-if="userStore.isAdmin"
                    class="delete-comment-btn"
                    @click="deleteComment(comment.id)"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <div
                  class="comment-text"
                  :style="{ color: themeStore?.isDarkMode ? '#fff' : '' }"
                >
                  {{ comment.text }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="recommendations.length > 0" class="book-recommendations">
          <h3>Похожие книги</h3>
          <div class="recommendations-grid">
            <BookCard
              v-for="rec in recommendations"
              :key="rec.id"
              :book="rec"
              @click="handleBookSelect(rec)"
            />
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
.book-details-page {
  padding-bottom: 3rem;
}

.book-details-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color-light);
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--primary-color);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(90, 103, 216, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.error-icon {
  font-size: 3rem;
  color: var(--error-color);
  margin-bottom: 1rem;
}

.error-container h2 {
  margin: 0 0 1rem;
}

.error-container p {
  margin: 0 0 2rem;
  color: var(--text-color-light);
}

.book-details-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.book-details-main {
  display: flex;
  gap: 2rem;
}

.book-cover {
  width: 250px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.book-cover img {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.book-title {
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.3;
}

.book-author {
  margin: 0;
  color: var(--text-color-light);
  font-size: 1.2rem;
}

.book-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-light);
}

.meta-item i {
  font-size: 1.1rem;
  color: var(--primary-color);
}

.book-rating-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.book-rating-container h3 {
  margin: 0;
  font-size: 1.2rem;
}

.book-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-stars.large .stars-background i,
.rating-stars.large .stars-filled i {
  font-size: 1.5rem;
}

.rating-value {
  font-size: 1.1rem;
  color: var(--text-color);

}

.user-rating {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-rating h4 {
  margin: 0;
  font-size: 1rem;
}

.rating-input {
  display: flex;
  gap: 0.25rem;
}

.rating-btn {
  background: none;
  border: none;
  color: var(--text-color-light);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.rating-btn:hover {
  color: var(--accent-color);
}

.rating-btn.active {
  color: var(--accent-color);
}

.book-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.primary-btn:hover {
  background-color: var(--secondary-color);
}

.action-btn {
  background-color: var(--card-background);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.action-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-btn.active {
  background-color: rgba(90, 103, 216, 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.book-description {
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.book-description h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.book-description p {
  margin: 0;
  line-height: 1.6;
}

.book-comments {
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.book-comments h3 {
  margin: 0;
  font-size: 1.3rem;
}

.comment-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-input textarea {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  background-color: var(--background-color);
  color: var(--text-color);
  resize: vertical;
}

.comment-input textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.comment-btn {
  align-self: flex-end;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.comment-btn:hover:not(:disabled) {
  background-color: var(--secondary-color);
}

.comment-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-comments {
  padding: 1.5rem;
  text-align: center;
  background-color: var(--background-color);
  border-radius: 8px;
  color: var(--text-color-light);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  background-color: var(--background-color);
  border-radius: 8px;
  padding: 1rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.comment-author {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-date {
  font-size: 0.8rem;
  color: var(--text-color-light);
}

.delete-comment-btn {
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.delete-comment-btn:hover {
  opacity: 1;
}

.comment-text {
  line-height: 1.5;
}

.book-recommendations {
  margin-top: 3rem;
}

.book-recommendations h3 {
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

@media (max-width: 992px) {
  .book-details-main {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .book-cover {
    width: 220px;
  }

  .book-meta,
  .book-rating,
  .user-rating,
  .rating-input,
  .book-actions {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .book-title {
    font-size: 1.5rem;
  }

  .book-meta {
    flex-direction: column;
    gap: 0.75rem;
  }

  .recommendations-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.5rem;
  }

  .rating-stars.large .stars-background i,
  .rating-stars.large .stars-filled i {
    font-size: 1.3rem;
  }

  .rating-btn {
    font-size: 1.3rem;
  }

  .book-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
