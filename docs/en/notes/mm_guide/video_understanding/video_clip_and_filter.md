---
title: Video Clip and Filter Pipeline
createTime: 2025/07/16 15:30:00
permalink: /en/mm_guide/video_clip_and_filter_pipeline/
icon: carbon:video-filled
---

# Video Clip and Filter Pipeline

## 1. Overview

The **Video Clip and Filter Pipeline** provides a complete video processing solution that intelligently segments videos through scene detection and filters high-quality clips based on multi-dimensional quality assessment (aesthetic, luminance, OCR, etc.), suitable for video data cleaning, high-quality clip extraction, and video dataset construction.

We support the following use cases:

- Automatic segmentation of long videos into scene clips
- Multi-dimensional video quality assessment and filtering
- High-quality video dataset construction
- Video content cleaning and curation

The main stages of the pipeline include:

1. **Video Info Extraction**: Extract basic video information (resolution, FPS, duration, etc.).
2. **Scene Detection**: Intelligently segment videos based on scene changes.
3. **Clip Metadata Generation and Basic Filtering**: Generate metadata for each scene clip and perform basic filtering (frames, FPS, resolution).
4. **Frame Extraction**: Extract representative frames from each clip.
5. **Aesthetic Scoring and Filtering**: Evaluate the aesthetic quality of video clips and filter low-score clips.
6. **Luminance Evaluation and Filtering**: Analyze the brightness distribution and filter clips with abnormal brightness.
7. **OCR Analysis and Filtering**: Detect text content and filter clips with excessive text.
8. **Video Cutting and Saving**: Save high-quality video clips.

---

## 2. Quick Start

### Step 1: Create a new DataFlow workspace
```bash
mkdir run_dataflow_mm
cd run_dataflow_mm
```

### Step 2: Initialize DataFlow-MM
```bash
dataflowmm init
```
You will see:
```bash
run_dataflow_mm/gpu_pipelines/video_clip_and_filter_pipeline.py  
```

### Step 3: Configure model paths

In `video_clip_and_filter_pipeline.py`, configure the required model paths. After opening the file, you need to modify the following paths:

```python
# Configure aesthetic scoring model in VideoAestheticFilter
clip_model="/path/to/ViT-L-14.pt",  # Download from https://openaipublic.azureedge.net/clip/models/.../ViT-L-14.pt
mlp_checkpoint="/path/to/sac+logos+ava1-l14-linearMSE.pth",  # Download from https://github.com/christophschuhmann/improved-aesthetic-predictor

# Configure OCR model in VideoOCRFilter
det_model_dir="/path/to/PP-OCRv5_server_det",  # PaddleOCR detection model
rec_model_dir="/path/to/PP-OCRv5_server_rec",  # PaddleOCR recognition model
```

You can also adjust filtering parameters for each operator as needed, such as aesthetic threshold `aes_min`, luminance range `lum_min/lum_max`, OCR ratio `ocr_max`, etc.

### Step 4: One-click run
```bash
python gpu_pipelines/video_clip_and_filter_pipeline.py
```

You can adjust filter parameters based on your needs. Below we introduce each step in the pipeline and parameter configuration in detail.

---

## 3. Data Flow and Pipeline Logic

### 1. **Input Data**

The pipeline input includes the following fields:

* **video**: Video file path

Inputs can be stored in designated files (such as `json` or `jsonl`) and managed and read via the `FileStorage` object:

```python
storage = FileStorage(
    first_entry_file_name="./dataflow/example/video_split/sample_data.json",
    cache_path="./cache",
    file_name_prefix="video_filter",
    cache_type="json",
)
```

**Input Data Example**:

```json
[
    {"video": "./videos/long_video1.mp4"},
    {"video": "./videos/long_video2.mp4"}
]
```

### 2. **Video Processing Pipeline (VideoFilteredClipGenerator)**

The core of the pipeline is the **VideoFilteredClipGenerator** operator, which integrates 9 processing steps.

#### Step 1: Video Info Extraction (VideoInfoFilter)

**Functionality:**
* Extract basic video information (resolution, FPS, total frames, duration, etc.)

**Input:** Video file path  
**Output:** Video info metadata

```python
self.video_info_filter = VideoInfoFilter(
    backend="opencv",  # Video processing backend (opencv, torchvision, av)
    ext=False,         # Whether to filter non-existent files
)
```

#### Step 2: Scene Detection (VideoSceneFilter)

**Functionality:**
* Automatically segment videos based on scene change detection
* Configurable minimum/maximum scene duration

**Input:** Video file path and video info  
**Output:** Scene segmentation info

