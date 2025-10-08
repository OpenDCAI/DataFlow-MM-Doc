/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export const enNavbar = defineNavbarConfig([
    // { text: 'Home', link: '/' },
    // { text: 'Blog', link: '/blog/' },
    // { text: 'Tags', link: '/blog/tags/' },
    // { text: 'Archives', link: '/blog/archives/' },
    {
        text: 'Use Cases',
        // link: '/en/guide/',
        icon: 'icon-park-outline:guide-board',
        items: [

            {
                text: 'Basic Info',
                items: [
                    {
                        text: 'Introduction',
                        link: '/en/notes/mm_guide/basicinfo/intro.md',
                        icon: 'mdi:tooltip-text-outline',
                        activeMatch: '^/guide/'
                    },
                    {
                        text: 'Framework Design',
                        link: '/en/notes/mm_guide/basicinfo/framework.md',
                        icon: 'material-symbols:auto-transmission-sharp',
                        activeMatch: '^/guide/'
                    },
                ]
            },
            {
                text: 'Start with Dataflow',
                items: [
                    {
                        text: 'Installation',
                        link: '/en/notes/mm_guide/quickstart/install.md',
                        icon: 'material-symbols-light:download-rounded',
                        activeMatch: '^/guide/'
                    },
                    {
                        text: 'Quick Start',
                        link: '/en/notes/mm_guide/quickstart/quickstart.md',
                        icon: 'solar:flag-2-broken',
                        activeMatch: '^/guide/'
                    },
                    {
                        text: 'Image Generation',
                        link: '/en/notes/mm_guide/quickstart/image_generation.md',
                        icon: 'solar:flag-2-broken',
                        activeMatch: '^/guide/'
                    },
                ]
            }
        ]
    },
    // {
    //     text: 'API Reference',
    //     link: '/en/notes/api/1.home.md',
    //     icon: 'material-symbols:article-outline'
    // },
    {
        text: 'Developer Guide',
        icon: "material-symbols:build-outline-sharp",
        link: '/en/notes/dev_guide/1.index_guide.md',
    },
])
