<script setup lang="ts">
const props = defineProps<{ resume: Resume; fresh?: string[] }>()

const displayName = computed(() => props.resume.profile.name || props.resume.profile.username)
const initials = computed(() => initialsOf(displayName.value))

function month(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
</script>

<template>
  <div class="resume">
    <header>
      <p class="kicker realm">The Realm of {{ displayName }}</p>
      <p class="divider" aria-hidden="true"><span>◆</span></p>
      <div class="masthead">
        <Crest :initials="initials" :size="84" />
        <div>
          <p class="kicker">Resume</p>
          <h1 class="gothic">{{ displayName }}</h1>
        </div>
      </div>
      <p class="contact">
        <span v-if="resume.profile.location"><span class="kicker">Hails from</span> {{ resume.profile.location }}</span>
        <span v-if="resume.profile.email"><span class="kicker">Send a raven</span> {{ resume.profile.email }}</span>
        <span v-if="resume.profile.blog"><span class="kicker">Scrolls</span> {{ resume.profile.blog }}</span>
        <span><span class="kicker">Visit the keep</span> {{ resume.profile.profileUrl }}</span>
      </p>
    </header>

    <section>
      <h2>The Proclamation<span class="plain">Summary</span></h2>
      <blockquote>{{ resume.summary }}</blockquote>
    </section>

    <section>
      <h2>Quests Undertaken<span class="plain">Experience</span></h2>
      <div v-for="g in resume.experience" :key="g.ownerLabel" class="group">
        <p class="kicker holding">Vanquished</p>
        <h3>{{ g.ownerLabel }}</h3>
        <p class="period">{{ month(g.periodFrom) }} – {{ month(g.periodTo) }}</p>
        <ul>
          <li v-for="b in g.bullets" :key="b.shas.join()">
            {{ b.text }}
            <span v-if="fresh?.includes(b.shas.join())" class="ribbon">Fresh from the field</span>
          </li>
        </ul>
      </div>
    </section>

    <section>
      <h2>The Academy<span class="plain">Education</span></h2>
      <p v-for="e in resume.education" :key="e.school">
        <strong>{{ e.school }}</strong>, {{ e.degree }}, {{ e.years }}
      </p>
    </section>

    <section>
      <h2>The Armory<span class="plain">Skills</span></h2>
      <p class="skills">{{ resume.skills.join(' · ') }}</p>
    </section>
  </div>
</template>

<style scoped>
header h1 { font-size: 3.2rem; line-height: 1.05; margin-bottom: 0.2rem; }
.realm { text-align: center; font-size: 1.1rem; margin: 0; }
header .divider { margin: 0.4rem 0 1.2rem; }
.masthead { display: flex; align-items: center; gap: 1.2rem; margin-bottom: 0.8rem; }
.masthead .kicker { margin: 0; }
.holding { margin: 0.8rem 0 0; font-size: 0.9rem; }
h2 { display: flex; flex-direction: column; }
h2 .plain { font-family: var(--font-body); font-size: 0.85rem; font-variant: small-caps; letter-spacing: 0.12em; }
.ribbon {
  display: inline-block;
  margin-left: 0.4rem;
  padding: 0 0.5rem;
  background: var(--accent);
  color: #3f4235;
  font-size: 0.8rem;
  font-variant: small-caps;
  letter-spacing: 0.08em;
  vertical-align: middle;
}
.contact { display: flex; flex-wrap: wrap; gap: 0.2rem 1.4rem; margin: 0 0 2rem; }
.contact .kicker { display: block; font-size: 0.85rem; }
section { margin-bottom: 2rem; }
blockquote {
  margin: 0.6rem 0 0;
  padding-left: 1.2rem;
  border-left: 4px solid var(--accent);
  font-family: var(--font-display);
  font-size: 1.25rem;
  line-height: 1.5;
}
blockquote::first-letter {
  float: left;
  font-family: var(--font-gothic);
  font-size: 4rem;
  line-height: 0.8;
  padding: 0.25rem 0.5rem 0 0;
  color: var(--accent);
}
h3 { margin-bottom: 0; }
.period { margin: 0 0 0.4rem; color: var(--ink); font-variant: small-caps; letter-spacing: 0.08em; }
.group ul { padding-left: 1.2rem; margin-top: 0.4rem; }
.group li { margin-bottom: 0.5rem; }
</style>
