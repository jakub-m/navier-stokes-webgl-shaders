import diffuseFragmentShader from "./diffuse.fragmentShader.glsl";
import genericVertexShader from "./generic.vertexShader.glsl";

import {
  GL,
  Texture,
  createProgramFromSources,
  validateTexturesHaveSameSize,
  prepareProgramToRenderOutput,
  validateDefined,
} from "../webGlUtil";

import { CopyRenderer } from "./copyRenderer";

export interface DiffuseRendererProps {
  gl: GL;
  diffusionRate: number;
}

/**
 * A shader that implements "diffuse" operation from the Paper (see README).
 */
export class DiffuseRenderer {
  private gl: GL;
  private program: WebGLProgram;
  private copyRenderer: CopyRenderer;
  diffusionRate: number;

  constructor({ gl, diffusionRate }: DiffuseRendererProps) {
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      genericVertexShader,
      diffuseFragmentShader
    );
    this.copyRenderer = new CopyRenderer(gl);
    this.diffusionRate = diffusionRate;
  }

  /**
   * initialDensity is x0 in the Paper, that is, the density before diffuse. This value is the input density that
   * is diffused.
   * prevOutputDensity and nextOutputDensity are the output textures to which the output
   * is calculated. The algorithm works iteratively, so it needs two outputs and will swap
   * between the outputs on each iteration.
   *
   * The final result will be placed in nextOutputDensity texture.
   */
  render(
    densityBeforeDiffusion: Texture,
    tempOutputDensity: Texture,
    finalOutputDensity: Texture,
    deltaSec: number
  ) {
    validateTexturesHaveSameSize([
      densityBeforeDiffusion,
      tempOutputDensity,
      finalOutputDensity,
    ]);
    // TODO this first copy is probably not needed
    this.copyRenderer.render(densityBeforeDiffusion, tempOutputDensity);
    this.copyRenderer.render(densityBeforeDiffusion, finalOutputDensity);

    // Diffuse applies k=20 times, iteratively (see p.6 of the Paper).
    for (let i = 0; i < 10; i++) {
      this.diffuseOnce(
        densityBeforeDiffusion,
        finalOutputDensity,
        tempOutputDensity,
        deltaSec
      );
      this.diffuseOnce(
        densityBeforeDiffusion,
        tempOutputDensity,
        finalOutputDensity,
        deltaSec
      );
    }
  }

  private diffuseOnce(
    initialDensity: Texture,
    prevOutputDensity: Texture,
    nextOutputDensity: Texture,
    deltaSec: number
  ) {
    const gl = this.gl;
    var program = this.program;
    gl.useProgram(program);

    const vertexCount = prepareProgramToRenderOutput(
      gl,
      program,
      nextOutputDensity
    );

    var u_initial_density = gl.getUniformLocation(program, "u_initial_density");
    validateDefined({ u_initial_density });
    gl.uniform1i(u_initial_density, initialDensity.texture_id);

    var u_prev_density = gl.getUniformLocation(program, "u_prev_density");
    validateDefined({ u_prev_density });
    gl.uniform1i(u_prev_density, prevOutputDensity.texture_id);

    var u_texture_size = gl.getUniformLocation(program, "u_texture_size");
    validateDefined({ u_texture_size });
    gl.uniform2f(u_texture_size, initialDensity.width, initialDensity.height);

    var u_diff = gl.getUniformLocation(program, "u_diff");
    validateDefined({ u_diff });
    gl.uniform1f(u_diff, this.diffusionRate);

    var u_dt = gl.getUniformLocation(program, "u_dt");
    validateDefined({ u_dt });
    gl.uniform1f(u_dt, deltaSec);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
