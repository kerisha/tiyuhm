<script setup lang="ts">
defineProps<{ resume: Resume }>()

function month(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
</script>

<template>
  <div class="resume">
    <header>
      <p class="kicker">Resume</p>
      <h1>{{ resume.profile.name || resume.profile.username }}</h1>
      <p class="contact">
        <span v-if="resume.profile.location">{{ resume.profile.location }}</span>
        <span v-if="resume.profile.email">{{ resume.profile.email }}</span>
        <span v-if="resume.profile.blog">{{ resume.profile.blog }}</span>
        <span>{{ resume.profile.profileUrl }}</span>
      </p>
    </header>

    <section>
      <h2><span class="kicker">Summary</span></h2>
      <blockquote>{{ resume.summary }}</blockquote>
    </section>

    <section>
      <h2><span class="kicker">Experience</span></h2>
      <div v-for="g in resume.experience" :key="g.ownerLabel" class="group">
        <h3>{{ g.ownerLabel }}</h3>
        <p class="period">{{ month(g.periodFrom) }} – {{ month(g.periodTo) }}</p>
        <ul>
          <li v-for="b in g.bullets" :key="b.shas.join()">{{ b.text }}</li>
        </ul>
      </div>
    </section>

    <section>
      <h2><span class="kicker">Education</span></h2>
      <p v-for="e in resume.education" :key="e.school">
        <strong>{{ e.school }}</strong>, {{ e.degree }}, {{ e.years }}
        <em v-if="e.isDemo" class="demo"> (demo content: replace with your own)</em>
      </p>
    </section>

    <section>
      <h2><span class="kicker">Skills</span></h2>
      <p class="skills">{{ resume.skills.join(' · ') }}</p>
    </section>
  </div>
</template>

<style scoped>
header h1 { font-size: 3rem; line-height: 1.05; margin-bottom: 0.6rem; }
.contact { display: flex; flex-wrap: wrap; gap: 0.2rem 1.2rem; margin: 0 0 2rem; }
section { margin-bottom: 2rem; }
blockquote {
  margin: 0.6rem 0 0;
  padding-left: 1.2rem;
  border-left: 4px solid var(--accent);
  font-family: var(--font-display);
  font-size: 1.25rem;
  line-height: 1.5;
}
h3 { margin-bottom: 0; }
.period { margin: 0 0 0.4rem; color: var(--ink); font-variant: small-caps; letter-spacing: 0.08em; }
.group ul { padding-left: 1.2rem; margin-top: 0.4rem; }
.group li { margin-bottom: 0.5rem; }
.demo { font-weight: 400; }
</style>
