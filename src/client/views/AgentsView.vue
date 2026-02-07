<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '../composables/useApi'
import ItemCard from '../components/ItemCard.vue'
import DetailModal from '../components/DetailModal.vue'
import InstallModal from '../components/InstallModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

interface Agent {
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

const agents = ref<Agent[]>([])
const searchQuery = ref('')
const selectedAgent = ref<Agent | null>(null)
const showDetail = ref(false)
const showInstall = ref(false)
const showConfirm = ref(false)
const agentToDelete = ref<string | null>(null)

const filteredAgents = computed(() => {
  if (!searchQuery.value) return agents.value
  const query = searchQuery.value.toLowerCase()
  return agents.value.filter(a =>
    a.name.toLowerCase().includes(query) ||
    a.description.toLowerCase().includes(query)
  )
})

async function loadAgents() {
  try {
    agents.value = await get<Agent[]>('/agents')
  } catch (e) {
    console.error('Failed to load agents:', e)
  }
}

async function viewDetails(id: string) {
  try {
    selectedAgent.value = await get<Agent>(`/agents/${encodeURIComponent(id)}`)
    showDetail.value = true
  } catch (e) {
    console.error('Failed to load agent details:', e)
  }
}

async function toggleAgent(id: string) {
  const agent = agents.value.find(a => a.id === id)
  if (!agent) return
  
  try {
    const action = agent.enabled ? 'disable' : 'enable'
    await post(`/agents/${encodeURIComponent(id)}/${action}`)
    await loadAgents()
  } catch (e) {
    console.error('Failed to toggle agent:', e)
  }
}

async function installAgent(data: { url?: string; filePath?: string }) {
  try {
    await post('/agents/install', data)
    showInstall.value = false
    await loadAgents()
  } catch (e) {
    console.error('Failed to install agent:', e)
  }
}

function confirmUninstall(id: string) {
  agentToDelete.value = id
  showConfirm.value = true
}

async function uninstallAgent() {
  if (!agentToDelete.value) return
  
  try {
    await del(`/agents/${encodeURIComponent(agentToDelete.value)}`)
    showConfirm.value = false
    agentToDelete.value = null
    await loadAgents()
  } catch (e) {
    console.error('Failed to uninstall agent:', e)
  }
}

onMounted(loadAgents)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Agents</h2>
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
          placeholder="Search agents..."
          class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading agents...</p>
    </div>

    <div v-else-if="filteredAgents.length === 0" class="text-center py-12">
      <p class="text-gray-600 dark:text-gray-400">
        {{ searchQuery ? 'No agents match your search.' : 'No agents installed.' }}
      </p>
    </div>

    <div v-else class="grid gap-4">
      <ItemCard
        v-for="agent in filteredAgents"
        :key="agent.id"
        :id="agent.id"
        :name="agent.name"
        :description="agent.description"
        :enabled="agent.enabled"
        :source="agent.source"
        :can-toggle="true"
        :can-uninstall="agent.source === 'user'"
        @view-details="viewDetails"
        @toggle="toggleAgent"
        @uninstall="confirmUninstall"
      />
    </div>

    <DetailModal
      :show="showDetail"
      :title="selectedAgent?.name || ''"
      :content="selectedAgent?.content"
      :path="selectedAgent?.path"
      @close="showDetail = false"
    />

    <InstallModal
      :show="showInstall"
      type="agent"
      @close="showInstall = false"
      @install="installAgent"
    />

    <ConfirmDialog
      :show="showConfirm"
      title="Uninstall Agent"
      message="Are you sure you want to uninstall this agent? This action cannot be undone."
      confirm-text="Uninstall"
      @confirm="uninstallAgent"
      @cancel="showConfirm = false"
    />
  </div>
</template>
