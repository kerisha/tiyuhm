export interface ResumeBullet {
  text: string
  date: string
  shas: string[]
}

export interface ExperienceGroup {
  ownerLabel: string
  periodFrom: string
  periodTo: string
  bullets: ResumeBullet[]
}

export interface Resume {
  profile: {
    username: string
    name: string | null
    email: string | null
    location: string | null
    blog: string | null
    profileUrl: string
  }
  selection: { owners: string[]; from: string; to: string }
  summary: string
  experience: ExperienceGroup[]
  skills: string[]
  education: { school: string; degree: string; years: string; isDemo: true }[]
  lastChecked: string
}
