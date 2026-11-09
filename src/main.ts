import { createApp } from 'vue'
import App from './App.vue'
import './styles/themes.scss'
import './styles/main.scss'
import { initializeTheme } from './composables/useTheme'
import router from './router'

initializeTheme()
const app = createApp(App)
app.use(router)

app.mount('#app')