```python
self.video_scene_filter = VideoSceneFilter(
    frame_skip=0,              # Number of frames to skip
    start_remove_sec=0.0,      # Seconds to remove from scene start
    end_remove_sec=0.0,        # Seconds to remove from scene end
    min_seconds=2.0,           # Minimum scene duration
    max_seconds=15.0,          # Maximum scene duration
    disable_parallel=True,     # Disable parallel processing
)
```

#### Step 3: Clip Metadata Generation and Basic Filtering (VideoClipFilter)

**Functionality:**
* Generate detailed metadata for each scene clip
* Filter clips based on basic properties (frames, FPS, resolution)

**Input:** Video info and scene info  
**Output:** Clip metadata

```python
self.video_clip_filter = VideoClipFilter(
    frames_min=None,           # Minimum frames
    frames_max=None,           # Maximum frames
    fps_min=None,              # Minimum FPS
    fps_max=None,              # Maximum FPS
    resolution_max=None,       # Maximum resolution
)
```

#### Step 4: Frame Extraction (VideoFrameFilter)

**Functionality:**
* Extract key frames from each video clip for subsequent analysis

**Input:** Video clip metadata  
**Output:** Extracted frame images

```python
self.video_frame_filter = VideoFrameFilter(
    output_dir="./cache/extract_frames",  # Frame image save directory
)
```

#### Step 5: Aesthetic Scoring and Filtering (VideoAestheticFilter)

**Functionality:**
* Evaluate the aesthetic quality of video clips using CLIP + MLP model
* Automatically filter clips below the threshold
* Score range typically 0-10

**Input:** Extracted frame images  
**Output:** Aesthetic scores and filtered clips

```python
self.video_aesthetic_filter = VideoAestheticFilter(
    figure_root="./cache/extract_frames",
    clip_model="/path/to/ViT-L-14.pt",
    mlp_checkpoint="/path/to/sac+logos+ava1-l14-linearMSE.pth",
    aes_min=4,  # Minimum aesthetic score threshold
)
```

#### Step 6: Luminance Evaluation and Filtering (VideoLuminanceFilter)

**Functionality:**
* Calculate average luminance of video clips
* Automatically filter videos that are too dark or too bright

**Input:** Extracted frame images  
**Output:** Luminance statistics and filtered clips

```python
self.video_luminance_filter = VideoLuminanceFilter(
    figure_root="./cache/extract_frames",
    lum_min=20,   # Minimum luminance threshold
    lum_max=140,  # Maximum luminance threshold
)
```

#### Step 7: OCR Analysis and Filtering (VideoOCRFilter)

**Functionality:**
* Detect text content ratio in videos
* Automatically filter videos with excessive text (e.g., subtitles, UI)

**Input:** Extracted frame images  
**Output:** OCR score (text ratio) and filtered clips

```python
self.video_ocr_filter = VideoOCRFilter(
    figure_root="./cache/extract_frames",
    det_model_dir="/path/to/PP-OCRv5_server_det",  # OCR detection model
    rec_model_dir="/path/to/PP-OCRv5_server_rec",  # OCR recognition model
    ocr_min=None,   # Minimum OCR ratio (optional)
    ocr_max=0.3,    # Maximum OCR ratio threshold
)
```

#### Step 8: Video Cutting and Saving (VideoClipGenerator)

**Functionality:**
* Cut and save videos based on filtered clip information

**Input:** Filtered clip information  
**Output:** Cut video file paths

```python
self.video_clip_generator = VideoClipGenerator(
    video_save_dir="./cache/video_clips",  # Video save directory
)
```

### 3. **Output Data**

The final output includes:

* **video**: List of cut video clip paths
* **video_info**: Basic video information
* **video_scene**: Scene detection results
* **video_clip**: Clip metadata (including all scores)
* **video_frame_export**: Extracted frame image paths

**Output Data Example**:

```json
{
    "video": ["./cache/video_clips/clip_001.mp4", "./cache/video_clips/clip_002.mp4"],
    "video_info": {
        "fps": 30,
        "resolution": [1920, 1080],
        "duration": 120.5,
        "frames": 3615
    },
    "video_clip": [
        {
            "start_frame": 0,
            "end_frame": 90,
            "aes_score": 5.6,
            "lum_mean": 85.3,
            "ocr_score": 0.1,
            "motion_score": 4.2
        },
        {
            "start_frame": 120,
            "end_frame": 240,
            "aes_score": 6.2,
            "lum_mean": 92.1,
            "ocr_score": 0.05,
            "motion_score": 5.8
        }
    ]
}
```

---

## 4. Pipeline Example

An example pipeline demonstrating how to use VideoFilteredClipGenerator for video clipping and filtering:

