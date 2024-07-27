import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";

import {GL, initializeGl, Texture, CanvasRenderer, swap} from './webGlUtil'

import { CopyRenderer } from "./textureRenderers/copyRenderer";
import { DiffuseRenderer } from "./textureRenderers/diffuseRenderer";
import { AddRenderer } from "./textureRenderers/addRenderer";
import { AdvectRenderer } from "./textureRenderers/advectRenderer";
import { SetSourceAtPosRenderer } from "./textureRenderers/setSourceAtPosRenderer";
import { ProjectRenderer } from "./textureRenderers/projectRenderer";

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
const TEXTURE_V_VER_S = 9;
const TEXTURE_TEMP_2 = 10;
const TEXTURE_TEMP_3 = 11;

const IN = 0
const OUT = 1

export interface XY {x: number, y: number}

export enum OutputSelector {
  DENSITY = "DENSITY",
  HORIZONTAL_VELOCITY = "HORIZONTAL_VELOCITY",
  VERTICAL_VELOCITY = "VERTICAL_VELOCITY",
  DENSITY_SOURCE = "DENSITY_SOURCE",
}

export interface ShaderProps {
  setFps?: (fps: number) => void
  viscosity?: number
  outputSelectorRef?: React.MutableRefObject<OutputSelector>
  diffusionRateRef?: React.MutableRefObject<number>
  viscosityRef?: React.MutableRefObject<number>
}


