/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export const zhNavbar = defineNavbarConfig([
    // { text: '首页', link: '/zh/' },
    // { text: '博客', link: '/zh/blog/' },
    // { text: '标签', link: '/zh/blog/tags/' },
    // { text: '归档', link: '/zh/blog/archives/' },
    {
        text: '使用案例',
        // link: '/zh/guide/',
        icon: 'icon-park-outline:guide-board',
        items: [
            {
                text: '基本信息',
                items: [
                            {
                                text: '简介',
                                link: '/zh/notes/mm_guide/basicinfo/intro.md',
                                icon: 'mdi:tooltip-text-outline',
                                activeMatch: '^/guide/'
                            },
                            {
                                text: '框架设计',
                                link: '/zh/notes/mm_guide/basicinfo/framework.md',
                                icon: 'material-symbols:auto-transmission-sharp',
                                activeMatch: '^/guide/'
                            },
                ]
            },
            {
                text: '快速开始',
                items: [
                    {
                        text: '安装',
                        link: '/zh/notes/mm_guide/quickstart/install.md',
                        icon: 'material-symbols-light:download-rounded',
                        activeMatch: '^/guide/'
                    },
                    {
                        text: '快速开始',
                        link: '/zh/notes/mm_guide/quickstart/quickstart.md',
                        icon: 'solar:flag-2-broken',
                        activeMatch: '^/guide/'
                    },
                    {
                        text: '图片生成示例',
                        link: '/zh/notes/mm_guide/quickstart/image_generation.md',
                        icon: 'solar:flag-2-broken',
                        activeMatch: '^/guide/'
                    },
                ]
            }
        ]
    },
    {
        text: '多模态算子文档',
        icon: "material-symbols:build-outline-sharp",
        // items: [
        //     { text: "PR规范", link: '/zh/notes/dev_guide/pull_request.md' },
        //     { text: "日志", link: '/zh/notes/dev_guide/logging.md' },
        //     { text: "测试用例", link: '/zh/notes/dev_guide/testcase.md' },
        // ]
        link: '/zh/notes/dev_guide/1.index_guide.md',
    },
    // {
    //     text: '笔记',
    //     items: [{ text: '示例', link: '/zh/notes/demo/README.md' }]
    // },
])

