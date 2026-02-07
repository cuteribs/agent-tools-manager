<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { name: 'Plugins', path: '/plugins' },
  { name: 'Skills', path: '/skills' },
  { name: 'Agents', path: '/agents' },
  { name: 'Prompts', path: '/prompts' },
  { name: 'MCPs', path: '/mcps' }
]
</script>

<template>
  <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4">
      <div class="flex gap-1">
        <router-link
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          class="px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px"
          :class="route.path === tab.path
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'"
        >
          {{ tab.name }}
        </router-link>
      </div>
    </div>
  </nav>
</template>