export const Shader = ({setFps, diffusionRateRef, viscosityRef, outputSelectorRef}: ShaderProps) => {
  const [run, setRun] = useState(false); // default run
  const requestAnimationFrameRef = useRef<number>()
  const renderingContextRef = useRef<RenderingContext>()
  const [pausePlayButton, setPausePlayButton] = useState("play")
  const mousePosRef = useRef<XY | undefined>()

  useEffect(() => {
    // Initialize GL context once.
    const c = initializeRenderingContext();
    renderingContextRef.current = c
  });

  const getOutputSelector = useCallback(
    () => getRefCurrentOrDefault(outputSelectorRef, OutputSelector.DENSITY),
    [outputSelectorRef])

  const getDiffusionRate = useCallback(
    () => getRefCurrentOrDefault(diffusionRateRef, 0.002),
    [diffusionRateRef])
  
  const getViscosity = useCallback(
    () => getRefCurrentOrDefault(viscosityRef, 0.01),
    [viscosityRef]
  )

  const getMousePos = useCallback(
    () => getRefCurrentOrDefault(mousePosRef, undefined),
    [mousePosRef]
  )

  const animate = useCallback((frameTimeMs: number) => {
    //var deltaMs = 0;
    //if (prevTimeRef.current !== 0) {
    //  deltaMs = timeMs - prevTimeRef.current
    //}
    //prevTimeRef.current = timeMs
    //if (setFps) {
    //  setFps(1000/deltaMs)
    //}
    // TODO do not reset deltaMs if the animation frame was not finished.
    var rc = renderingContextRef.current
    if (rc !== undefined) {
      const t0 = rc.prevFrameTime
      rc = render({
        rc,
        outputSelector:getOutputSelector(), 
        diffusionRate: getDiffusionRate(),
        viscosity: getViscosity(),
        sourcePos: getMousePos(),
        frameTimeMs,
      })
      renderingContextRef.current = rc
      if (setFps !== undefined && rc?.frameInProgress === false && t0 !== undefined) {
        setFps(1000/(frameTimeMs - t0))
      }
    }
    requestAnimationFrameRef.current = requestAnimationFrame(animate);
  }, [getDiffusionRate, getOutputSelector, getViscosity, getMousePos, setFps])

  useEffect(() => {
    // Render GL based on the context once, and repeat in the loop.
    if (run) {
      requestAnimationFrameRef.current = requestAnimationFrame(animate);
    } else {
      console.log('No run')
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
      renderingContextRef.current = render({
        rc,
        outputSelector: getOutputSelector(),
        diffusionRate: getDiffusionRate(),
        viscosity: getViscosity(),
        frameTimeMs: (rc.prevFrameTime || 0) + 100,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const xy = getRelativePosFromEvent(e)
    if (e.buttons && 1) {
      mousePosRef.current = xy
    } else {
      mousePosRef.current = undefined
    }
  }

  const canvas = useMemo(
    () => <
      canvas
      id="c"
      style={{width: "100%", height: "100%"}}
      onMouseMove={handleMouseMove}
      />,
    [])
  return (
    <>
      <div style={{width: "256px", height: "256px"}}>
        {canvas}
      </div>
      <div onClick={handleClickPlay}>{pausePlayButton}</div>
      <div onClick={handleClickStep}>step</div>
    </>)
};

/**
 * Rendering context lives across rendering frames.
 * 
 * @param prevFrameTime the time of the previous finished animation frame.
 * @param frameInProgress tells if the rendering is still in progress, or had finished.
 */
interface RenderingContext  {
  gl: GL

  prevFrameTime?: number
  frameInProgress: boolean

  /** Density source (S) */
  densitySource: Texture
  /** Static force field (u0, v0) */
  horizontalVelocitySource: Texture
  verticalVelocitySource: Texture
  /** Horizontal velocity (h) */
  horizontalVelocity1: Texture
  horizontalVelocity2: Texture
  /** Vertical velocity (v) */
  verticalVelocity1: Texture
  verticalVelocity2: Texture
  /**
   * Density (p). We need three density buffers to implement diffuse operation. One is the initial density, and other
   * two are previous and next output densities, swapped each iteration.
   */
  density1: Texture
  density2: Texture

  textureTemp: Texture
  textureTemp2: Texture
  textureTemp3: Texture

  copyRenderer: CopyRenderer
  diffuseRenderer: DiffuseRenderer
  canvasRenderer: CanvasRenderer
  addRenderer: AddRenderer
  advectRenderer: AdvectRenderer
  setSourceAtPosRenderer: SetSourceAtPosRenderer
  projectRenderer: ProjectRenderer

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
  const [width, height] = [32*4, 32*4]
  const gl = initializeGl(canvasId);
  const newTexture = (texture_id: number) => {
    return new Texture({ gl, texture_id, height, width, type: "float" });
  }
  
  const sourceMagnitude = 10
  const densitySourceValues = Array(width * height).fill(0)
  densitySourceValues[width * (Math.floor(height / 2)) + Math.floor(height / 2)] = sourceMagnitude // initialize single pixel in the middle

  const densitySource = newTexture(TEXTURE_SOURCE).setValues(densitySourceValues)

  const horizontalVelocity1 = newTexture(TEXTURE_V_HOR_1).fill(0);
  const horizontalVelocity2 = newTexture(TEXTURE_V_HOR_2).fill(0.0);

  const verticalVelocity1 = newTexture(TEXTURE_V_VER_1).fill(0);
  const verticalVelocity2 = newTexture(TEXTURE_V_VER_2).fill(0.0);

  const horizontalVelocitySource = newTexture(TEXTURE_V_HOR_S).setValues(
    arrayForWH(width, height,
      (x, y) => x < width / 2 ? 0 : 0.2
  ));
  const verticalVelocitySource = newTexture(TEXTURE_V_VER_S).setValues(
    arrayForWH(width, height,
      (x, y) => y < height / 2 ? 0 : 0.2
  ));

  const density1 = newTexture(TEXTURE_DENSITY_1).fill(0);
  const density2 = newTexture(TEXTURE_DENSITY_2).fill(0);
  const textureTemp = newTexture(TEXTURE_TEMP).fill(0);
  const textureTemp2 = newTexture(TEXTURE_TEMP_2).fill(0);
  const textureTemp3 = newTexture(TEXTURE_TEMP_3).fill(0);

  const copyRenderer = new CopyRenderer(gl);
  const diffuseRenderer = new DiffuseRenderer(gl);

  const canvasRenderer = new CanvasRenderer(gl);
  const addRenderer = new AddRenderer(gl);
  const advectRenderer = new AdvectRenderer(gl);
  const setSourceAtPosRenderer = new SetSourceAtPosRenderer(gl)
  const projectRenderer = new ProjectRenderer(gl)

  return {
    gl, copyRenderer, canvasRenderer,
    // swapTextures: false,
    sync: null, 
    addRenderer,
    diffuseRenderer,
    advectRenderer,
    setSourceAtPosRenderer,
    densitySource,
    horizontalVelocitySource,
    verticalVelocitySource,
    horizontalVelocity1,
    horizontalVelocity2,
    verticalVelocity1,
    verticalVelocity2,
    density1,
    density2,
    textureTemp,
    textureTemp2,
    textureTemp3,
    projectRenderer,
    frameInProgress: false,
  }
}

const render = (
  {rc, outputSelector, diffusionRate, viscosity, sourcePos, frameTimeMs} : {
    rc: RenderingContext,
    outputSelector: OutputSelector,
    diffusionRate: number,
    viscosity: number,
    sourcePos?: XY,
    frameTimeMs: number,
  }
): RenderingContext | undefined => {
  const {
    gl,
    prevFrameTime,
    sync,
    densitySource,
    horizontalVelocitySource,
    horizontalVelocity1,
    horizontalVelocity2,
    verticalVelocitySource,
    verticalVelocity1,
    verticalVelocity2,
    density1,
    density2,
    copyRenderer,
    diffuseRenderer,
    advectRenderer,
    setSourceAtPosRenderer,
    canvasRenderer,
    projectRenderer,
    addRenderer,
    textureTemp,
    textureTemp2,
    textureTemp3,
  } = rc

  if (sync === null) {
    // console.log("sync is null")
  } else {
    const syncStatus = gl.getSyncParameter(sync, gl.SYNC_STATUS)
    if (syncStatus === gl.SIGNALED) {
      // console.log("finished")
      gl.deleteSync(rc.sync)
    } else {
      // TODO do not reset interval (ms) to zero when the frame is not finished, rather accumulate
      // the interval.
      // console.log("Frame not finished yet")
      // When render is called, the previous rendering might not have finished yet.
      return {...rc, frameInProgress: true};
   }
  }

  // Update prevFrameTime only when the previous animation frame have finished.
  var deltaSec = 0.01
  if (prevFrameTime !== undefined ) {
    deltaSec = (frameTimeMs - prevFrameTime) / 1000
  }

  ////////////////
  // Controls step.
  // Apply the user controls, e.g. mouse movement that sets the density source.
  if (sourcePos !== undefined) {
    setSourceAtPosRenderer.render(densitySource, sourcePos)
  }

  ////////////////
  // Density step.
  // The input and output to the step is density2, the other density textures are
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

  // "2" is output from the previous rendering cycle, which makes 
  // it input to this rendering cycle.
  const densities = [density2, density1]
  const horizontalVelocities = [horizontalVelocity2, horizontalVelocity1]
  const verticalVelocities = [verticalVelocity2, verticalVelocity1]

  // Here run add_source from the Paper. density2 is the output from the previous iteration,
  // and it's copied (with source added) to density1.
  addRenderer.render(densities[IN], densitySource, densities[OUT], deltaSec)

  // Here we need to juggle the density textures. Between the frames there is only a single density
  // texture. During the rendering, we need to copy the textures when the shaders modify the textures.
  // 1.
  //   a. Initial density x0 before diffuse. This needs to be a readonly copy. of density.
  //   b. Copy of initial density to t0.
  //   c. Combine initial density and copy to t1.
  // 2. Swap t0 and t1.
  // 3. Combine initial density and t1 to t0.
  // 4. Repeat N times.
  swap(densities)
  diffuseRenderer.render(densities[IN], textureTemp, densities[OUT], deltaSec, diffusionRate)

  swap(densities)
  advectRenderer.render(densities[IN], densities[OUT], horizontalVelocities[IN], verticalVelocities[IN], deltaSec);

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
  //
  //   project ( N, u=u, v=v, p=u0, div=v0 );
  //   SWAP ( u0, u );
  //   SWAP ( v0, v );
  //   advect ( N, b=1, d=u, d0=u0, u=u0, v=v0, dt );
  //   advect ( N, b=2, d=v, d0=v0, u=u0, v=v0, dt );
  //   project ( N, u=u, v=v, p=u0, div=v0 );
  // }

  addRenderer.render(
    horizontalVelocities[IN],
    horizontalVelocitySource,
    horizontalVelocities[OUT],
    deltaSec)
  addRenderer.render(
    verticalVelocities[IN],
    verticalVelocitySource,
    verticalVelocities[OUT],
    deltaSec,
  )

  swap(horizontalVelocities)
  swap(verticalVelocities)

  // vel 1 is the previous output
  diffuseRenderer.render(
    horizontalVelocities[IN],
    textureTemp,
    horizontalVelocities[OUT],
    deltaSec,
    viscosity,
  )
  diffuseRenderer.render(
    verticalVelocities[IN],
    textureTemp,
    verticalVelocities[OUT],
    deltaSec,
    viscosity,
  )

  swap(horizontalVelocities)
  swap(verticalVelocities)

  projectRenderer.render(
    horizontalVelocities[IN],
    verticalVelocities[IN],
    textureTemp,
    textureTemp2,
    textureTemp3,
    horizontalVelocities[OUT],
    verticalVelocities[OUT],
  )

  swap(horizontalVelocities)
  swap(verticalVelocities)

  // TODO 1st project here

  advectRenderer.render(
    horizontalVelocities[IN],
    horizontalVelocities[OUT],
    horizontalVelocities[IN],
    verticalVelocities[IN],
    deltaSec,
  );
  advectRenderer.render(
    verticalVelocities[IN],
    verticalVelocities[OUT],
    horizontalVelocities[IN],
    verticalVelocities[IN],
    deltaSec,
  )

  // SWAP: MODIFIED DENSITIES
  // SWAP: MODIFIED VELOCITIES

  // TODO 2nd project here

  // Rendering to canvas.
  // By convention where the output density is in density2

  // Prepare for the next rendering cycle. Make sure that texture "1" is in and "2" is out.
  // Since after all the swaps we don't know which is which, just copy it.
  copyRenderer.render(densities[OUT], densities[IN]);
  copyRenderer.render(horizontalVelocities[OUT], horizontalVelocities[IN])
  copyRenderer.render(verticalVelocities[OUT], verticalVelocities[IN])
  // Preserve the output for the next render cycle.
  if (outputSelector === OutputSelector.DENSITY) {
    canvasRenderer.render(densities[OUT]);
  } else if (outputSelector === OutputSelector.DENSITY_SOURCE) {
    canvasRenderer.render(densitySource);
  } else if (outputSelector === OutputSelector.HORIZONTAL_VELOCITY) {
    canvasRenderer.render(horizontalVelocity2);
  } else if (outputSelector === OutputSelector.VERTICAL_VELOCITY) {
    canvasRenderer.render(verticalVelocity2);
  } else {
    console.error(`Cannot render output for ${outputSelector}`)
  }

  const newSync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  //if (sync === null) {
  //  console.log("new sync is null")
  //}
  return {
    ...rc,
    sync: newSync,
    prevFrameTime: frameTimeMs,
    frameInProgress: false,
    // swapTextures: !swapTextures,
  };
}


const arrayForWH = (width: number, height: number, func: (x:number, y:number) => number): number[] => {
  const output = []
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      output.push(func(x, y))
    }
  }
  return output
}

const getRefCurrentOrDefault = <T,>(ref: React.MutableRefObject<T | undefined> | undefined, default_: T) => {
  if (ref === undefined) {
    return default_
  }
  const c = ref.current
  if (c === undefined) {
    return default_
  }
  return c
}

/**
 * Return x and y in range [0, 1] relative to the element corner.
 */
const getRelativePosFromEvent = (e: React.MouseEvent<HTMLCanvasElement>): XY => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    return {x, y}
}

