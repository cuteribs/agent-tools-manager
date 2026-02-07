<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
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
      @click.self="$emit('cancel')"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ title }}</h3>
          <p class="text-gray-600 dark:text-gray-400">{{ message }}</p>
        </div>
        <div class="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {{ cancelText || 'Cancel' }}
          </button>
          <button
            @click="$emit('confirm')"
            class="px-4 py-2 text-sm rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            {{ confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
