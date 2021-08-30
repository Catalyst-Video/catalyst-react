import { useEffect, useRef, useState } from 'react';
import { BackgroundConfig, RenderingPipeline, SegmentationConfig, SourcePlayback } from '../features/bg_remove/interfaces';
import { buildWebGL2Pipeline } from '../features/bg_remove/webgl2/webgl2Pipeline';
import { TFLite } from './useTFLite';

function useRenderingPipeline(
  sourcePlayback: SourcePlayback,
  backgroundConfig: BackgroundConfig,
  segmentationConfig: SegmentationConfig,
  tflite: TFLite
) {
  const [pipeline, setPipeline] = useState<RenderingPipeline | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [fps, setFps] = useState(0);
  const [durations, setDurations] = useState<number[]>([]);

  useEffect(() => {
    // The useEffect cleanup function is not enough to stop
    // the rendering loop when the framerate is low
    let shouldRender = true;

    let previousTime = 0;
    let beginTime = 0;
    let eventCount = 0;
    let frameCount = 0;
    const frameDurations: number[] = [];

    let renderRequestId: number;

    const newPipeline = buildWebGL2Pipeline(
            sourcePlayback,
            backgroundImageRef.current,
            backgroundConfig,
            segmentationConfig,
            canvasRef.current,
            tflite,
            addFrameEvent
          )
       

    async function render() {
      if (!shouldRender) {
        return;
      }
      beginFrame();
      await newPipeline.render();
      endFrame();
      renderRequestId = requestAnimationFrame(render);
    }

    function beginFrame() {
      beginTime = Date.now();
    }

    function addFrameEvent() {
      const time = Date.now();
      frameDurations[eventCount] = time - beginTime;
      beginTime = time;
      eventCount++;
    }

    function endFrame() {
      const time = Date.now();
      frameDurations[eventCount] = time - beginTime;
      frameCount++;
      if (time >= previousTime + 1000) {
        setFps((frameCount * 1000) / (time - previousTime));
        setDurations(frameDurations);
        previousTime = time;
        frameCount = 0;
      }
      eventCount = 0;
    }

    render();
    console.log(
      'Animation started:',
      sourcePlayback,
      backgroundConfig,
      segmentationConfig
    );

    setPipeline(newPipeline);

    return () => {
      shouldRender = false;
      cancelAnimationFrame(renderRequestId);
      newPipeline.cleanUp();
      console.log(
        'Animation stopped:',
        sourcePlayback,
        backgroundConfig,
        segmentationConfig
      );

      setPipeline(null);
    };
  }, [sourcePlayback, backgroundConfig, segmentationConfig, tflite]);

  return {
    pipeline,
    backgroundImageRef,
    canvasRef,
    fps,
    durations,
  };
}

export default useRenderingPipeline;
