<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '../composables/useApi'
import ItemCard from '../components/ItemCard.vue'
import DetailModal from '../components/DetailModal.vue'

interface Plugin {
  id: string
  name: string
  version: string
  description: string
  author: { name: string; email?: string }
  enabled: boolean
  installPath: string
  installedAt: string
  source: 'marketplace'
  readme?: string
}

const { get, loading } = useApi()

const plugins = ref<Plugin[]>([])
const searchQuery = ref('')
const selectedPlugin = ref<Plugin | null>(null)
const showDetail = ref(false)

const filteredPlugins = computed(() => {
  if (!searchQuery.value) return plugins.value
  const query = searchQuery.value.toLowerCase()
  return plugins.value.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  )
})

async function loadPlugins() {
  try {
    plugins.value = await get<Plugin[]>('/plugins')
  } catch (e) {
    console.error('Failed to load plugins:', e)
  }
}

async function viewDetails(id: string) {
  try {
    selectedPlugin.value = await get<Plugin>(`/plugins/${encodeURIComponent(id)}`)
    showDetail.value = true
  } catch (e) {
    console.error('Failed to load plugin details:', e)
  }
}

onMounted(loadPlugins)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Plugins</h2>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search plugins..."
          class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading plugins...</p>
    </div>

    <div v-else-if="filteredPlugins.length === 0" class="text-center py-12">
      <p class="text-gray-600 dark:text-gray-400">
        {{ searchQuery ? 'No plugins match your search.' : 'No plugins installed.' }}
      </p>
    </div>

    <div v-else class="grid gap-4">
      <ItemCard
        v-for="plugin in filteredPlugins"
        :key="plugin.id"
        :id="plugin.id"
        :name="plugin.name"
        :description="plugin.description"
        :enabled="plugin.enabled"
        :version="plugin.version"
        source="marketplace"
        @view-details="viewDetails"
      />
    </div>

    <DetailModal
      :show="showDetail"
      :title="selectedPlugin?.name || ''"
      :content="selectedPlugin?.readme"
      :path="selectedPlugin?.installPath"
      @close="showDetail = false"
    />
  </div>
</template>
