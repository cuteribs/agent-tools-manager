<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '../composables/useApi'
import ItemCard from '../components/ItemCard.vue'
import DetailModal from '../components/DetailModal.vue'
import InstallModal from '../components/InstallModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

interface Prompt {
  id: string
  name: string
  description: string
  enabled: boolean
  path: string
  source: 'plugin' | 'user'
  pluginId?: string
  content?: string
}

const { get, post, del, loading } = useApi()

const prompts = ref<Prompt[]>([])
const searchQuery = ref('')
const selectedPrompt = ref<Prompt | null>(null)
const showDetail = ref(false)
const showInstall = ref(false)
const showConfirm = ref(false)
const promptToDelete = ref<string | null>(null)

const filteredPrompts = computed(() => {
  if (!searchQuery.value) return prompts.value
  const query = searchQuery.value.toLowerCase()
  return prompts.value.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  )
})

async function loadPrompts() {
  try {
    prompts.value = await get<Prompt[]>('/prompts')
  } catch (e) {
    console.error('Failed to load prompts:', e)
  }
}

async function viewDetails(id: string) {
  try {
    selectedPrompt.value = await get<Prompt>(`/prompts/${encodeURIComponent(id)}`)
    showDetail.value = true
  } catch (e) {
    console.error('Failed to load prompt details:', e)
  }
}

async function togglePrompt(id: string) {
  const prompt = prompts.value.find(p => p.id === id)
  if (!prompt) return
  
  try {
    const action = prompt.enabled ? 'disable' : 'enable'
    await post(`/prompts/${encodeURIComponent(id)}/${action}`)
    await loadPrompts()
  } catch (e) {
    console.error('Failed to toggle prompt:', e)
  }
}

async function installPrompt(data: { url?: string; filePath?: string }) {
  try {
    await post('/prompts/install', data)
    showInstall.value = false
    await loadPrompts()
  } catch (e) {
    console.error('Failed to install prompt:', e)
  }
}

function confirmUninstall(id: string) {
  promptToDelete.value = id
  showConfirm.value = true
}

async function uninstallPrompt() {
  if (!promptToDelete.value) return
  
  try {
    await del(`/prompts/${encodeURIComponent(promptToDelete.value)}`)
    showConfirm.value = false
    promptToDelete.value = null
    await loadPrompts()
  } catch (e) {
    console.error('Failed to uninstall prompt:', e)
  }
}

onMounted(loadPrompts)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Prompts</h2>
        <button
          @click="showInstall = true"
          class="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Install
        </button>
      </div>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search prompts..."
          class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading prompts...</p>
    </div>

    <div v-else-if="filteredPrompts.length === 0" class="text-center py-12">
      <p class="text-gray-600 dark:text-gray-400">
        {{ searchQuery ? 'No prompts match your search.' : 'No prompts installed.' }}
      </p>
    </div>

    <div v-else class="grid gap-4">
      <ItemCard
        v-for="prompt in filteredPrompts"
        :key="prompt.id"
        :id="prompt.id"
        :name="prompt.name"
        :description="prompt.description"
        :enabled="prompt.enabled"
        :source="prompt.source"
        :can-toggle="true"
        :can-uninstall="prompt.source === 'user'"
        @view-details="viewDetails"
        @toggle="togglePrompt"
        @uninstall="confirmUninstall"
      />
    </div>

    <DetailModal
      :show="showDetail"
      :title="selectedPrompt?.name || ''"
      :content="selectedPrompt?.content"
      :path="selectedPrompt?.path"
      @close="showDetail = false"
    />

    <InstallModal
      :show="showInstall"
      type="prompt"
      @close="showInstall = false"
      @install="installPrompt"
    />

    <ConfirmDialog
      :show="showConfirm"
      title="Uninstall Prompt"
      message="Are you sure you want to uninstall this prompt? This action cannot be undone."
      confirm-text="Uninstall"
      @confirm="uninstallPrompt"
      @cancel="showConfirm = false"
    />
  </div>
</template>
