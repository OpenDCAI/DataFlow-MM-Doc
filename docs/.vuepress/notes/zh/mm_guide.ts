import type { ThemeNote } from 'vuepress-theme-plume'
import { defineNoteConfig } from 'vuepress-theme-plume'

export const MMGuide: ThemeNote = defineNoteConfig({
    dir: 'mm_guide',
    link: '/mm_guide/',
    sidebar: [
        {
            text: '基础信息',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'basicinfo',
            items: [
                'intro',
                'framework',
                'install',
            ],
        },
        {
            text: 'Dataflow图像理解',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'image_understanding',
            items: [
                'install_image_understanding',
            ],
        },
        {
            text: 'Dataflow视频理解',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'video_understanding',
            items: [
                'install_video_understanding',
                'video_caption',
            ],
        },
        {
            text: 'Dataflow语音理解',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'audio_understanding',
            items: [
                'install_audio_understanding',
                'audio_caption',
                'whisper_asr',
            ],
        },
        {
            text: 'Dataflow图像/视频生成',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'image_video_generation',
            items: [
                'install_image_video_generation',
                'image_generation',
            ],
        },
    ]
})
