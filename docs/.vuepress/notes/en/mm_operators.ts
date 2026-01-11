import type { ThemeNote } from 'vuepress-theme-plume'
import { defineNoteConfig } from 'vuepress-theme-plume'

export const MMOperators: ThemeNote = defineNoteConfig({
    dir: 'mm_operators',
    link: '/mm_operators/',
    sidebar: [
        {
            text: 'Basic Info',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'basicinfo',
            items: [
                'intro',
                'framework',
            ],
        },
        {
            text: 'Dataflow Image',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'image_understanding',
            items: [
                {
                    text: 'install',
                    collapsed: false,
                    prefix: '',
                    items: ['install_image_understanding'],
                },
                {
                    text: "generate",
                    collapsed: false,
                    prefix: 'generate/',
                    items: [
                        'image_caption',
                        'image_qa',
                        'image_pers_qa',
                        'multimodal_math',
                        // 'vision_mct_reasoning',
                        // 'image_region_caption',
                        // 'image_scale_caption',
                        // 'image_gcot',
                        // 'image_caprl',
                        // 'multirole_videoqa',
                    ]
                },
                {
                    text: "eval",
                    collapsed: false,
                    prefix: 'eval/',
                    items: [
                        'image_clip_evaluator',
                        'image_longclip_evaluator',
                        'image_vqa_evaluator',
                    ]
                },
                {
                    text: "filter",
                    collapsed: false,
                    prefix: 'filter/',
                    items: [
                        'image_aesthetic_filter',
                        'image_cat_filter',
                        'image_clip_filter',
                        'image_complexity_filter',
                        'image_consistency_filter',
                        'image_deduplication_filter',
                        'image_diversity_filter',
                        'image_sensitive_filter',
                    ]
                },
                {
                    text: "refine",
                    collapsed: false,
                    prefix: 'refine/',
                    items: [
                        'wiki_qa_refiner',
                    ]
                }
            ],
        },
        {
            text: 'Dataflow Video',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'video_understanding',
            items: [
                'install_video_understanding',
                'video_caption',
            ],
        },
        {
            text: 'Dataflow Audio',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'audio_understanding',
            // items: [
            //     'install_audio_understanding',
            //     'audio_caption',
            //     'whisper_asr',
            // ],
            items: [
                {
                    text: '安装',
                    collapsed: false,
                    prefix: '',
                    items: ['install_audio_understanding'],
                },
                {
                    text: "generate",
                    collapsed: false,
                    prefix: 'generate/',
                    items: [
                        'audio_caption',
                        'silero_vad',
                    ]
                },
                {
                    text: "eval",
                    collapsed: false,
                    prefix: 'eval/',
                    items: [
                        'ctc_forced_aligner_eval',
                    ]
                },
                {
                    text: "filter",
                    collapsed: false,
                    prefix: 'filter/',
                    items: [
                        'ctc_forced_aligner_filter',
                    ]
                },
                {
                    text: "generaterow",
                    collapsed: false,
                    prefix: 'generaterow/',
                    items: [
                        'merge_chunks',
                    ]
                }
            ],
        },
        {
            text: 'Dataflow Generation',
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
