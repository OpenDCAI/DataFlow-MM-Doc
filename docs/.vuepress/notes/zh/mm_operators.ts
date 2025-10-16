import type { ThemeNote } from 'vuepress-theme-plume'
import { defineNoteConfig } from 'vuepress-theme-plume'

export const MMOperators: ThemeNote = defineNoteConfig({
    dir: 'mm_operators',
    link: '/mm_operators/',
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
                'generate/image_caption',
                'generate/image_qa',
                'generate/image_pers_qa',
                'generate/multimodal_math',
                'generate/vision_mct_reasoning',
                'generate/image_scale_caption',
                'eval/clip_image_text_evaluator',
                'eval/longclip_image_text_evaluator',
                'eval/vqa_score_image_text_evaluator',
                'filter/cat_filter',
                'filter/clip_filter',
                'filter/complexity_filter',
                'filter/deduplication_filter',
                'filter/image_aesthetic_filter',
                'filter/sensitive/filter',
                'filter/text_image_diversity_filter'
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
