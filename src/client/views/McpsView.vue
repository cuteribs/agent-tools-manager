<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '../composables/useApi'
import ItemCard from '../components/ItemCard.vue'
import DetailModal from '../components/DetailModal.vue'
import InstallModal from '../components/InstallModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

interface MCP {
  id: string
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
  enabled: boolean
  source: 'plugin' | 'user'
}

const { get, post, del, loading } = useApi()

const mcps = ref<MCP[]>([])
const searchQuery = ref('')
const selectedMcp = ref<MCP | null>(null)
const showDetail = ref(false)
const showInstall = ref(false)
const showConfirm = ref(false)
const mcpToDelete = ref<string | null>(null)

const filteredMcps = computed(() => {
  if (!searchQuery.value) return mcps.value
  const query = searchQuery.value.toLowerCase()
  return mcps.value.filter(m =>
    m.name.toLowerCase().includes(query) ||
    m.command.toLowerCase().includes(query)
  )
})

async function loadMcps() {
  try {
    mcps.value = await get<MCP[]>('/mcps')
  } catch (e) {
    console.error('Failed to load MCPs:', e)
  }
}

async function viewDetails(id: string) {
  try {
    selectedMcp.value = await get<MCP>(`/mcps/${encodeURIComponent(id)}`)
    showDetail.value = true
  } catch (e) {
    console.error('Failed to load MCP details:', e)
  }
}

async function toggleMcp(id: string) {
  const mcp = mcps.value.find(m => m.id === id)
  if (!mcp) return
  
  try {
    const action = mcp.enabled ? 'disable' : 'enable'
    await post(`/mcps/${encodeURIComponent(id)}/${action}`)
    await loadMcps()
  } catch (e) {
    console.error('Failed to toggle MCP:', e)
  }
}

async function installMcp(data: { name?: string; command?: string; args?: string[]; env?: Record<string, string> }) {
  try {
    await post('/mcps/install', data)
    showInstall.value = false
    await loadMcps()
  } catch (e) {
    console.error('Failed to add MCP:', e)
  }
}

function confirmUninstall(id: string) {
  mcpToDelete.value = id
  showConfirm.value = true
}

async function uninstallMcp() {
  if (!mcpToDelete.value) return
  
  try {
    await del(`/mcps/${encodeURIComponent(mcpToDelete.value)}`)
    showConfirm.value = false
    mcpToDelete.value = null
    await loadMcps()
  } catch (e) {
    console.error('Failed to remove MCP:', e)
  }
}

function getMcpDescription(mcp: MCP): string {
  let desc = mcp.command
  if (mcp.args && mcp.args.length > 0) {
    desc += ' ' + mcp.args.join(' ')
  }
  return desc
}

function getMcpDetailContent(mcp: MCP | null): string {
  if (!mcp) return ''
  let content = `Command: ${mcp.command}\n`
  if (mcp.args && mcp.args.length > 0) {
    content += `Arguments: ${mcp.args.join(', ')}\n`
  }
  if (mcp.env && Object.keys(mcp.env).length > 0) {
    content += `Environment:\n`
    for (const [key, value] of Object.entries(mcp.env)) {
      content += `  ${key}=${value}\n`
    }
  }
  return content
}

onMounted(loadMcps)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">MCP Servers</h2>
        <button
          @click="showInstall = true"
          class="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search MCPs..."
          class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading MCP servers...</p>
    </div>

    <div v-else-if="filteredMcps.length === 0" class="text-center py-12">
      <p class="text-gray-600 dark:text-gray-400">
        {{ searchQuery ? 'No MCP servers match your search.' : 'No MCP servers configured.' }}
      </p>
    </div>

    <div v-else class="grid gap-4">
      <ItemCard
        v-for="mcp in filteredMcps"
        :key="mcp.id"
        :id="mcp.id"
        :name="mcp.name"
        :description="getMcpDescription(mcp)"
        :enabled="mcp.enabled"
        :source="mcp.source"
        :can-toggle="true"
        :can-uninstall="true"
        @view-details="viewDetails"
        @toggle="toggleMcp"
        @uninstall="confirmUninstall"
      />
    </div>

    <DetailModal
      :show="showDetail"
      :title="selectedMcp?.name || ''"
      :content="getMcpDetailContent(selectedMcp)"
      @close="showDetail = false"
    />

    <InstallModal
      :show="showInstall"
      type="mcp"
      @close="showInstall = false"
      @install="installMcp"
    />

    <ConfirmDialog
      :show="showConfirm"
      title="Remove MCP Server"
      message="Are you sure you want to remove this MCP server? This action cannot be undone."
      confirm-text="Remove"
      @confirm="uninstallMcp"
      @cancel="showConfirm = false"
    />
  </div>
</template>
