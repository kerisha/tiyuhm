<script setup lang="ts">
const { data: resume } = await useFetch<Resume | null>('/api/resume')
if (!resume.value) await navigateTo('/')

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
    <ResumeBody v-if="resume" :resume="resume" />
  </ResumeSheet>
</template>
