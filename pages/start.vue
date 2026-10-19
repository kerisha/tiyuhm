<script setup lang="ts">
interface Profile {
  username: string
  name: string | null
  email: string | null
  location: string | null
  blog: string | null
  profileUrl: string
}

const username = ref('')
const step = ref<'form' | 'loading' | 'profile' | 'error'>('form')
const profile = ref<Profile | null>(null)
const errorMessage = ref('')

async function lookUp() {
  const name = username.value.trim()
  if (!name) return
  step.value = 'loading'
  try {
    profile.value = await $fetch<Profile>('/api/github/profile', {
      method: 'POST',
      body: { username: name },
    })
    step.value = 'profile'
  } catch (e: any) {
    errorMessage.value = e?.data?.statusMessage || e?.statusMessage || 'Something went wrong reaching GitHub.'
    step.value = 'error'
  }
}
</script>

<template>
  <ResumeSheet>
    <p class="kicker">Step one</p>
    <h1>Who are you?</h1>

    <form v-if="step === 'form'" @submit.prevent="lookUp">
      <label for="username">Your GitHub username</label>
      <input id="username" v-model="username" type="text" autocomplete="off" autofocus />
      <p><button class="button" :disabled="!username.trim()">Find me</button></p>
    </form>

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
      <p>That's you. Choosing owners and dates comes next.</p>
    </section>
  </ResumeSheet>
</template>
