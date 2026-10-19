<script setup lang="ts">
import '~/assets/css/print-traditional.css'

useHead({ bodyAttrs: { class: 'traditional' } })
const { data: resume } = await useFetch<Resume | null>('/api/resume')

function month(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
</script>

<template>
  <div v-if="resume" class="traditional-page">
    <h1>{{ resume.profile.name || resume.profile.username }}</h1>
    <h2>Contact</h2>
    <p v-if="resume.profile.location">{{ resume.profile.location }}</p>
    <p v-if="resume.profile.email">{{ resume.profile.email }}</p>
    <p v-if="resume.profile.blog">{{ resume.profile.blog }}</p>
    <p>{{ resume.profile.profileUrl }}</p>

    <h2>Summary</h2>
    <p>{{ resume.summary }}</p>

    <h2>Experience</h2>
    <section v-for="g in resume.experience" :key="g.ownerLabel">
      <h3>{{ g.ownerLabel }}, {{ month(g.periodFrom) }} to {{ month(g.periodTo) }}</h3>
      <ul>
        <li v-for="b in g.bullets" :key="b.shas.join()">{{ b.text }}</li>
      </ul>
    </section>

    <h2>Education</h2>
    <p v-for="e in resume.education" :key="e.school">
      {{ e.school }}, {{ e.degree }}, {{ e.years }}<template v-if="e.isDemo"> (demo content)</template>
    </p>

    <h2>Skills</h2>
    <p>{{ resume.skills.join(', ') }}</p>
  </div>
</template>
