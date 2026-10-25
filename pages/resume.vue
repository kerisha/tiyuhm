<script setup lang="ts">
const { data: resume } = await useFetch<Resume | null>('/api/resume')
if (!resume.value) await navigateTo('/')

const downloadError = ref('')
const downloading = ref(false)

async function download() {
  downloadError.value = ''
  downloading.value = true
  try {
    const blob = await $fetch<Blob>('/api/pdf', { responseType: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'Resume.pdf'
    a.click()
    URL.revokeObjectURL(a.href)
  } catch {
    downloadError.value = "We couldn't make that PDF. Check that Chrome is installed for Puppeteer, then try again."
  } finally {
    downloading.value = false
  }
}

const checking = ref(false)
const fresh = ref<string[]>([])
const keysOf = (r: Resume | null | undefined) => (r?.experience ?? []).flatMap(g => g.bullets.map(b => b.shas.join()))
const note = ref('')
const noteIsError = ref(false)

// Show the saved resume instantly, then look for new significant commits in the background.
onMounted(async () => {
  checking.value = true
  try {
    const res = await $fetch<{ resume: Resume; added: number }>('/api/resume/refresh', { method: 'POST' })
    const before = new Set(keysOf(resume.value))
    resume.value = res.resume
    fresh.value = keysOf(res.resume).filter(k => !before.has(k))
    if (res.added > 0) note.value = `The scouts return with ${res.added} new ${res.added === 1 ? 'deed' : 'deeds'} from the field.`
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
    <StatusMessage v-if="checking" kind="loading">The scouts are out, checking for new deeds</StatusMessage>
    <StatusMessage v-else-if="note" :kind="noteIsError ? 'error' : 'note'">{{ note }}</StatusMessage>
    <div v-if="resume" class="downloads">
      <button class="button seal" :disabled="downloading" @click="download">
        <span aria-hidden="true">✠</span>{{ downloading ? 'Sealing the scroll…' : 'Download My Resume' }}
      </button>
    </div>
    <StatusMessage v-if="downloadError" kind="error" title="PDF problem">{{ downloadError }}</StatusMessage>
    <ResumeBody v-if="resume" :resume="resume" :fresh="fresh" />
  </ResumeSheet>
</template>

<style scoped>
.downloads { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 1.5rem; }
</style>
