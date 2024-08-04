import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";

import {GL, initializeGl, Texture, swap} from './webGlUtil'

import { CanvasRenderer } from "./CanvasRenderer";
import { CopyRenderer } from "./textureRenderers/copyRenderer";
import { DiffuseRenderer } from "./textureRenderers/diffuseRenderer";
import { AddRenderer } from "./textureRenderers/addRenderer";
import { AdvectRenderer } from "./textureRenderers/advectRenderer";
import { SetCircleAtPosRenderer } from "./textureRenderers/setCircleAtPosRenderer";
import { ProjectRenderer } from "./textureRenderers/projectRenderer";
import { SetVelocityRenderer } from "./textureRenderers/setVelocityRenderer";

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

const defaultWidth = 128
const defaultHeight = 128
const defaultCanvasStyle = {width: "256px", height: "256px"}


export interface XY {x: number, y: number}

/**
 * XY with time (in ms)
 */
interface XYT {x: number, y: number, tSec: number}

interface Movement {
  pPrev?: XYT
  pCurr: XYT
}

/** Select the input method, i.e. what happens when the user clicks the canvas or drags the mouse. */
export enum InputSelector {
  /** Update density */
  DENSITY = "DENSITY",
  /** Update velocity  */
  VELOCITY = "VELOCITY",
  /** Update density and velocity */
  DENSITY_AND_VELOCITY = "DENSITY_AND_VELOCITY",
}

/**
 * Select what should be displayed at the output.
 */
export enum OutputSelector {
  DENSITY = "DENSITY",
  HORIZONTAL_VELOCITY = "HORIZONTAL_VELOCITY",
  VERTICAL_VELOCITY = "VERTICAL_VELOCITY",
  DENSITY_SOURCE = "DENSITY_SOURCE",
}

/**
 * The refs are used and not state to prevent rerender on state change, because we want to retain the internal shader state.
 * 
 * @param inputSelector what happens when the user interacts with the canvas.
 * @param outputSelector what to display at the output.
 * @param width width of the internal representation of the state.
 * @param height height of the internal representation of the state.
 */
export interface ShaderProps {
  setFps?: (fps: number) => void
  inputSelectorRef?: React.MutableRefObject<InputSelector>
  outputSelectorRef?: React.MutableRefObject<OutputSelector>
  diffusionRateRef?: React.MutableRefObject<number>
  viscosityRef?: React.MutableRefObject<number>
  width?: number
  height?: number
  canvasStyle?: React.CSSProperties
}

