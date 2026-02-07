<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  type: 'skill' | 'agent' | 'prompt' | 'mcp'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'install', data: { url?: string; filePath?: string; name?: string; command?: string; args?: string[]; env?: Record<string, string> }): void
}>()

const isOpen = ref(props.show)
const installType = ref<'url' | 'file'>('url')
const url = ref('')
const filePath = ref('')

// MCP-specific fields
const mcpName = ref('')
const mcpCommand = ref('')
const mcpArgs = ref('')
const mcpEnv = ref('')

watch(() => props.show, (val) => {
  isOpen.value = val
  if (val) {
    url.value = ''
    filePath.value = ''
    mcpName.value = ''
    mcpCommand.value = ''
    mcpArgs.value = ''
    mcpEnv.value = ''
  }
})

function handleInstall() {
  if (props.type === 'mcp') {
    const args = mcpArgs.value.split(',').map(s => s.trim()).filter(Boolean)
    let env: Record<string, string> | undefined
    if (mcpEnv.value.trim()) {
      env = {}
      mcpEnv.value.split(',').forEach(pair => {
        const [key, value] = pair.split('=').map(s => s.trim())
        if (key && value) {
          env![key] = value
        }
      })
    }
    emit('install', { name: mcpName.value, command: mcpCommand.value, args, env })
  } else {
    if (installType.value === 'url') {
      emit('install', { url: url.value })
    } else {
      emit('install', { filePath: filePath.value })
    }
  }
}

const typeLabels: Record<string, string> = {
  skill: 'Skill (zipball)',
  agent: 'Agent (.md file)',
  prompt: 'Prompt (.md file)',
  mcp: 'MCP Server'
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="$emit('close')"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Install {{ typeLabels[type] }}</h2>
          <button
            @click="$emit('close')"
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <!-- MCP-specific form -->
          <template v-if="type === 'mcp'">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  v-model="mcpName"
                  type="text"
                  placeholder="my-mcp-server"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Command</label>
                <input
                  v-model="mcpCommand"
                  type="text"
                  placeholder="npx -y @my/mcp-server"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arguments (comma-separated)</label>
                <input
                  v-model="mcpArgs"
                  type="text"
                  placeholder="--flag, value"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Environment (KEY=value, comma-separated)</label>
                <input
                  v-model="mcpEnv"
                  type="text"
                  placeholder="API_KEY=xxx, DEBUG=true"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </template>

          <!-- File/URL form for others -->
          <template v-else>
            <div class="flex gap-4 mb-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="installType"
                  value="url"
                  class="text-primary-500 focus:ring-primary-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">URL</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="installType"
                  value="file"
                  class="text-primary-500 focus:ring-primary-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">File Path</span>
              </label>
            </div>
            <div>
              <input
                v-if="installType === 'url'"
                v-model="url"
                type="url"
                placeholder="https://example.com/skill.zip"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                v-else
                v-model="filePath"
                type="text"
                placeholder="/path/to/file"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </template>
        </div>
        <div class="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleInstall"
            class="px-4 py-2 text-sm rounded-md bg-primary-500 hover:bg-primary-600 text-white transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
