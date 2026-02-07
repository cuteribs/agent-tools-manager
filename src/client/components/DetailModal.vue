<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  title: string
  content?: string
  path?: string
}>()

defineEmits<{
  (e: 'close'): void
}>()

const isOpen = ref(props.show)

watch(() => props.show, (val) => {
  isOpen.value = val
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="$emit('close')"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h2>
          <button
            @click="$emit('close')"
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4">
          <div v-if="path" class="mb-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">Path:</span>
            <code class="ml-2 text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ path }}</code>
          </div>
          <div v-if="content" class="prose dark:prose-invert max-w-none">
            <pre class="text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">{{ content }}</pre>
          </div>
          <p v-else class="text-gray-500 dark:text-gray-400">No content available</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
