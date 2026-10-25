<script setup lang="ts">
interface Profile {
  username: string
  name: string | null
  email: string | null
  location: string | null
  blog: string | null
  profileUrl: string
}

interface Owner {
  label: string
  kind: 'org' | 'user'
  login: string
  available: boolean
  reason?: string
}

const username = ref('')
const step = ref<'form' | 'loading' | 'profile' | 'error' | 'generating'>('form')
const profile = ref<Profile | null>(null)
const owners = ref<Owner[]>([])
const selected = ref<string[]>([])
const from = ref('')
const to = ref('')
const generateError = ref('')

const hasUsableOwners = computed(() => owners.value.some((o) => o.available))
const datesValid = computed(() => !!from.value && !!to.value && from.value <= to.value)
const canGenerate = computed(() => selected.value.length > 0 && datesValid.value)
const errorMessage = ref('')

async function lookUp() {
  const name = username.value.trim()
  if (!name) return
  step.value = 'loading'
  try {
    const res = await $fetch<{ profile: Profile; owners: Owner[] }>('/api/github/profile', {
      method: 'POST',
      body: { username: name },
    })
    profile.value = res.profile
    owners.value = res.owners
    selected.value = []
    step.value = 'profile'
  } catch (e: any) {
    errorMessage.value = e?.data?.statusMessage || e?.statusMessage || 'Something went wrong reaching GitHub.'
    step.value = 'error'
  }
}

async function generate() {
  generateError.value = ''
  step.value = 'generating'
  try {
    await $fetch('/api/resume/generate', {
      method: 'POST',
      body: { username: profile.value!.username, owners: selected.value, from: from.value, to: to.value },
    })
    await navigateTo('/resume')
  } catch (e: any) {
    generateError.value = e?.data?.statusMessage || e?.statusMessage || 'Something went wrong while writing your resume.'
    step.value = 'profile'
  }
}
</script>

<template>
  <ResumeSheet>
    <p class="kicker">Step one</p>
    <h1>Who goes there?</h1>

    <form v-if="step === 'form'" @submit.prevent="lookUp">
      <label for="username">Your GitHub username</label>
      <input id="username" v-model="username" type="text" autocomplete="off" autofocus />
      <p><button class="button" :disabled="!username.trim()">Find me</button></p>
    </form>

    <StatusMessage v-else-if="step === 'generating'" kind="loading" title="Reading your work">
      Judging your commits and writing your resume. This can take a few minutes, so keep this tab open
    </StatusMessage>

    <StatusMessage v-else-if="step === 'loading'" kind="loading">Looking you up on GitHub</StatusMessage>

    <template v-else-if="step === 'error'">
      <StatusMessage kind="error" title="We can't go any further yet">{{ errorMessage }}</StatusMessage>
      <p><button class="button" @click="step = 'form'">Try another username</button></p>
    </template>

    <section v-else-if="profile">
      <h2>{{ profile.name || profile.username }}</h2>
      <p class="kicker">@{{ profile.username }}</p>
      <ul>
        <li v-if="profile.location">{{ profile.location }}</li>
        <li v-if="profile.email">{{ profile.email }}</li>
        <li v-if="profile.blog">{{ profile.blog }}</li>
        <li><a :href="profile.profileUrl">{{ profile.profileUrl }}</a></li>
      </ul>

      <h2>Which work goes on the resume?</h2>
      <StatusMessage v-if="!hasUsableOwners" kind="error" title="Nothing to read from yet">
        <template v-if="owners.length === 0">
          No owners are set up. Copy <code>owners.config.example.json</code> to <code>owners.config.json</code>, add a read-only token for each organization (and one for your own account), then reload. Without a token we can't read any commits.
        </template>
        <template v-else>
          None of your configured tokens work, so there's nothing to read. See the reasons below.
        </template>
      </StatusMessage>
      <ul class="owners">
        <li v-for="o in owners" :key="o.login + o.kind" :class="{ off: !o.available }">
          <label>
            <input v-model="selected" type="checkbox" :value="o.login" :disabled="!o.available" />
            {{ o.label }} <span class="kicker">{{ o.kind === 'org' ? 'organization' : 'personal' }}</span>
          </label>
          <small v-if="!o.available">{{ o.reason }}</small>
        </li>
      </ul>

      <template v-if="hasUsableOwners">
        <h2>What period?</h2>
        <div class="dates">
          <div><label for="from">From</label><input id="from" v-model="from" type="date" /></div>
          <div><label for="to">To</label><input id="to" v-model="to" type="date" /></div>
        </div>
        <p v-if="from && to && !datesValid" class="hint">The start date has to come before the end date.</p>
        <p><button class="button" :disabled="!canGenerate" @click="generate">Generate</button></p>
        <StatusMessage v-if="generateError" kind="error" title="That didn't work">{{ generateError }}</StatusMessage>
      </template>
    </section>
  </ResumeSheet>
</template>

<style scoped>
.owners { list-style: none; padding: 0; }
.owners li { margin-bottom: 0.8rem; }
.owners label { display: flex; gap: 0.6rem; align-items: baseline; }
.owners .off { color: var(--quiet); }
.owners small { display: block; margin-left: 1.7rem; }
.dates { display: flex; gap: 1.5rem; flex-wrap: wrap; }
input[type='date'] {
  font-family: var(--font-body); font-size: 1rem; font-weight: 700;
  padding: 0.5rem; border: 2px solid var(--border); background: #fff6ee; color: var(--ink);
}
.hint { color: var(--ink); }
</style>
