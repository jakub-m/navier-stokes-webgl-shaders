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

  useEffect(() => {
    // Initialize GL context once.
    const c = initializeRenderingContext();
    renderingContextRef.current = c
  });

  const animate = useCallback((time: number) => {
    // `time` is in ms
    var deltaMs = 0;
    if (prevTimeRef.current !== 0) {
      deltaMs = time - prevTimeRef.current
    }
    prevTimeRef.current = time
    console.log(1000/deltaMs + " fps");
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

 const pausePlayButton = (run) ? "stop" : "play";
 const handleClickPlay = () => {
  setRun(r => !r)
 }
 return (
  <>
    <canvas id="c"></canvas>
    <div onClick={handleClickPlay}>{pausePlayButton}</div>
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
