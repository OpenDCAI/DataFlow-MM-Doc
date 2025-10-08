import type { ThemeNoteListOptions } from 'vuepress-theme-plume'
import { defineNotesConfig } from 'vuepress-theme-plume'
import { APIGuide } from './api'
import { MMGuide } from './mm_guide'
import { MMOperators } from './mm_operators'

export const enNotes: ThemeNoteListOptions = defineNotesConfig({
    dir: 'en/notes',
    link: '/en/',
    notes: [
        APIGuide,
        MMGuide,
        MMOperators,
    ],
})
