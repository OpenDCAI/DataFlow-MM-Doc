import type { ThemeNoteListOptions } from 'vuepress-theme-plume'
import { defineNotesConfig } from 'vuepress-theme-plume'
// import { plugins } from './plugins'
// import { themeConfig } from './theme-config'
import { APIGuide } from './api'
import { MMGuide } from './mm_guide'
// import { tools } from './tools'

export const zhNotes: ThemeNoteListOptions = defineNotesConfig({
    dir: 'zh/notes',
    link: '/zh/',
    notes: [
        APIGuide,
        MMGuide,
        // themeConfig,
        // plugins,
        // tools,
    ],
})
