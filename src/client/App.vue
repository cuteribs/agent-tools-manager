<script setup lang="ts">
import { onMounted } from 'vue'
import Header from './components/Header.vue'
import TabBar from './components/TabBar.vue'
import { useTheme } from './composables/useTheme'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <TabBar />
    <main class="flex-1 container mx-auto px-4 py-6">
      <router-view />
    </main>
  </div>
</template>
