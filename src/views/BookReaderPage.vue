<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useThemeStore } from '../stores/theme'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const bookId = computed(() => parseInt(route.params.id as string))
const book = computed(() => userStore.books.find(b => b.id === bookId.value))

const isLoading = ref(true)
const currentPage = ref(1)
const isControlsVisible = ref(false)
const bookmarks = ref<number[]>([])
const fontSize = computed(() => themeStore.readerFontSize)
const lineHeight = computed(() => themeStore.readerLineHeight)
const fontFamily = computed(() => themeStore.readerFontFamily)

// Вычисляем количество страниц в книге
const totalPages = computed(() => {
  if (!book.value?.content) return 1

  // Приблизительное количество символов на странице
  const charsPerPage = 1800

  // Количество страниц (округляем в большую сторону)
  return Math.ceil(book.value.content.length / charsPerPage)
})

// Определяем содержимое текущей страницы
const currentPageContent = computed(() => {
  if (!book.value?.content) return ''

  const charsPerPage = 1800
  const startChar = (currentPage.value - 1) * charsPerPage
  const endChar = Math.min(startChar + charsPerPage, book.value.content.length)

  return book.value.content.substring(startChar, endChar)
})

// Получаем прогресс чтения книги
const readingProgress = computed(() => {
  if (!userStore.currentUser || !book.value) return null

  return userStore.currentUser.readingProgress.find(
    p => p.bookId === book.value?.id
  )
})

// Определяем и форматируем прогресс чтения в процентах
const progressPercent = computed(() => {
  if (!book.value) return 0

  const percent = (currentPage.value / totalPages.value) * 100
  return Math.round(percent)
})

// Определяем стили для читалки
const readerStyles = computed(() => {
  return {
    fontSize: `${fontSize.value}px`,
    lineHeight: lineHeight.value,
    fontFamily: fontFamily.value
  }
})

// Проверяем, добавлена ли текущая страница в закладки
const isCurrentPageBookmarked = computed(() => {
  return bookmarks.value.includes(currentPage.value)
})

// Обработчики
const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    saveProgress()
  }
}

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    saveProgress()
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    saveProgress()
  }
}

const saveProgress = () => {
  if (!book.value) return

  userStore.updateReadingProgress(
    book.value.id,
    currentPage.value,
    totalPages.value
  )
}

const toggleBookmark = () => {
  const index = bookmarks.value.indexOf(currentPage.value)

  if (index >= 0) {
    bookmarks.value.splice(index, 1)
  } else {
    bookmarks.value.push(currentPage.value)
    bookmarks.value.sort((a, b) => a - b)
  }

  // Сохраняем закладки в localStorage
  localStorage.setItem(
    `bookmarks_${bookId.value}`,
    JSON.stringify(bookmarks.value)
  )
}

const toggleControls = () => {
  isControlsVisible.value = !isControlsVisible.value
}

const changeFontSize = (size: number) => {
  themeStore.changeReaderFontSize(size)
}

const changeLineHeight = (height: number) => {
  themeStore.changeReaderLineHeight(height)
}

const changeFontFamily = (font: string) => {
  themeStore.changeReaderFontFamily(font)
}

const exitReader = () => {
  router.push(`/books/${bookId.value}`)
}

// Обработка клавиатурных сокращений
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight' || event.key === ' ') {
    goToNextPage()
  } else if (event.key === 'ArrowLeft') {
    goToPrevPage()
  } else if (event.key === 'Escape') {
    exitReader()
  }
}

// Восстанавливаем прогресс чтения при загрузке компонента
watch(() => book.value, () => {
  if (book.value && readingProgress.value) {
    currentPage.value = readingProgress.value.currentPage || 1
  }
}, { immediate: true })

onMounted(() => {
  // Добавляем обработчик клавиатуры
  window.addEventListener('keydown', handleKeyPress)

  // Загружаем закладки из localStorage
  const savedBookmarks = localStorage.getItem(`bookmarks_${bookId.value}`)
  if (savedBookmarks) {
    bookmarks.value = JSON.parse(savedBookmarks)
  }

  setTimeout(() => {
    isLoading.value = false
  }, (window as any).fakeDelay || 500)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyPress)
  saveProgress()
})
</script>

