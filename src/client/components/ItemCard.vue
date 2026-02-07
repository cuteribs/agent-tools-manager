<script setup lang="ts">
defineProps<{
  id: string
  name: string
  description: string
  enabled: boolean
  version?: string
  source: 'plugin' | 'user' | 'marketplace'
  canToggle?: boolean
  canUninstall?: boolean
}>()

defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'uninstall', id: string): void
  (e: 'viewDetails', id: string): void
}>()
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
    <div class="flex items-start justify-between">
      <div class="flex items-start gap-3">
        <div
          class="w-5 h-5 rounded flex items-center justify-center mt-0.5"
          :class="enabled ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path v-if="enabled" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-medium text-gray-900 dark:text-white">{{ name }}</h3>
            <span v-if="version" class="text-xs text-gray-500 dark:text-gray-400">v{{ version }}</span>
            <span
              class="text-xs px-2 py-0.5 rounded-full"
              :class="source === 'user' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'"
            >
              {{ source }}
            </span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ description }}</p>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
      <button
        @click="$emit('viewDetails', id)"
        class="text-sm px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
      >
        View Details
      </button>
      <button
        v-if="canToggle"
        @click="$emit('toggle', id)"
        class="text-sm px-3 py-1.5 rounded-md transition-colors"
        :class="enabled
          ? 'bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300'
          : 'bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300'"
      >
        {{ enabled ? 'Disable' : 'Enable' }}
      </button>
      <button
        v-if="canUninstall"
        @click="$emit('uninstall', id)"
        class="text-sm px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 transition-colors"
      >
        Uninstall
      </button>
    </div>
  </div>
</template>
