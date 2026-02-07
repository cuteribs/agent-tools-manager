import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import PluginsView from './views/PluginsView.vue'
import SkillsView from './views/SkillsView.vue'
import AgentsView from './views/AgentsView.vue'
import PromptsView from './views/PromptsView.vue'
import McpsView from './views/McpsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/plugins' },
    { path: '/plugins', component: PluginsView },
    { path: '/skills', component: SkillsView },
    { path: '/agents', component: AgentsView },
    { path: '/prompts', component: PromptsView },
    { path: '/mcps', component: McpsView }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
