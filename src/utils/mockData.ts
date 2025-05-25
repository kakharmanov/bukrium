import { shuffle } from 'lodash-es';

// Типы данных
export interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  preferredGenres: string[];
  favorites: number[];
  readLater: number[];
  readBooks: number[];
  readingProgress: ReadingProgress[];
  ratings: BookRating[];
  stats: UserStats;
}

export interface ReadingProgress {
  bookId: number;
  currentPage: number;
  progress: number;
  startDate: string;
}

export interface BookRating {
  bookId: number;
  rating: number;
  date: string;
}

export interface UserStats {
  totalBooksRead: number;
  totalPagesRead: number;
  pagesReadByGenre: { [genre: string]: number };
}

export interface Comment {
  id: number;
  bookId: number;
  userId: number;
  userName: string;
  author: string;
  text: string;
  date: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  publishYear: number;
  pageCount: number;
  genres: string[];
  rating: number;
  ratingsCount: number;
  comments: Comment[];
  content?: string;
}

// Списки для генерации данных
const GENRES = [
  'Фантастика',
  'Фэнтези',
  'Детектив',
  'Роман',
  'Проза',
  'Научно-популярная',
  'История',
  'Приключения',
  'Ужасы',
  'Биография',
  'Психология',
  'Бизнес',
  'Научная фантастика',
  'Драма',
  'Комедия',
  'Триллер',
  'Исторический роман',
  'Поэзия',
  'Классика',
  'Современная литература',
];

const BOOK_COVERS = [
  'https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg',
  'https://images.pexels.com/photos/3747165/pexels-photo-3747165.jpeg',
  'https://images.pexels.com/photos/4065891/pexels-photo-4065891.jpeg',
  'https://images.pexels.com/photos/2228559/pexels-photo-2228559.jpeg',
  'https://images.pexels.com/photos/6373307/pexels-photo-6373307.jpeg',
  'https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg',
  'https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg',
  'https://images.pexels.com/photos/1831744/pexels-photo-1831744.jpeg',
  'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg',
  'https://images.pexels.com/photos/1666816/pexels-photo-1666816.jpeg',
  'https://images.pexels.com/photos/2097616/pexels-photo-2097616.jpeg',
  'https://images.pexels.com/photos/736843/pexels-photo-736843.jpeg',
  'https://images.pexels.com/photos/1831744/pexels-photo-1831744.jpeg',
  'https://images.pexels.com/photos/1122650/pexels-photo-1122650.jpeg',
  'https://images.pexels.com/photos/3747479/pexels-photo-3747479.jpeg',
  'https://images.pexels.com/photos/3747480/pexels-photo-3747480.jpeg',
  'https://images.pexels.com/photos/7129701/pexels-photo-7129701.jpeg',
  'https://images.pexels.com/photos/5273634/pexels-photo-5273634.jpeg',
  'https://images.pexels.com/photos/19256460/pexels-photo-19256460/free-photo-of-abstract-painting.jpeg',
  'https://images.pexels.com/photos/3747477/pexels-photo-3747477.jpeg',
];

const BOOK_TITLES = [
  'Тайна забытого города',
  'Лунный свет',
  'Шепот звёзд',
  'Дороги судьбы',
  'Расколотое небо',
  'Хранители времени',
  'Алые паруса надежды',
  'Тень прошлого',
  'Загадка семи ключей',
  'Пепел империи',
  'Морской волк',
  'Голос в темноте',
  'Северное сияние',
  'Зеркальный лабиринт',
  'Вечность в одном мгновении',
  'Серебряная нить',
  'Жемчужина в песке',
  'Последнее королевство',
  'Дневник путешественника',
  'Эхо забытых слов',
  'Хроники будущего',
  'Затерянный мир',
  'Песнь ветра',
  'Тайны старого замка',
  'Золотой компас',
  'Время мечтать',
  'Сердце океана',
  'Путь героя',
  'Магия звёзд',
  'Легенды древних',
];

const AUTHORS = [
  'Анна Петрова',
  'Сергей Иванов',
  'Мария Соколова',
  'Александр Волков',
  'Екатерина Смирнова',
  'Павел Николаев',
  'Татьяна Морозова',
  'Михаил Кузнецов',
  'Ольга Васильева',
  'Дмитрий Новиков',
  'Елена Морозова',
  'Игорь Соловьев',
  'Наталья Королева',
  'Андрей Белов',
  'Светлана Орлова',
];

