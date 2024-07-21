import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";

import {GL, initializeGl, Texture, TextureRenderer, CanvasRenderer} from './renderCanvasWithShaders'


export interface ShaderProps {
  custom?: {[key: string]: any}
}

const canvasId = "#c";
const TEXTURE_ID_A = 0;
const TEXTURE_ID_B = 1;

export const Shader = ({custom}: ShaderProps) => {
  const [run, setRun] = useState(false);
  const requestAnimationFrameRef = useRef<number>()
  const prevTimeRef = useRef(0)
  const renderingContextRef = useRef<RenderingContext>()
  const fpsRef = useRef(0)
  const pausePlayButtonRef = useRef("play")

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
    render(renderingContextRef.current)
    requestAnimationFrameRef.current = requestAnimationFrame(animate);
  }, [])

  useEffect(() => {
    // Render GL based on the context set once.
    if (run) {
      requestAnimationFrameRef.current = requestAnimationFrame(animate);
    } else {
      render(renderingContextRef.current)
    }
    return () => {
      if (requestAnimationFrameRef.current === undefined) {
        return
      }
      cancelAnimationFrame(requestAnimationFrameRef.current)
    };
  }, [animate, run, custom]);

  useEffect(() => {
    console.log("run? ", run)
    if (!run) {
      return
    }

    console.log("set interval")
    const interval = setInterval(() => {
      pausePlayButtonRef.current = `stop | ${Math.round(fpsRef.current)} fps`
      console.log(pausePlayButtonRef.current)
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [run])

  const handleClickPlay = () => {
    if (run) {
      // Now stop.
      pausePlayButtonRef.current = "play"
      setRun(false)
    } else {
      // Now run.
      pausePlayButtonRef.current = "stop"
      setRun(true)
    }
  }
  return (
    <>
      <canvas id="c"></canvas>
      <div onClick={handleClickPlay}>{pausePlayButtonRef.current}</div>
    </>)
};

interface RenderingContext  {
  gl: GL
  textureA: Texture
  textureB: Texture
  textureRenderer: TextureRenderer
  canvasRenderer: CanvasRenderer
}

const initializeRenderingContext = (): RenderingContext => {
  const gl = initializeGl(canvasId);
  const textureA = new Texture({
    gl,
    texture_id: TEXTURE_ID_A,
    height: 2,
    width: 2,
    type: "float",
  });
  textureA.setValues([0.5, 0.5, 0.5, 0]);

  const textureB = new Texture({
    gl,
    texture_id: TEXTURE_ID_B,
    height: 2,
    width: 2,
    type: "float",
  });
  textureB.setValues([0, 0.5, 0.5, 0.5]);

  var textureRenderer = new TextureRenderer(gl);
  var canvasRenderer = new CanvasRenderer(gl);
  return {
    textureA, textureB, gl, textureRenderer, canvasRenderer
  }
}

const render = (c?: RenderingContext) => {
  if (c === undefined) {
    return
  }
  const {textureA, textureB, textureRenderer, canvasRenderer} = c;
  textureRenderer.renderToTexture({ input: textureA, output: textureB });
  canvasRenderer.render(textureA, textureB);
}
