import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore(
  'theme',
  () => {
    const isDarkMode = ref(false);
    const readerFontSize = ref(18);
    const readerLineHeight = ref(1.6);
    const readerFontFamily = ref('Georgia');

    // Инициализируем тему в соответствии с системными настройками
    function initializeTheme() {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        isDarkMode.value = true;
      }

      // Слушаем изменение системной темы
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          isDarkMode.value = e.matches;
        });
    }

    // Переключение между темной и светлой темой
    function toggleDarkMode() {
      isDarkMode.value = !isDarkMode.value;
    }

    // Установка определенной темы
    function setDarkMode(value: boolean) {
      isDarkMode.value = value;
    }

    // Изменение размера шрифта в читалке
    function changeReaderFontSize(size: number) {
      readerFontSize.value = size;
    }

    // Изменение высоты строки в читалке
    function changeReaderLineHeight(height: number) {
      readerLineHeight.value = height;
    }

    // Изменение шрифта в читалке
    function changeReaderFontFamily(font: string) {
      readerFontFamily.value = font;
    }

    return {
      isDarkMode,
      readerFontSize,
      readerLineHeight,
      readerFontFamily,
      initializeTheme,
      toggleDarkMode,
      setDarkMode,
      changeReaderFontSize,
      changeReaderLineHeight,
      changeReaderFontFamily,
    };
  },
  {
    persist: true,
  },
);
