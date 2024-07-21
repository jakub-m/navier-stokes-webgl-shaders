import React, { MutableRefObject, useMemo } from "react";
import { useEffect, useState, useRef, useCallback } from "react";

import {GL, initializeGl, Texture, TextureRenderer, CanvasRenderer} from './webGlUtil'


const canvasId = "#c";
const TEXTURE_ID_A = 0;
const TEXTURE_ID_B = 1;


export interface ShaderProps {
  setFps?: (fps: number) => void
}


export const Shader = ({setFps}: ShaderProps) => {
  const [run, setRun] = useState(false);
  const requestAnimationFrameRef = useRef<number>()
  const prevTimeRef = useRef(0)
  const renderingContextRef = useRef<RenderingContext>()
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
    if (setFps) {
      setFps(1000/deltaMs)
    }
    renderingContextRef.current = render(renderingContextRef.current, deltaMs)
    requestAnimationFrameRef.current = requestAnimationFrame(animate);
  }, [setFps])

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
    renderingContextRef.current = render(renderingContextRef.current, 0)
  }

  const canvas = useMemo(() => {return (<canvas id="c"></canvas>)}, [])
  return (
    <>
      {canvas}
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
   * sync is used to check if the rendering finished. If not, it means that we should not render the
   * next animation frame.
   * See https://computergraphics.stackexchange.com/questions/4964/how-to-know-when-rendering-is-complete-in-webgl
   */
  sync: WebGLSync | null
  /**
   * Tell if texture A and B should be swapped when generating textures. This value should be
   * flipped every animation frame, so A is generated to B and then B is generated to A
   * (so called ping-pong rendering).
   */
  swapTextures: boolean
}

const initializeRenderingContext = (): RenderingContext => {
  const [width, height] = [256, 256]
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
    textureA, textureB, gl, textureRenderer, canvasRenderer, swapTextures: false, sync: null
  }
}

const render = (c?: RenderingContext, deltaMs: number): RenderingContext | undefined => {
  if (c === undefined) {
    return c;
  }
  const gl = c.gl;
  if (c.sync === null) {
    console.log("sync is null")
  } else {
   const syncStatus = gl.getSyncParameter(c.sync, gl.SYNC_STATUS)
   if (syncStatus === gl.SIGNALED) {
      console.log("finished")
      gl.deleteSync(c.sync)
   } else {
      console.log("not finished yet")
      return c;
   }
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

  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  if (sync === null) {
    console.log("new sync is null")
  }
  return {...c, sync, swapTextures: !swapTextures};
}
