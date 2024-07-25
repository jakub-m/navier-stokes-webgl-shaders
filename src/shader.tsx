import React, { useMemo } from "react";
import { useEffect, useState, useRef, useCallback } from "react";

import {GL, initializeGl, Texture, CanvasRenderer} from './webGlUtil'

import { CopyRenderer } from "./textureRenderers/copyRenderer";
import { DiffuseRenderer } from "./textureRenderers/diffuseRenderer";
import { AddRenderer } from "./textureRenderers/addRenderer";
import { AdvectRenderer } from "./textureRenderers/advectRenderer";

const canvasId = "#c";
const TEXTURE_V_HOR_1 = 0;
const TEXTURE_V_HOR_2 = 1;
const TEXTURE_V_VER_1 = 2;
const TEXTURE_V_VER_2 = 3;
const TEXTURE_SOURCE = 4;
const TEXTURE_DENSITY_1 = 5;
const TEXTURE_DENSITY_2 = 6;
const TEXTURE_TEMP = 7;
const TEXTURE_V_HOR_S = 8;
const TEXTURE_V_VER_S = 9

export interface ShaderProps {
  setFps?: (fps: number) => void
}

export const Shader = ({setFps}: ShaderProps) => {
  const [run, setRun] = useState(true); // default run
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
    const rc = renderingContextRef.current
    if (rc !== undefined) {
      renderingContextRef.current = render(rc, deltaMs)
    }
    requestAnimationFrameRef.current = requestAnimationFrame(animate);
  }, [setFps])

  useEffect(() => {
    // Render GL based on the context once, and repeat in the loop.
    if (run) {
      requestAnimationFrameRef.current = requestAnimationFrame(animate);
    } else {
      const rc = renderingContextRef.current
      if (rc !== undefined) {
        renderingContextRef.current = render(rc, 0)
      }
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
    const rc = renderingContextRef.current
    if (rc !== undefined) {
      renderingContextRef.current = render(rc, 0.100)
    }
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
  textureDensitySource: Texture
  /** Static force field (u0, v0) */
  textureHorizontalVelocitySource: Texture
  textureVerticalVelocitySource: Texture
  /** Horizontal velocity (h) */
  textureHorizontalVelocity1: Texture
  textureHorizontalVelocity2: Texture
  /** Vertical velocity (v) */
  textureVerticalVelocity1: Texture
  textureVerticalVelocity2: Texture
  /**
   * Density (p). We need three density buffers to implement diffuse operation. One is the initial density, and other
   * two are previous and next output densities, swapped each iteration.
   */
  textureDensity1: Texture
  textureDensity2: Texture

  textureTemp: Texture

  copyRenderer: CopyRenderer
  diffuseRenderer: DiffuseRenderer
  canvasRenderer: CanvasRenderer
  addRenderer: AddRenderer
  advectRenderer: AdvectRenderer

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
  // swapTextures: boolean
}

const initializeRenderingContext = (): RenderingContext => {
  const [width, height] = [32, 32]
  const gl = initializeGl(canvasId);
  const newTexture = (texture_id: number) => {
    return new Texture({ gl, texture_id, height, width, type: "float" });
  }
  
  const sourceMagnitude = 10
  const densitySourceValues = Array(width * height).fill(0)
  densitySourceValues[width * (Math.floor(height / 2)) + Math.floor(height / 2)] = sourceMagnitude // initialize single pixel in the middle

  const textureDensitySource = newTexture(TEXTURE_SOURCE).setValues(densitySourceValues)

  const textureHorizontalVelocity1 = newTexture(TEXTURE_V_HOR_1).fill(1);
  const textureHorizontalVelocity2 = newTexture(TEXTURE_V_HOR_2).fill(1);
  const textureVerticalVelocity1 = newTexture(TEXTURE_V_VER_1).fill(1);
  const textureVerticalVelocity2 = newTexture(TEXTURE_V_VER_2).fill(1);
  const textureHorizontalVelocitySource = newTexture(TEXTURE_V_HOR_S).fill(-0.1);
  const textureVerticalVelocitySource = newTexture(TEXTURE_V_VER_S).fill(-0.1);
  const textureDensity1 = newTexture(TEXTURE_DENSITY_1).fill(0);
  const textureDensity2 = newTexture(TEXTURE_DENSITY_2).fill(0);
  const textureTemp = newTexture(TEXTURE_TEMP).fill(0);

  const copyRenderer = new CopyRenderer(gl);
  const diffuseRenderer = new DiffuseRenderer(gl);

  const canvasRenderer = new CanvasRenderer(gl);
  const addRenderer = new AddRenderer(gl);
  const advectRenderer = new AdvectRenderer(gl);

  return {
    gl, copyRenderer, canvasRenderer,
    // swapTextures: false,
    sync: null, 
    addRenderer,
    diffuseRenderer,
    advectRenderer,
    textureDensitySource,
    textureHorizontalVelocitySource,
    textureVerticalVelocitySource,
    textureHorizontalVelocity1,
    textureHorizontalVelocity2,
    textureVerticalVelocity1,
    textureVerticalVelocity2,
    textureDensity1,
    textureDensity2,
    textureTemp,
  }
}

const render = (c: RenderingContext, deltaMs: number): RenderingContext | undefined => {
  const deltaSec = deltaMs / 1000;

  const diffusionRate = 0.1

  const {
    gl,
    sync,
    textureDensitySource,
    textureHorizontalVelocitySource,
    textureHorizontalVelocity1,
    textureHorizontalVelocity2,
    textureVerticalVelocitySource,
    textureVerticalVelocity1,
    textureVerticalVelocity2,
    textureDensity1,
    textureDensity2,
    copyRenderer,
    diffuseRenderer,
    advectRenderer,
    canvasRenderer,
    addRenderer,
    textureTemp,
    // swapTextures,
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

  ////////////////
  // Density step.
  // The input and output to the step is textureDensity2, the other density textures are
  // intermediate buffers.

  // From p. 8 of the paper, the density step is as follows (in pseudo-C). I believe that
  // x0 in add_source should be "s".
  //
  // void dens_step ( int N, float * x, float * x0, float * u, float * v, float diff, float dt )
  // {
  //   add_source ( N=N, x=x, s=x0, dt );
  //   swap()
  //   diffuse ( N=N, b=0, x=x, x0=x0, diff, dt );
  //   swap()
  //   advect ( N=N, b=0, d=0, d0=x0, u, v, dt );
  // }

  // Here run add_source from the Paper. textureDensity2 is the output from the previous iteration,
  // and it's copied (with source added) to textureDensity1.
  addRenderer.render(textureDensitySource, textureDensity2, textureDensity1, deltaSec)

  // Here we need to juggle the density textures. Between the frames there is only a single density
  // texture. During the rendering, we need to copy the textures when the shaders modify the textures.
  // 1.
  //   a. Initial density x0 before diffuse. This needs to be a readonly copy. of density.
  //   b. Copy of initial density to t0.
  //   c. Combine initial density and copy to t1.
  // 2. Swap t0 and t1.
  // 3. Combine initial density and t1 to t0.
  // 4. Repeat N times.
  diffuseRenderer.render(textureDensity1, textureTemp, textureDensity2, deltaSec, diffusionRate)

  advectRenderer.render(textureDensity2, textureDensity1, textureHorizontalVelocity1, textureVerticalVelocity1, deltaSec);

  /////////////////
  // Velocity step.
  //
  // void vel_step ( int N, fl oat * u, float * v, float * u0, float * v0, float visc, float dt )
  // {
  //   add_source ( N, x=u, s=u0, dt );
  //   add_source ( N, x=v, s=v0, dt );
  //   SWAP ( u0, u );
  //   diffuse ( N, b=1, x=u, x0=u0, visc, dt );
  //   SWAP ( v0, v );
  //   diffuse ( N, b=2, x=v, x0=v0, visc, dt );
  //   project ( N, u=u, v=v, p=u0, div=v0 );
  //   SWAP ( u0, u );
  //   SWAP ( v0, v );
  //   advect ( N, b=1, d=u, d0=u0, u=u0, v=v0, dt );
  //   advect ( N, b=2, d=v, d0=v0, u=u0, v=v0, dt );
  //   project ( N, u=u, v=v, p=u0, div=v0 );
  // }

  // By convention, input and output is "2" texture of velocity.
  addRenderer.render(
    textureHorizontalVelocity2,
    textureHorizontalVelocitySource,
    textureHorizontalVelocity1,
    deltaSec)
  addRenderer.render(
    textureVerticalVelocity2,
    textureVerticalVelocitySource,
    textureVerticalVelocity1,
    deltaSec,
  )

  // vel 1 is the input now
  // diffuseRenderer.render()



  // Rendering to canvas.
  // By convention where the output density is in textureDensity2
  copyRenderer.render(textureDensity1, textureDensity2);
  // Preserve the output for the next render cycle.
  canvasRenderer.render(textureDensity2);

  const newSync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  //if (sync === null) {
  //  console.log("new sync is null")
  //}
  return {
    ...c,
    sync: newSync,
    // swapTextures: !swapTextures,
  };
}
