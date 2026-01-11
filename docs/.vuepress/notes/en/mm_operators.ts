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
                'install_image_understanding',
                'generate/image_caption',
                'generate/image_qa',
                'generate/image_pers_qa',
                'generate/multimodal_math',
                'generate/vision_mct_reasoning',
                'generate/image_region_caption',
                'generate/image_scale_caption',
                'generate/image_gcot',
                'generate/image_caprl',
                'generate/multirole_videoqa',
                'eval/image_clip_evaluator',
                'eval/image_longclip_evaluator',
                'eval/image_vqa_evaluator',
                'filter/image_aesthetic_filter',
                'filter/image_cat_filter',
                'filter/image_clip_filter',
                'filter/image_complexity_filter',
                'filter/image_consistency_filter',
                'filter/image_deduplication_filter',
                'filter/image_diversity_filter',
                'filter/image_sensitive_filter',
                'refine/wiki_qa_refiner'
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
            items: [
                'install_audio_understanding',
                'audio_caption',
                'whisper_asr',
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
