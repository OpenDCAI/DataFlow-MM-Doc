import type { ThemeNoteListOptions } from 'vuepress-theme-plume'
import { defineNotesConfig } from 'vuepress-theme-plume'
import { Guide } from './guide'
import { DevGuide } from './dev_guide'
import { APIGuide } from './api'
import { MMGuide } from './mm_guide'

export const enNotes: ThemeNoteListOptions = defineNotesConfig({
    dir: 'en/notes',
    link: '/en/',
    notes: [
        Guide,
        DevGuide,
        APIGuide,
        MMGuide,
    ],
})
