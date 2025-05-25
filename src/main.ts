import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primeicons/primeicons.css'

import './style.css'
import App from './App.vue'
import router from './router'

// Регистрация задержки для имитации загрузки данных
const fakeDelay = 500;
(window as any).fakeDelay = fakeDelay;

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(PrimeVue, {
  ripple: true,
})
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')