import type { ThemeNote } from 'vuepress-theme-plume'
import { defineNoteConfig } from 'vuepress-theme-plume'

export const DevGuide: ThemeNote = defineNoteConfig({
    dir: 'dev_guide',
    link: '/dev_guide/',
    sidebar: 'auto'
})
