import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";

import {GL, initializeGl, Texture, TextureRenderer, CanvasRenderer} from './webGlUtil'


const canvasId = "#c";
const TEXTURE_ID_A = 0;
const TEXTURE_ID_B = 1;

export const Shader = () => {
  const [run, setRun] = useState(false);
  const requestAnimationFrameRef = useRef<number>()
  const prevTimeRef = useRef(0)
  const renderingContextRef = useRef<RenderingContext>()
  const fpsRef = useRef(0)
  const [pausePlayButton, setPausePlayButton] = useState("play")

  useEffect(() => {
    // Initialize GL context once.
    const c = initializeRenderingContext();
    renderingContextRef.current = c
  });

  const animate = useCallback((timeMs: number) => {
    var deltaMs = 0;
    if (prevTimeRef.current !== 0) {
      deltaMs = timeMs - prevTimeRef.current
    }
    prevTimeRef.current = timeMs
    fpsRef.current = 1000/deltaMs
    renderingContextRef.current = render(renderingContextRef.current, deltaMs)
    requestAnimationFrameRef.current = requestAnimationFrame(animate);
  }, [])

  useEffect(() => {
    // Render GL based on the context set once.
    if (run) {
      requestAnimationFrameRef.current = requestAnimationFrame(animate);
    } else {
      renderingContextRef.current = render(renderingContextRef.current, 0)
    }
    return () => {
      if (requestAnimationFrameRef.current === undefined) {
        return
      }
      cancelAnimationFrame(requestAnimationFrameRef.current)
    };
  }, [animate, run]);

  useEffect(() => {
    if (!run) {
      return
    }

    const interval = setInterval(() => {
      setPausePlayButton(`stop | ${Math.round(fpsRef.current)} fps`)
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [run])

  const handleClickPlay = () => {
    if (run) {
      // Now stop.
      setPausePlayButton("play")
      setRun(false)
    } else {
      // Now run.
      setPausePlayButton("stop")
      setRun(true)
    }
  }

  const handleClickStep = () => {
    console.log("step");
    renderingContextRef.current = render(renderingContextRef.current, 0)
    console.log(renderingContextRef.current);
  }
  return (
    <>
      <canvas id="c"></canvas>
      <div onClick={handleClickPlay}>{pausePlayButton}</div>
      <div onClick={handleClickStep}>step</div>
    </>)
};

interface RenderingContext  {
  gl: GL
  textureA: Texture
  textureB: Texture
  textureRenderer: TextureRenderer
  canvasRenderer: CanvasRenderer
  /**
   * Tell if texture A and B should be swapped when generating textures. This value should be
   * flipped every animation frame, so A is generated to B and then B is generated to A
   * (so called ping-pong rendering).
   */
  swapTextures: boolean
}

const initializeRenderingContext = (): RenderingContext => {
  const [width, height] = [32, 32]
  const gl = initializeGl(canvasId);
  const textureA = new Texture({
    gl,
    texture_id: TEXTURE_ID_A,
    height,
    width,
    type: "float",
  });
  const textureAValues = Array(width * height).fill(0);
  textureAValues[0] = 1 // TODO why those coordinates are off?
  textureA.setValues(textureAValues);

  const textureB = new Texture({
    gl,
    texture_id: TEXTURE_ID_B,
    height,
    width,
    type: "float",
  });
  textureB.setValues(Array(width * height).fill(0));

  var textureRenderer = new TextureRenderer(gl);
  var canvasRenderer = new CanvasRenderer(gl);
  return {
    textureA, textureB, gl, textureRenderer, canvasRenderer, swapTextures: false,
  }
}

const render = (c?: RenderingContext, deltaMs: number): RenderingContext | undefined => {
  if (c === undefined) {
    return c;
  }
  const {textureA, textureB, textureRenderer, canvasRenderer, swapTextures} = c;
  if (swapTextures) {
    textureRenderer.renderToTexture({ input: textureB, output: textureA });
    canvasRenderer.render(textureB);
  } else {
    textureRenderer.renderToTexture({ input: textureA, output: textureB });
    canvasRenderer.render(textureA);
}
  // canvasRenderer.render(textureA, textureB);
  return {...c, swapTextures: !swapTextures};
}
