<script setup lang="ts">
const { data: resume } = await useFetch<Resume | null>('/api/resume')
if (!resume.value) await navigateTo('/')

const downloadError = ref('')
const downloading = ref('')

async function download(kind: 'magazine' | 'traditional') {
  downloadError.value = ''
  downloading.value = kind
  try {
    const blob = await $fetch<Blob>(`/api/pdf/${kind}`, { responseType: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = kind === 'magazine' ? 'Resume-Magazine.pdf' : 'Resume.pdf'
    a.click()
    URL.revokeObjectURL(a.href)
  } catch (e: any) {
    downloadError.value = "We couldn't make that PDF. Check that Chrome is installed for Puppeteer, then try again."
  } finally {
    downloading.value = ''
  }
}

const checking = ref(false)
const note = ref('')
const noteIsError = ref(false)

// Show the saved resume instantly, then look for new significant commits in the background.
onMounted(async () => {
  checking.value = true
  try {
    const res = await $fetch<{ resume: Resume; added: number }>('/api/resume/refresh', { method: 'POST' })
    resume.value = res.resume
    if (res.added > 0) note.value = `Added ${res.added} new ${res.added === 1 ? 'highlight' : 'highlights'} from your recent work.`
  } catch (e: any) {
    noteIsError.value = true
    note.value = `Couldn't check for new work: ${e?.data?.statusMessage || 'something went wrong'}. Showing your saved resume.`
  } finally {
    checking.value = false
  }
})
</script>

<template>
  <ResumeSheet>
    <StatusMessage v-if="checking" kind="loading">Checking for new work</StatusMessage>
    <StatusMessage v-else-if="note" :kind="noteIsError ? 'error' : 'note'">{{ note }}</StatusMessage>
    <div v-if="resume" class="downloads">
      <button class="button" :disabled="!!downloading" @click="download('magazine')">
        {{ downloading === 'magazine' ? 'Making PDF…' : 'Download magazine PDF' }}
      </button>
      <button class="button" :disabled="!!downloading" @click="download('traditional')">
        {{ downloading === 'traditional' ? 'Making PDF…' : 'Download traditional PDF' }}
      </button>
    </div>
    <StatusMessage v-if="downloadError" kind="error" title="PDF problem">{{ downloadError }}</StatusMessage>
    <ResumeBody v-if="resume" :resume="resume" />
  </ResumeSheet>
</template>

<style scoped>
.downloads { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 1.5rem; }
</style>
