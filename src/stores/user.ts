import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  // generateUsers,
  // generateBooks,
  type User,
  type Book,
} from '../utils/mockData';
import axios from 'axios';

export const useUserStore = defineStore(
  'user',
  () => {
    const currentUser = ref<User | null>(null);
    const users = ref<User[]>([]);
    const user = ref<User | null>;
    const books = ref<Book[]>([]);
    const isInitialized = ref(false);

    // Вычисляемые свойства
    const isLoggedIn = computed(() => !!currentUser.value);
    const isAdmin = computed(() => currentUser.value?.role === 'admin');

    // Избранные книги
    const favoriteBooks = computed(() => {
      if (!currentUser.value?.favorites.length) return [];
      return books.value.filter((book) =>
        currentUser.value?.favorites.includes(book.id),
      );
    });

    // Книги для последующего чтения
    const readLaterBooks = computed(() => {
      if (!currentUser.value?.readLater.length) return [];
      return books.value.filter((book) =>
        currentUser.value?.readLater.includes(book.id),
      );
    });

    // Прочитанные книги
    const readBooks = computed(() => {
      if (!currentUser.value?.readBooks.length) return [];
      return books.value.filter((book) =>
        currentUser.value?.readBooks.includes(book.id),
      );
    });

    async function fetchUsers() {
      try {
        const response = await axios.get(
          'https://simple-server-09r4.onrender.com/api/users',
        );

        users.value = response.data;
      } catch (error) {
        console.error('Ошибка авторизации:', error);
        return false;
      }
    }

    // Инициализация данных
    // function initializeData() {
    //   if (!isInitialized.value) {
    //     users.value = generateUsers();
    //     books.value = generateBooks();
    //     isInitialized.value = true;
    //   }
    // }

    // Авторизация
    async function login(username: string, password: string): Promise<boolean> {
      try {
        const response = await axios.post(
          'https://simple-server-09r4.onrender.com/api/login',
          {
            username,
            password,
          },
        );

        currentUser.value = response.data.user;

        return true;
      } catch (error) {
        console.error('Ошибка авторизации:', error);
        return false;
      }
    }
    // Выход
    function logout() {
      currentUser.value = null;
    }

    // Обновление имени пользователя
    function updateUserName(name: string) {
      if (currentUser.value) {
        currentUser.value.name = name;

        const userIndex = users.value.findIndex(
          (u) => u.id === currentUser.value?.id,
        );
        if (userIndex >= 0) {
          users.value[userIndex].name = name;
        }
      }
    }

    // Обновление предпочитаемых жанров
    function updatePreferredGenres(genres: string[]) {
      if (currentUser.value) {
        currentUser.value.preferredGenres = [...genres];

        const userIndex = users.value.findIndex(
          (u) => u.id === currentUser.value?.id,
        );
        if (userIndex >= 0) {
          users.value[userIndex].preferredGenres = [...genres];
        }
      }
    }

    // Добавление/удаление книги из избранного
    function toggleFavorite(bookId: number) {
      if (!currentUser.value) return;

      const index = currentUser.value.favorites.indexOf(bookId);
      if (index >= 0) {
        currentUser.value.favorites.splice(index, 1);
      } else {
        currentUser.value.favorites.push(bookId);
      }

      const userIndex = users.value.findIndex(
        (u) => u.id === currentUser.value?.id,
      );
      if (userIndex >= 0) {
        users.value[userIndex].favorites = [...currentUser.value.favorites];
      }
    }

    // Добавление/удаление книги из "Читать позже"
    function toggleReadLater(bookId: number) {
      if (!currentUser.value) return;

      const index = currentUser.value.readLater.indexOf(bookId);
      if (index >= 0) {
        currentUser.value.readLater.splice(index, 1);
      } else {
        currentUser.value.readLater.push(bookId);
      }

      const userIndex = users.value.findIndex(
        (u) => u.id === currentUser.value?.id,
      );
      if (userIndex >= 0) {
        users.value[userIndex].readLater = [...currentUser.value.readLater];
      }
    }

    // Обновление прогресса чтения книги
    function updateReadingProgress(
      bookId: number,
      page: number,
      totalPages: number,
    ) {
      if (!currentUser.value) return;

      const progress = (page / totalPages) * 100;

      const progressIndex = currentUser.value.readingProgress.findIndex(
        (p) => p.bookId === bookId,
      );

      if (progressIndex >= 0) {
        currentUser.value.readingProgress[progressIndex].currentPage = page;
        currentUser.value.readingProgress[progressIndex].progress = progress;
      } else {
        currentUser.value.readingProgress.push({
          bookId,
          currentPage: page,
          progress,
          startDate: new Date().toISOString(),
        });
      }

      if (progress >= 100 && !currentUser.value.readBooks.includes(bookId)) {
        currentUser.value.readBooks.push(bookId);
      }

      const book = books.value.find((b) => b.id === bookId);
      if (book) {
        currentUser.value.stats.totalPagesRead += 1;

        book.genres.forEach((genre) => {
          if (currentUser.value) {
            if (!currentUser.value.stats.pagesReadByGenre[genre]) {
              currentUser.value.stats.pagesReadByGenre[genre] = 0;
            }
            currentUser.value.stats.pagesReadByGenre[genre] += 1;
          }
        });
      }

      const userIndex = users.value.findIndex(
        (u) => u.id === currentUser.value?.id,
      );
      if (userIndex >= 0) {
        users.value[userIndex].readingProgress = [
          ...currentUser.value.readingProgress,
        ];
        users.value[userIndex].readBooks = [...currentUser.value.readBooks];
        users.value[userIndex].stats = { ...currentUser.value.stats };
      }
    }

    // Оценка книги
    function rateBook(bookId: number, rating: number) {
      if (!currentUser.value) return;

      const ratingIndex = currentUser.value.ratings.findIndex(
        (r) => r.bookId === bookId,
      );

      if (ratingIndex >= 0) {
        currentUser.value.ratings[ratingIndex].rating = rating;
      } else {
        currentUser.value.ratings.push({
          bookId,
          rating,
          date: new Date().toISOString(),
        });
      }

      const bookIndex = books.value.findIndex((b) => b.id === bookId);

      if (bookIndex >= 0) {
        const allRatings = users.value
          .flatMap((u) => u.ratings)
          .filter((r) => r.bookId === bookId)
          .map((r) => r.rating);

        if (ratingIndex < 0) {
          allRatings.push(rating);
        }

        const avgRating =
          allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;

        books.value[bookIndex].rating = parseFloat(avgRating.toFixed(1));
        books.value[bookIndex].ratingsCount = allRatings.length;
      }

      const userIndex = users.value.findIndex(
        (u) => u.id === currentUser.value?.id,
      );
      if (userIndex >= 0) {
        users.value[userIndex].ratings = [...currentUser.value.ratings];
      }
    }

    async function getCommets(id: number) {
      await axios
        .get(
          `https://simple-server-09r4.onrender.com/api/comments?bookId=${id}`,
        )
        .then((res) => {
          const bookIndex = books.value.findIndex((b) => b.id == id);

          if (bookIndex >= 0) {
            // Копируем весь массив книг (если нужно реактивно менять)
            const updatedBooks = [...books.value];

            // Обновляем поле comments только у нужной книги
            updatedBooks[bookIndex] = {
              ...updatedBooks[bookIndex],
              comments: res.data,
            };

            // Записываем обновлённый массив обратно
            books.value = updatedBooks;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // Добавление комментария к книге
    async function addComment(bookId: number, text: string) {
      if (!currentUser.value) return;

      const newComment = {
        id: Date.now(),
        bookId,
        userId: currentUser.value.id,
        author: currentUser.value.name,
        text,
        date: new Date().toISOString(),
      };

      await axios
        .post(
          'https://simple-server-09r4.onrender.com/api/comments',
          newComment,
        )
        .then(() => {
          getCommets(bookId);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // Удаление комментария (только для админа)
    async function deleteComment(bookId: number, commentId: number) {
      await axios
        .delete(
          `https://simple-server-09r4.onrender.com/api/comments/${commentId}`,
        )
        .then(() => {
          getCommets(bookId);
        })
        .catch((err) => {
          console.log(err);
        });

      // if (!currentUser.value || !isAdmin.value) return;
      // const bookIndex = books.value.findIndex((b) => b.id === bookId);
      // if (bookIndex >= 0) {
      //   const commentIndex = books.value[bookIndex].comments.findIndex(
      //     (c) => c.id === commentId,
      //   );
      //   if (commentIndex >= 0) {
      //     books.value[bookIndex].comments.splice(commentIndex, 1);
      //   }
      // }
    }

    // Админские функции

    // Удаление пользователя
    async function deleteUser(userId: number) {
      await axios
        .delete(`https://simple-server-09r4.onrender.com/api/users/${userId}`)
        .then(() => {
          fetchUsers();
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // Добавление книги
    function addBook(book: Omit<Book, 'id'>) {
      if (!currentUser.value || !isAdmin.value) return;

      const newBook: Book = {
        ...book,
        id: Math.max(...books.value.map((b) => b.id), 0) + 1,
        comments: [],
        rating: 0,
        ratingsCount: 0,
      };

      books.value.push(newBook);
    }

    // Удаление книги
    function deleteBook(bookId: number) {
      if (!currentUser.value || !isAdmin.value) return;

      const bookIndex = books.value.findIndex((b) => b.id === bookId);
      if (bookIndex >= 0) {
        books.value.splice(bookIndex, 1);
      }
    }

    return {
      currentUser,
      users,
      books,
      isInitialized,
      isLoggedIn,
      isAdmin,
      favoriteBooks,
      readLaterBooks,
      readBooks,
      // initializeData,
      login,
      logout,
      updateUserName,
      updatePreferredGenres,
      toggleFavorite,
      toggleReadLater,
      updateReadingProgress,
      rateBook,
      addComment,
      deleteComment,
      deleteUser,
      addBook,
      deleteBook,
      getCommets,
      fetchUsers,
      user,
    };
  },
  {
    persist: true,
  },
);