export const Shader = ({
  setFps,
  diffusionRateRef,
  viscosityRef,
  outputSelectorRef,
  width=defaultWidth,
  height=defaultHeight,
  canvasStyle=defaultCanvasStyle,
}: ShaderProps) => {
  const [run, setRun] = useState(false); // default run
  const requestAnimationFrameRef = useRef<number>()
  const renderingContextRef = useRef<RenderingContext>()
  const [pausePlayButton, setPausePlayButton] = useState("play")
   // If mouseMovementRef is undefined, then there is no button pressed.
  const mouseMovementRef = useRef<Movement | undefined>()

  useEffect(() => {
    // Initialize GL context once.
    const c = initializeRenderingContext({width, height});
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

  const getMouseMovement = useCallback(
    () => getRefCurrentOrDefault(mouseMovementRef, undefined),
    [mouseMovementRef]
  )

  const animate = useCallback((frameTimeMs: number) => {
    var rc = renderingContextRef.current
    if (rc !== undefined) {
      const t0 = rc.prevFrameTime
      rc = render({
        rc,
        outputSelector:getOutputSelector(), 
        diffusionRate: getDiffusionRate(),
        viscosity: getViscosity(),
        movement: getMouseMovement(),
        frameTimeMs,
      })
      renderingContextRef.current = rc
      if (setFps !== undefined && rc?.frameInProgress === false && t0 !== undefined) {
        setFps(1000/(frameTimeMs - t0))
      }
    }
    requestAnimationFrameRef.current = requestAnimationFrame(animate);
  }, [getDiffusionRate, getOutputSelector, getViscosity, getMouseMovement, setFps])

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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const tSec = (new Date()).getTime() / 1000
    const {x, y} = getRelativePosFromEvent(e)
    if (e.buttons && 1) {
      const c = mouseMovementRef.current
      if (c === undefined) {
        mouseMovementRef.current = {pCurr: {x, y, tSec}}
      } else {
        const pPrev = c.pCurr
        mouseMovementRef.current = {pPrev, pCurr: {x, y, tSec}}
      }
    } else {
      mouseMovementRef.current = undefined
    }
  }

  const handleMouseUpOrLeave = () => {
      mouseMovementRef.current = undefined
  }

  const canvas = useMemo(
    () => <
      canvas
      id="c"
      style={{width: "100%", height: "100%"}}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      />,
    [])
  return (
    <>
      <div style={canvasStyle}>
        {canvas}
      </div>
      <div onClick={handleClickPlay}>{pausePlayButton}</div>
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
  setCircleAtPosRenderer: SetCircleAtPosRenderer
  projectRenderer: ProjectRenderer
  setVelocityRenderer: SetVelocityRenderer

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

const initializeRenderingContext = ({width, height}: {width: number, height: number}): RenderingContext => {
  const gl = initializeGl(canvasId);
  const newTexture = (texture_id: number) => {
    return new Texture({ gl, texture_id, height, width, type: "float" });
  }
  
  //const sourceMagnitude = 10
  //const densitySourceValues = Array(width * height).fill(0)
  //densitySourceValues[width * (Math.floor(height / 2)) + Math.floor(height / 2)] = sourceMagnitude // initialize single pixel in the middle
  //const densitySource = newTexture(TEXTURE_SOURCE).setValues(densitySourceValues)
  const densitySource = newTexture(TEXTURE_SOURCE).fill(0)

  const horizontalVelocity1 = newTexture(TEXTURE_V_HOR_1).fill(0);
  const horizontalVelocity2 = newTexture(TEXTURE_V_HOR_2).fill(0.0);

  const verticalVelocity1 = newTexture(TEXTURE_V_VER_1).fill(0);
  const verticalVelocity2 = newTexture(TEXTURE_V_VER_2).fill(0.0);

  const horizontalVelocitySource = newTexture(TEXTURE_V_HOR_S).fill(0);
  //const horizontalVelocitySource = newTexture(TEXTURE_V_HOR_S).setValues(
  //  arrayForWH(width, height,
  //    (x, y) => x < width / 2 ? 0 : 0.2
  //));
  const verticalVelocitySource = newTexture(TEXTURE_V_VER_S).fill(0)
  //const verticalVelocitySource = newTexture(TEXTURE_V_VER_S).setValues(
  //  arrayForWH(width, height,
  //    (x, y) => y < height / 2 ? 0 : 0.2
  //));

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
  const setCircleAtPosRenderer = new SetCircleAtPosRenderer(gl)
  const projectRenderer = new ProjectRenderer(gl)
  const setVelocityRenderer = new SetVelocityRenderer(gl)

  return {
    gl, copyRenderer, canvasRenderer,
    // swapTextures: false,
    sync: null, 
    addRenderer,
    diffuseRenderer,
    advectRenderer,
    setCircleAtPosRenderer,
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
    setVelocityRenderer,
    frameInProgress: false,
  }
}

const render = (
  {rc, outputSelector, diffusionRate, viscosity, movement, frameTimeMs} : {
    rc: RenderingContext,
    outputSelector: OutputSelector,
    diffusionRate: number,
    viscosity: number,
    movement?: Movement,
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
    setCircleAtPosRenderer,
    canvasRenderer,
    projectRenderer,
    setVelocityRenderer,
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
      // When render is called, the previous rendering might not have finished yet.
      // console.log("Frame not finished yet")
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
  if (movement === undefined) {
    const cleanTexture = (tex: Texture) => {
      setCircleAtPosRenderer.render(tex, {x: 0.5, y: 0.5}, 0)
    }
    cleanTexture(densitySource)
    cleanTexture(horizontalVelocitySource)
    cleanTexture(verticalVelocitySource)
  } else {
    const currPos = movement.pCurr
    setCircleAtPosRenderer.render(densitySource, currPos)
    const prevPos = movement.pPrev
    if (prevPos !== undefined) {
      const prevXY = {x: prevPos.x, y: prevPos.y}
      const currXY = {x: currPos.x, y: currPos.y}
      setVelocityRenderer.render(horizontalVelocitySource, prevXY, prevPos.tSec, currXY, currPos.tSec, "horizontal")
      setVelocityRenderer.render(verticalVelocitySource, prevXY, prevPos.tSec, currXY, currPos.tSec, "vertical")
      //const dt = currPos.tSec - prevPos.tSec
      //console.log("x", (currPos.x - prevPos.x), "y", (currPos.y - prevPos.y), dt)
      ////console.log(new Date())
    }
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

  swap(verticalVelocities)
  swap(horizontalVelocities)

  projectRenderer.render(
    horizontalVelocities[IN],
    verticalVelocities[IN],
    textureTemp,
    textureTemp2,
    textureTemp3,
    horizontalVelocities[OUT],
    verticalVelocities[OUT],
  )

  // Rendering to canvas.
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

