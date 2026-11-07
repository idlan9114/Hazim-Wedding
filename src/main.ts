import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'
import './assets/styles/motion.css'
import './assets/styles/responsive.css'

createApp(App).use(router).mount('#app')