// Функции генерации данных
function generateLorem(length: number): string {
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
    Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
    Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur,
    vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
  `
    .replace(/\s+/g, ' ')
    .trim();

  let result = '';
  while (result.length < length) {
    result += loremText + ' ';
  }
  return result.substring(0, length);
}

function generateBookContent(pageCount: number): string {
  // Генерируем содержимое книги с заданным количеством страниц
  const pageSize = 2000; // Примерное количество символов на страницу
  return generateLorem(pageCount * pageSize);
}

export function generateUsers(): User[] {
  // Создаем администратора и двух пользователей
  return [
    {
      id: 1,
      name: 'Администратор',
      username: 'admin',
      password: 'admin',
      role: 'admin',
      preferredGenres: shuffle(GENRES).slice(0, 5),
      favorites: [1, 3, 5],
      readLater: [2, 4, 6],
      readBooks: [7, 8, 9],
      readingProgress: [
        {
          bookId: 7,
          currentPage: 340,
          progress: 100,
          startDate: '2024-06-01T10:00:00Z',
        },
        {
          bookId: 8,
          currentPage: 250,
          progress: 100,
          startDate: '2024-06-10T15:30:00Z',
        },
        {
          bookId: 9,
          currentPage: 180,
          progress: 100,
          startDate: '2024-06-15T09:45:00Z',
        },
        {
          bookId: 1,
          currentPage: 120,
          progress: 40,
          startDate: '2024-06-20T14:20:00Z',
        },
      ],
      ratings: [
        { bookId: 7, rating: 5, date: '2024-06-05T18:30:00Z' },
        { bookId: 8, rating: 4, date: '2024-06-12T11:20:00Z' },
        { bookId: 9, rating: 5, date: '2024-06-16T20:15:00Z' },
      ],
      stats: {
        totalBooksRead: 3,
        totalPagesRead: 770,
        pagesReadByGenre: {
          Фантастика: 340,
          Детектив: 250,
          Роман: 180,
        },
      },
    },
    {
      id: 2,
      name: 'Анна Смирнова',
      username: 'user1',
      password: 'password',
      role: 'user',
      preferredGenres: shuffle(GENRES).slice(0, 3),
      favorites: [2, 6, 10],
      readLater: [3, 7, 11],
      readBooks: [12, 14],
      readingProgress: [
        {
          bookId: 12,
          currentPage: 320,
          progress: 100,
          startDate: '2024-05-20T08:15:00Z',
        },
        {
          bookId: 14,
          currentPage: 270,
          progress: 100,
          startDate: '2024-06-02T13:40:00Z',
        },
        {
          bookId: 2,
          currentPage: 90,
          progress: 30,
          startDate: '2024-06-18T19:10:00Z',
        },
      ],
      ratings: [
        { bookId: 12, rating: 4, date: '2024-05-25T10:30:00Z' },
        { bookId: 14, rating: 5, date: '2024-06-05T16:45:00Z' },
      ],
      stats: {
        totalBooksRead: 2,
        totalPagesRead: 590,
        pagesReadByGenre: {
          Фэнтези: 320,
          'Научная фантастика': 270,
        },
      },
    },
    {
      id: 3,
      name: 'Иван Петров',
      username: 'user2',
      password: 'password',
      role: 'user',
      preferredGenres: shuffle(GENRES).slice(0, 4),
      favorites: [4, 8, 12],
      readLater: [5, 9, 13],
      readBooks: [16, 18, 20],
      readingProgress: [
        {
          bookId: 16,
          currentPage: 190,
          progress: 100,
          startDate: '2024-05-15T11:20:00Z',
        },
        {
          bookId: 18,
          currentPage: 410,
          progress: 100,
          startDate: '2024-05-28T14:50:00Z',
        },
        {
          bookId: 20,
          currentPage: 280,
          progress: 100,
          startDate: '2024-06-10T09:30:00Z',
        },
        {
          bookId: 4,
          currentPage: 150,
          progress: 50,
          startDate: '2024-06-15T17:15:00Z',
        },
      ],
      ratings: [
        { bookId: 16, rating: 3, date: '2024-05-18T22:10:00Z' },
        { bookId: 18, rating: 5, date: '2024-06-01T12:30:00Z' },
        { bookId: 20, rating: 4, date: '2024-06-12T19:45:00Z' },
      ],
      stats: {
        totalBooksRead: 3,
        totalPagesRead: 880,
        pagesReadByGenre: {
          История: 190,
          Триллер: 410,
          'Современная литература': 280,
        },
      },
    },
  ];
}

export function generateBooks(): Book[] {
  const books = [];

  for (let i = 1; i <= 30; i++) {
    const pageCount = Math.floor(Math.random() * 500) + 100;
    const genreCount = Math.floor(Math.random() * 3) + 1;
    const publishYear = Math.floor(Math.random() * 30) + 1990;

    const book: Book = {
      id: i,
      title: BOOK_TITLES[i - 1],
      author: AUTHORS[Math.floor(Math.random() * AUTHORS.length)],
      description: generateLorem(300).substring(0, 300),
      coverImage: BOOK_COVERS[Math.floor(Math.random() * BOOK_COVERS.length)],
      publishYear,
      pageCount,
      genres: shuffle(GENRES).slice(0, genreCount),
      rating: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      ratingsCount: Math.floor(Math.random() * 100) + 5,
      comments: generateComments(i, Math.floor(Math.random() * 5) + 1),
      content: generateBookContent(pageCount),
    };

    books.push(book);
  }

  return books;
}

function generateComments(bookId: number, count: number): Comment[] {
  const comments = [];
  const users = [
    { id: 1, name: 'Администратор' },
    { id: 2, name: 'Анна Смирнова' },
    { id: 3, name: 'Иван Петров' },
  ];

  for (let i = 1; i <= count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const comment: Comment = {
      id: bookId * 100 + i,
      bookId,
      userId: user.id,
      userName: user.name,
      author: user.name,
      text: generateLorem(50 + Math.floor(Math.random() * 150)),
      date: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    comments.push(comment);
  }

  return comments;
}
