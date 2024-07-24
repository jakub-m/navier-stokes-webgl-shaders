import React, { useMemo } from "react";
import { useEffect, useState, useRef, useCallback } from "react";

import {GL, initializeGl, Texture, CanvasRenderer} from './webGlUtil'
//import generateTextureVS from "./shaders/generateTexture.vertexShader.glsl";
//import generateTextureFS from "./shaders/generateTexture.fragmentShader.glsl";

import { CopyRenderer } from "./textureRenderers/copyRenderer";
import { DiffuseRenderer } from "./textureRenderers/diffuseRenderer";
import { AddRenderer } from "./textureRenderers/addRenderer";


const canvasId = "#c";
const TEXTURE_V_HOR_1 = 0;
const TEXTURE_V_HOR_2 = 1;
const TEXTURE_V_VER_1 = 2;
const TEXTURE_V_VER_2 = 3;
const TEXTURE_SOURCE = 4;
const TEXTURE_DENSITY_1 = 5;
const TEXTURE_DENSITY_2 = 6;
const TEXTURE_DENSITY_3 = 7;

export interface ShaderProps {
  setFps?: (fps: number) => void
}

export const Shader = ({setFps}: ShaderProps) => {
  const [run, setRun] = useState(true);
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
    // TODO do not reset deltaMs if the animation frame was not finished.
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
    renderingContextRef.current = render(renderingContextRef.current, 0.100)
  }

  const canvas = useMemo(() => {return (<canvas id="c" style={{width: "100%", height: "100%"}} />)}, [])
  return (
    <>
      <div style={{width: "256px", height: "256px"}}>
        {canvas}
      </div>
      <div onClick={handleClickPlay}>{pausePlayButton}</div>
      <div onClick={handleClickStep}>step</div>
    </>)
};

interface RenderingContext  {
  gl: GL
  /** Density source (S) */
  textureSource: Texture
  /** Horizontal velocity (h) */
  textureVHor1: Texture
  textureVHor2: Texture
  /** Vertical velocity (v) */
  textureVVer1: Texture
  textureVVer2: Texture
  /**
   * Density (p). We need three density buffers to implement diffuse operation. One is the initial density, and other
   * two are previous and next output densities, swapped each iteration.
   */
  textureDensity1: Texture
  textureDensity2: Texture
  textureDensity3: Texture

  copyRenderer: CopyRenderer
  diffuseRenderer: DiffuseRenderer
  canvasRenderer: CanvasRenderer
  addRenderer: AddRenderer
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
  const [width, height] = [32, 32]
  const gl = initializeGl(canvasId);
  const newTexture = (texture_id: number) => {
    return new Texture({ gl, texture_id, height, width, type: "float" });
  }
  
  const sourceMagnitude = 1
  const diffusionRate = 0.1
  const sourceValues = Array(width * height).fill(0)
  sourceValues[width * (Math.floor(height / 2)) + Math.floor(height / 2)] = sourceMagnitude // initialize single pixel in the middle

  const textureSource = newTexture(TEXTURE_SOURCE).setValues(sourceValues)
  const textureVHor1 = newTexture(TEXTURE_V_HOR_1).fill(0);
  const textureVHor2 = newTexture(TEXTURE_V_HOR_2).fill(0);
  const textureVVer1 = newTexture(TEXTURE_V_VER_1).fill(0);
  const textureVVer2 = newTexture(TEXTURE_V_VER_2).fill(0);
  const textureDensity1 = newTexture(TEXTURE_DENSITY_1).fill(0);
  const textureDensity2 = newTexture(TEXTURE_DENSITY_2).fill(0);
  const textureDensity3 = newTexture(TEXTURE_DENSITY_3).fill(0);

  const copyRenderer = new CopyRenderer(gl);
  const diffuseRenderer = new DiffuseRenderer({gl, diffusionRate});

  const canvasRenderer = new CanvasRenderer(gl);
  const addRenderer = new AddRenderer(gl);

  return {
    gl, copyRenderer, canvasRenderer, swapTextures: false, sync: null, 
    addRenderer,
    diffuseRenderer,
    textureSource,
    textureVHor1,
    textureVHor2,
    textureVVer1,
    textureVVer2,
    textureDensity1,
    textureDensity2,
    textureDensity3,
  }
}

const render = (c?: RenderingContext, deltaMs: number): RenderingContext | undefined => {
  if (c === undefined) {
    return c;
  }

  const {
    gl,
    sync,
    textureSource,
    textureVHor1,
    textureVHor2,
    textureVVer1,
    textureVVer2,
    textureDensity1,
    textureDensity2,
    textureDensity3,
    copyRenderer,
    diffuseRenderer,
    canvasRenderer,
    addRenderer,
    swapTextures,
  } = c

  if (sync === null) {
    // console.log("sync is null")
  } else {
    const syncStatus = gl.getSyncParameter(sync, gl.SYNC_STATUS)
    if (syncStatus === gl.SIGNALED) {
      // console.log("finished")
      gl.deleteSync(c.sync)
    } else {
      // TODO do not reset interval (ms) to zero when the frame is not finished, rather accumulate
      // the interval.
      console.log("Frame not finished yet")
      return c;
   }
  }

  //const [
  //  textureDensityIn,
  //  textureDensityOut,
  //] = !swapTextures ? [
  //    textureDensity1,
  //    textureDensity2,
  //  ] : [
  //    textureDensity2,
  //    textureDensity1,
  //  ]


  // Here run add_source from the Paper. textureDensity3 is the output from the previous iteration,
  // and it's copied (with source added) to textureDensity1.
  addRenderer.render(textureSource, textureDensity3, textureDensity1)

  // Here we need to juggle the density textures. Between the frames there is only a single density
  // texture. During the rendering, we need to copy the textures when the shaders modify the textures.
  // 1.
  //   a. Initial density x0 before diffuse. This needs to be a readonly copy. of density.
  //   b. Copy of initial density to t0.
  //   c. Combine initial density and copy to t1.
  // 2. Swap t0 and t1.
  // 3. Combine initial density and t1 to t0.
  // 4. Repeat N times.
  diffuseRenderer.render(textureDensity1, textureDensity2, textureDensity3, deltaMs/1000)
  // Preserve the output for the next render cycle.
  // copyRenderer.renderToTexture(textureDensity3, textureDensity1)
  canvasRenderer.render(textureDensity3);

  const newSync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  //if (sync === null) {
  //  console.log("new sync is null")
  //}
  return {...c, sync: newSync, swapTextures: !swapTextures};
}