<template>
  <div class="reader-page" :class="{ 'dark-theme': themeStore.isDarkMode }">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <div>Загрузка книги...</div>
    </div>

    <div v-else-if="!book" class="error-container">
      <i class="pi pi-exclamation-circle error-icon"></i>
      <h2>Книга не найдена</h2>
      <p>Указанная книга не существует или была удалена</p>
      <button class="primary-btn" @click="router.push('/books')">
        Вернуться к списку книг
      </button>
    </div>

    <template v-else>
      <div class="reader-header" :class="{ 'visible': isControlsVisible }">
        <div class="reader-header-content">
          <button class="header-btn back-btn" @click="exitReader">
            <i class="pi pi-arrow-left"></i>
          </button>

          <div class="book-info">
            <h1 class="book-title">{{ book.title }}</h1>
            <p class="book-author">{{ book.author }}</p>
          </div>

          <button
            class="header-btn bookmark-btn"
            :class="{ active: isCurrentPageBookmarked }"
            @click="toggleBookmark"
          >
            <i class="pi" :class="isCurrentPageBookmarked ? 'pi-bookmark-fill' : 'pi-bookmark'"></i>
          </button>
        </div>
      </div>

      <div class="reader-content" @click="toggleControls">
        <div class="book-content" :style="readerStyles">
          <p v-for="(paragraph, index) in currentPageContent.split('\n\n')" :key="index">
            {{ paragraph }}
          </p>
        </div>
      </div>

      <div class="reader-footer" :class="{ 'visible': isControlsVisible }">
        <div class="reader-footer-content">
          <div class="page-navigation">
            <button
              class="nav-btn prev-btn"
              @click.stop="goToPrevPage"
              :disabled="currentPage <= 1"
            >
              <i class="pi pi-chevron-left"></i>
            </button>

            <div class="page-info">
              <span>{{ currentPage }} из {{ totalPages }}</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="`width: ${progressPercent}%`"></div>
              </div>
              <span class="progress-percent">{{ progressPercent }}%</span>
            </div>

            <button
              class="nav-btn next-btn"
              @click.stop="goToNextPage"
              :disabled="currentPage >= totalPages"
            >
              <i class="pi pi-chevron-right"></i>
            </button>
          </div>

          <div class="reader-settings">
            <div class="setting-group">
              <span>Шрифт:</span>
              <div class="setting-buttons">
                <button
                  class="setting-btn"
                  :class="{ active: fontFamily === 'Georgia' }"
                  @click.stop="changeFontFamily('Georgia')"
                >
                  A
                </button>
                <button
                  class="setting-btn"
                  :class="{ active: fontFamily === 'Times New Roman' }"
                  @click.stop="changeFontFamily('Times New Roman')"
                >
                  A
                </button>
                <button
                  class="setting-btn"
                  :class="{ active: fontFamily === 'Arial' }"
                  @click.stop="changeFontFamily('Arial')"
                >
                  A
                </button>
              </div>
            </div>

            <div class="setting-group">
              <span>Размер:</span>
              <div class="setting-buttons">
                <button
                  class="setting-btn"
                  @click.stop="changeFontSize(Math.max(14, fontSize - 2))"
                >
                  A-
                </button>
                <button
                  class="setting-btn"
                  @click.stop="changeFontSize(Math.min(24, fontSize + 2))"
                >
                  A+
                </button>
              </div>
            </div>

            <div class="setting-group">
              <span>Интервал:</span>
              <div class="setting-buttons">
                <button
                  class="setting-btn"
                  @click.stop="changeLineHeight(Math.max(1.2, lineHeight - 0.2))"
                >
                  <i class="pi pi-minus"></i>
                </button>
                <button
                  class="setting-btn"
                  @click.stop="changeLineHeight(Math.min(2.0, lineHeight + 0.2))"
                >
                  <i class="pi pi-plus"></i>
                </button>
              </div>
            </div>

            <div class="setting-group">
              <button
                class="theme-btn"
                @click.stop="themeStore.toggleDarkMode()"
              >
                <i class="pi" :class="themeStore.isDarkMode ? 'pi-sun' : 'pi-moon'"></i>
              </button>
            </div>
          </div>

          <div v-if="bookmarks.length > 0" class="bookmarks-section">
            <h3>Закладки:</h3>
            <div class="bookmarks-list">
              <button
                v-for="bookmark in bookmarks"
                :key="bookmark"
                class="bookmark-item"
                :class="{ active: currentPage === bookmark }"
                @click.stop="goToPage(bookmark)"
              >
                Стр. {{ bookmark }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.reader-page {
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.loading-container,
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
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

.reader-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--card-background);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}

.reader-header.visible {
  transform: translateY(0);
}

.reader-header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-btn {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.header-btn:hover {
  color: var(--primary-color);
}

.header-btn.active {
  color: var(--accent-color);
}

.book-info {
  flex: 1;
}

.book-title {
  margin: 0;
  font-size: 1.2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-color-light);
}

.reader-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.book-content {
  max-width: 800px;
  padding: 2rem;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
}

.book-content p {
  margin-bottom: 1rem;
  text-align: justify;
}

.reader-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--card-background);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.reader-footer.visible {
  transform: translateY(0);
}

.reader-footer-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.nav-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s;
}

.progress-percent {
  font-size: 0.8rem;
  color: var(--text-color-light);
}

.reader-settings {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.setting-buttons {
  display: flex;
  gap: 0.25rem;
}

.setting-btn {
  background-color: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.setting-btn:hover {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.setting-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.theme-btn {
  background-color: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.theme-btn:hover {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.bookmarks-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bookmarks-section h3 {
  margin: 0;
  font-size: 1rem;
}

.bookmarks-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.bookmark-item {
  background-color: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.bookmark-item:hover {
  background-color: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.bookmark-item.active {
  background-color: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.dark-theme {
  --background-color: #121212;
  --card-background: #1e1e1e;
  --text-color: #95acc3;
  --text-color-light: #5e7fa7;
  --border-color: #333333;
}

@media (max-width: 768px) {
  .reader-content {
    padding: 0.5rem;
  }

  .book-content {
    padding: 1.5rem;
  }

  .reader-header-content,
  .reader-footer-content {
    padding: 0.75rem;
  }

  .reader-settings {
    gap: 1rem;
  }

  .setting-group {
    font-size: 0.9rem;
  }

  .setting-btn {
    padding: 0.3rem 0.5rem;
  }
}
</style>