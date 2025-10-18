<template>
  <div class="min-h-screen bg-cyber-dark text-cyber-green font-mono p-5 overflow-x-hidden relative">
    <!-- Debug info -->
    <div class="fixed top-0 left-0 bg-red-500 text-white p-2 text-xs z-50">
      Vue App Loaded -// Lifecycle
onMounted(() => {
  // Component is ready
  console.log('Vue app mounted');
  console.log('window.electronAPI available:', typeof window !== 'undefined' && !!window.electronAPI);
  console.log('window object:', window);
})ronAPI: {{ !!window?.electronAPI }}
    </div>

    <!-- Background grid -->
    <div class="fixed inset-0 opacity-5 pointer-events-none z-0">
      <div class="absolute inset-0 bg-grid-pattern"></div>
    </div>

    <div class="max-w-[900px] mx-auto bg-black/95 backdrop-blur-[10px] border border-cyber-green/30 rounded-lg p-10 shadow-[0_0_30px_rgba(0,255,65,0.1)] shadow-black/80 relative">
      <!-- Settings -->
      <div class="absolute top-5 right-5 flex items-center gap-4 z-10">
        <div class="text-xs text-cyber-green/70 max-w-[180px] truncate">
          下載路徑: {{ downloadPathDisplay }}
        </div>
        <button
          @click="chooseDownloadPath"
          class="px-3 py-2 border border-cyber-green/50 bg-black/80 text-cyber-green text-xs font-medium cursor-pointer rounded hover:border-cyber-green hover:shadow-[0_0_15px_rgba(0,255,65,0.3)] hover:text-white transition-all duration-300 uppercase tracking-wider"
        >
          選擇路徑
        </button>
      </div>

      <!-- Title -->
      <h1 class="text-center mb-12 font-semibold text-4xl text-cyber-green drop-shadow-[0_0_10px_rgba(0,255,65,0.5)] uppercase tracking-widest relative">
        <span class="absolute -left-8 top-1/2 -translate-y-1/2 text-cyber-green text-sm animate-blink">></span>
        YouTube 音樂下載器
      </h1>

      <!-- Tabs -->
      <div class="flex justify-center mb-10">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-3 border border-cyber-green/30 bg-black/80 text-cyber-green text-xs font-medium cursor-pointer rounded-t-lg transition-all duration-300 uppercase tracking-wider mx-1',
            activeTab === tab.id
              ? 'bg-cyber-green/10 border-cyber-green shadow-[0_0_15px_rgba(0,255,65,0.2)]'
              : ''
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'names'" class="flex flex-col gap-5 items-center">
        <textarea
          v-model="namesInput"
          placeholder="輸入歌曲名稱，每行一個"
          class="w-full max-w-[600px] h-[150px] p-5 border border-cyber-green/30 rounded-lg bg-black/90 text-cyber-green text-sm font-mono resize-vertical shadow-inner shadow-cyber-green/10 focus:outline-none focus:border-cyber-green focus:shadow-[inset_0_0_20px_rgba(0,255,65,0.2),0_0_20px_rgba(0,255,65,0.3)] transition-all duration-300 placeholder:text-cyber-green/50"
        ></textarea>

        <!-- Progress Bar -->
        <div v-if="showNamesProgress" class="w-full max-w-[600px] mb-4">
          <div class="w-full h-2 bg-cyber-green/10 rounded overflow-hidden mb-1">
            <div
              class="h-full bg-gradient-to-r from-cyber-green to-green-400 transition-all duration-300 shadow-[0_0_10px_rgba(0,255,65,0.5)]"
              :style="{ width: namesProgress + '%' }"
            ></div>
          </div>
          <div class="text-xs text-cyber-green/70 text-center font-mono">
            {{ namesProgress }}%
          </div>
        </div>

        <button
          @click="downloadNames"
          :disabled="isDownloadingNames"
          :class="[
            'px-9 py-3.5 border border-cyber-green/50 rounded-3xl bg-black/80 text-cyber-green text-sm font-medium cursor-pointer transition-all duration-300 uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,65,0.2)] hover:border-cyber-green hover:shadow-[0_0_25px_rgba(0,255,65,0.4)] hover:text-white active:translate-y-0.5',
            isDownloadingNames ? 'animate-pulse opacity-70 cursor-not-allowed' : ''
          ]"
        >
          {{ isDownloadingNames ? '下載中...' : '開始下載' }}
          <span v-if="isDownloadingNames" class="inline-block w-2.5 h-2.5 border-2 border-cyber-green rounded-full border-t-transparent animate-spin ml-2"></span>
        </button>
      </div>

      <div v-if="activeTab === 'urls'" class="flex flex-col gap-5 items-center">
        <textarea
          v-model="urlsInput"
          placeholder="輸入 YouTube 網址，每行一個"
          class="w-full max-w-[600px] h-[150px] p-5 border border-cyber-green/30 rounded-lg bg-black/90 text-cyber-green text-sm font-mono resize-vertical shadow-inner shadow-cyber-green/10 focus:outline-none focus:border-cyber-green focus:shadow-[inset_0_0_20px_rgba(0,255,65,0.2),0_0_20px_rgba(0,255,65,0.3)] transition-all duration-300 placeholder:text-cyber-green/50"
        ></textarea>

        <!-- Progress Bar -->
        <div v-if="showUrlsProgress" class="w-full max-w-[600px] mb-4">
          <div class="w-full h-2 bg-cyber-green/10 rounded overflow-hidden mb-1">
            <div
              class="h-full bg-gradient-to-r from-cyber-green to-green-400 transition-all duration-300 shadow-[0_0_10px_rgba(0,255,65,0.5)]"
              :style="{ width: urlsProgress + '%' }"
            ></div>
          </div>
          <div class="text-xs text-cyber-green/70 text-center font-mono">
            {{ urlsProgress }}%
          </div>
        </div>

        <button
          @click="downloadUrls"
          :disabled="isDownloadingUrls"
          :class="[
            'px-9 py-3.5 border border-cyber-green/50 rounded-3xl bg-black/80 text-cyber-green text-sm font-medium cursor-pointer transition-all duration-300 uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,65,0.2)] hover:border-cyber-green hover:shadow-[0_0_25px_rgba(0,255,65,0.4)] hover:text-white active:translate-y-0.5',
            isDownloadingUrls ? 'animate-pulse opacity-70 cursor-not-allowed' : ''
          ]"
        >
          {{ isDownloadingUrls ? '下載中...' : '開始下載' }}
          <span v-if="isDownloadingUrls" class="inline-block w-2.5 h-2.5 border-2 border-cyber-green rounded-full border-t-transparent animate-spin ml-2"></span>
        </button>
      </div>

      <!-- Status -->
      <div class="mt-8 p-5 bg-black/90 border border-cyber-green/20 rounded-lg whitespace-pre-line font-mono text-xs text-cyber-green max-h-[250px] overflow-y-auto shadow-inner shadow-black/50">
        {{ status }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Reactive data
const activeTab = ref('names')
const namesInput = ref('')
const urlsInput = ref('')
const status = ref('')
const downloadPath = ref(localStorage.getItem('downloadPath') || null)
const isDownloadingNames = ref(false)
const isDownloadingUrls = ref(false)
const namesProgress = ref(0)
const urlsProgress = ref(0)
const showNamesProgress = ref(false)
const showUrlsProgress = ref(false)

// Computed
const downloadPathDisplay = computed(() => {
  if (downloadPath.value) {
    const shortPath = downloadPath.value.length > 30 ? '...' + downloadPath.value.slice(-27) : downloadPath.value
    return shortPath
  }
  return '預設'
})

const tabs = [
  { id: 'names', label: '按名稱下載' },
  { id: 'urls', label: '按網址下載' }
]

// Methods
const chooseDownloadPath = async () => {
  const path = await window.electronAPI.chooseDownloadPath()
  if (path) {
    downloadPath.value = path
    localStorage.setItem('downloadPath', path)
  }
}

const downloadNames = async () => {
  const names = namesInput.value.split('\n').filter(n => n.trim())
  if (names.length === 0) return

  isDownloadingNames.value = true
  showNamesProgress.value = true
  namesProgress.value = 0
  status.value = '下載中...'

  let completed = 0
  const total = names.length

  for (const name of names) {
    try {
      const url = await window.electronAPI.search(name.trim())
      const res = await window.electronAPI.download(url, downloadPath.value)
      if (res && res.success) {
        status.value += `\n已下載: ${name}`
      } else {
        status.value += `\n${name} 錯誤: ${res?.error || '未知錯誤'}`
      }

      completed++
      namesProgress.value = Math.round((completed / total) * 100)
    } catch (error) {
      status.value += `\n${name} 錯誤: ${error}`

      completed++
      namesProgress.value = Math.round((completed / total) * 100)
    }
  }

  status.value += '\n完成'

  // Hide progress bar after a short delay
  setTimeout(() => {
    showNamesProgress.value = false
  }, 2000)

  isDownloadingNames.value = false
}

const downloadUrls = async () => {
  const urls = urlsInput.value.split('\n').filter(u => u.trim())
  if (urls.length === 0) return

  isDownloadingUrls.value = true
  showUrlsProgress.value = true
  urlsProgress.value = 0
  status.value = '下載中...'

  let completed = 0
  const total = urls.length

  for (const url of urls) {
    try {
      const result = await window.electronAPI.download(url.trim(), downloadPath.value)
      status.value += `\n已下載: ${url}`

      completed++
      urlsProgress.value = Math.round((completed / total) * 100)
    } catch (error) {
      status.value += `\n${url} 錯誤: ${error}`

      completed++
      urlsProgress.value = Math.round((completed / total) * 100)
    }
  }

  status.value += '\n完成'

  // Hide progress bar after a short delay
  setTimeout(() => {
    showUrlsProgress.value = false
  }, 2000)

  isDownloadingUrls.value = false
}

// Lifecycle
onMounted(() => {
  // Component is ready
  console.log('Vue app mounted');
  console.log('electronAPI available:', !!window.electronAPI);
})
</script>

<style>
.bg-grid-pattern {
  background-image:
    linear-gradient(rgba(0, 255, 65, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 65, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}
</style>