```python
from dataflow.operators.core_vision import VideoInfoFilter
from dataflow.operators.core_vision import VideoSceneFilter
from dataflow.operators.core_vision import VideoClipFilter
from dataflow.operators.core_vision import VideoFrameFilter
from dataflow.operators.core_vision import VideoAestheticFilter
from dataflow.operators.core_vision import VideoLuminanceFilter
from dataflow.operators.core_vision import VideoOCRFilter
from dataflow.operators.core_vision import VideoClipGenerator
from dataflow.core.Operator import OperatorABC
from dataflow.utils.storage import FileStorage

class VideoFilteredClipGenerator(OperatorABC):
    """
    Complete video processing pipeline operator that integrates all filtering and generation steps.
    """
    
    def __init__(self):
        """
        Initialize the VideoFilteredClipGenerator operator with default parameters.
        """
        # Initialize all sub-operators
        self.video_info_filter = VideoInfoFilter(
            backend="opencv",
            ext=False,
        )
        self.video_scene_filter = VideoSceneFilter(
            frame_skip=0,
            start_remove_sec=0.0,
            end_remove_sec=0.0,
            min_seconds=2.0,
            max_seconds=15.0,
            disable_parallel=True,
        )
        self.video_clip_filter = VideoClipFilter(
            frames_min=None,
            frames_max=None,
            fps_min=None,
            fps_max=None,
            resolution_max=None,
        )
        self.video_frame_filter = VideoFrameFilter(
            output_dir="./cache/extract_frames",
        )
        self.video_aesthetic_filter = VideoAestheticFilter(
            figure_root="./cache/extract_frames",
            clip_model="/path/to/ViT-L-14.pt",
            mlp_checkpoint="/path/to/sac+logos+ava1-l14-linearMSE.pth",
            aes_min=4,
        )
        self.video_luminance_filter = VideoLuminanceFilter(
            figure_root="./cache/extract_frames",
            lum_min=20,
            lum_max=140,
        )
        self.video_ocr_filter = VideoOCRFilter(
            figure_root="./cache/extract_frames",
            det_model_dir="/path/to/PP-OCRv5_server_det",
            rec_model_dir="/path/to/PP-OCRv5_server_rec",
            ocr_min=None,
            ocr_max=0.3,
        )
        self.video_clip_generator = VideoClipGenerator(
            video_save_dir="./cache/video_clips",
        )
    
    def run(
        self,
        storage,
        input_video_key="video",
        output_key="video",
    ):
        """
        Execute the complete video processing pipeline.
        
        Args:
            storage: DataFlow storage object
            input_video_key: Input video path field name (default: 'video')
            output_key: Output video path field name (default: 'video')
            
        Returns:
            str: Output key name
        """
        
        # Step 1: Extract video info
        self.video_info_filter.run(
            storage=storage.step(),
            input_video_key=input_video_key,
            output_key="video_info",
        )
        
        # Step 2: Detect video scenes
        self.video_scene_filter.run(
            storage=storage.step(),
            input_video_key=input_video_key,
            video_info_key="video_info",
            output_key="video_scene",
        )
        
        # Step 3: Generate clip metadata and basic filtering
        self.video_clip_filter.run(
            storage=storage.step(),
            input_video_key=input_video_key,
            video_info_key="video_info",
            video_scene_key="video_scene",
            output_key="video_clip",
        )
        
        # Step 4: Extract key frames
        self.video_frame_filter.run(
            storage=storage.step(),
            input_video_key=input_video_key,
            video_info_key="video_info",
            video_clips_key="video_clip",
            output_key="video_frame_export",
        )
        
        # Step 5: Aesthetic scoring and filtering
        self.video_aesthetic_filter.run(
            storage=storage.step(),
            input_video_key=input_video_key,
            video_clips_key="video_clip",
            output_key="video_clip",
        )
        
        # Step 6: Luminance evaluation and filtering
        self.video_luminance_filter.run(
            storage=storage.step(),
            input_video_key=input_video_key,
            video_clips_key="video_clip",
            output_key="video_clip",
        )
        
        # Step 7: OCR analysis and filtering
        self.video_ocr_filter.run(
            storage=storage.step(),
            input_video_key=input_video_key,
            video_clips_key="video_clip",
            output_key="video_clip",
        )
        
        # Step 8: Cut and save videos
        self.video_clip_generator.run(
            storage=storage.step(),
            video_clips_key="video_clip",
            output_key=output_key,
        )
        
        return output_key

if __name__ == "__main__":
    # Test the operator
    storage = FileStorage(
        first_entry_file_name="./dataflow/example/video_split/sample_data.json",
        cache_path="./cache",
        file_name_prefix="video_filter",
        cache_type="json",
    )
    
    generator = VideoFilteredClipGenerator()
    
    generator.run(
        storage=storage,
        input_video_key="video",
        output_key="video",
    )
```