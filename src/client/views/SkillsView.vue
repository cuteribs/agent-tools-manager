<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '../composables/useApi'
import ItemCard from '../components/ItemCard.vue'
import DetailModal from '../components/DetailModal.vue'
import InstallModal from '../components/InstallModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

interface Skill {
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

const skills = ref<Skill[]>([])
const searchQuery = ref('')
const selectedSkill = ref<Skill | null>(null)
const showDetail = ref(false)
const showInstall = ref(false)
const showConfirm = ref(false)
const skillToDelete = ref<string | null>(null)

const filteredSkills = computed(() => {
  if (!searchQuery.value) return skills.value
  const query = searchQuery.value.toLowerCase()
  return skills.value.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.description.toLowerCase().includes(query)
  )
})

async function loadSkills() {
  try {
    skills.value = await get<Skill[]>('/skills')
  } catch (e) {
    console.error('Failed to load skills:', e)
  }
}

async function viewDetails(id: string) {
  try {
    selectedSkill.value = await get<Skill>(`/skills/${encodeURIComponent(id)}`)
    showDetail.value = true
  } catch (e) {
    console.error('Failed to load skill details:', e)
  }
}

async function toggleSkill(id: string) {
  const skill = skills.value.find(s => s.id === id)
  if (!skill) return
  
  try {
    const action = skill.enabled ? 'disable' : 'enable'
    await post(`/skills/${encodeURIComponent(id)}/${action}`)
    await loadSkills()
  } catch (e) {
    console.error('Failed to toggle skill:', e)
  }
}

async function installSkill(data: { url?: string; filePath?: string }) {
  try {
    await post('/skills/install', data)
    showInstall.value = false
    await loadSkills()
  } catch (e) {
    console.error('Failed to install skill:', e)
  }
}

function confirmUninstall(id: string) {
  skillToDelete.value = id
  showConfirm.value = true
}

async function uninstallSkill() {
  if (!skillToDelete.value) return
  
  try {
    await del(`/skills/${encodeURIComponent(skillToDelete.value)}`)
    showConfirm.value = false
    skillToDelete.value = null
    await loadSkills()
  } catch (e) {
    console.error('Failed to uninstall skill:', e)
  }
}

onMounted(loadSkills)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Skills</h2>
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
          placeholder="Search skills..."
          class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading skills...</p>
    </div>

    <div v-else-if="filteredSkills.length === 0" class="text-center py-12">
      <p class="text-gray-600 dark:text-gray-400">
        {{ searchQuery ? 'No skills match your search.' : 'No skills installed.' }}
      </p>
    </div>

    <div v-else class="grid gap-4">
      <ItemCard
        v-for="skill in filteredSkills"
        :key="skill.id"
        :id="skill.id"
        :name="skill.name"
        :description="skill.description"
        :enabled="skill.enabled"
        :source="skill.source"
        :can-toggle="true"
        :can-uninstall="skill.source === 'user'"
        @view-details="viewDetails"
        @toggle="toggleSkill"
        @uninstall="confirmUninstall"
      />
    </div>

    <DetailModal
      :show="showDetail"
      :title="selectedSkill?.name || ''"
      :content="selectedSkill?.content"
      :path="selectedSkill?.path"
      @close="showDetail = false"
    />

    <InstallModal
      :show="showInstall"
      type="skill"
      @close="showInstall = false"
      @install="installSkill"
    />

    <ConfirmDialog
      :show="showConfirm"
      title="Uninstall Skill"
      message="Are you sure you want to uninstall this skill? This action cannot be undone."
      confirm-text="Uninstall"
      @confirm="uninstallSkill"
      @cancel="showConfirm = false"
    />
  </div>
</template>
