export type BackgroundConfig = {
  type: 'none' | 'blur' | 'image';
  url?: string;
};

export const backgroundImageUrls = [
  'architecture-5082700_1280',
  'porch-691330_1280',
  'saxon-switzerland-539418_1280',
  'shibuyasky-4768679_1280',
].map(imageName => `${process.env.PUBLIC_URL}/backgrounds/${imageName}.jpg`);

export type BlendMode = 'screen' | 'linearDodge';

export type PostProcessingConfig = {
  smoothSegmentationMask: boolean;
  jointBilateralFilter: JointBilateralFilterConfig;
  coverage: [number, number];
  lightWrapping: number;
  blendMode: BlendMode;
};

export type JointBilateralFilterConfig = {
  sigmaSpace: number;
  sigmaColor: number;
};


export type RenderingPipeline = {
  render(): Promise<void>;
  updatePostProcessingConfig(
    newPostProcessingConfig: PostProcessingConfig
  ): void;
  // TODO Update background image only when loaded
  // updateBackgroundImage(backgroundImage: HTMLImageElement): void
  cleanUp(): void;
};

export type SegmentationModel = 'meet' | 'mlkit';
export type SegmentationBackend = 'webgl' | 'wasm' | 'wasmSimd';
export type InputResolution = '640x360' | '256x256' | '256x144' | '160x96';

export const inputResolutions: {
  [resolution in InputResolution]: [number, number];
} = {
  '640x360': [640, 360],
  '256x256': [256, 256],
  '256x144': [256, 144],
  '160x96': [160, 96],
};

export type PipelineName = 'canvas2dCpu' | 'webgl2';

export type SegmentationConfig = {
  model: SegmentationModel;
  backend: SegmentationBackend;
  inputResolution: InputResolution;
  pipeline: PipelineName;
};

export function getTFLiteModelFileName(
  model: SegmentationModel,
  inputResolution: InputResolution
) {
  switch (model) {
    case 'meet':
      return inputResolution === '256x144'
        ? 'segm_full_v679'
        : 'segm_lite_v681';

    case 'mlkit':
      return 'selfiesegmentation_mlkit-256x256-2021_01_19-v1215.f16';

    default:
      throw new Error(`No TFLite file for this segmentation model: ${model}`);
  }
}

export type SourceConfig = {
  type: 'image' | 'video' | 'camera';
  url?: string;
};

export type SourcePlayback = {
  htmlElement: HTMLVideoElement;
  width: number;
  height: number;
};

export const sourceImageUrls = [
  'girl-919048_1280',
  'doctor-5871743_640',
  'woman-5883428_1280',
].map(imageName => `${process.env.PUBLIC_URL}/images/${imageName}.jpg`);

export const sourceVideoUrls = [
  'Dance - 32938',
  'Doctor - 26732',
  'Thoughtful - 35590',
].map(videoName => `${process.env.PUBLIC_URL}/videos/${videoName}.mp4`);