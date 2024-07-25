import diffuseFragmentShader from "./diffuse.fragmentShader.glsl";
import genericVertexShader from "./generic.vertexShader.glsl";

import {
  GL,
  Texture,
  createProgramFromSources,
  validateTexturesHaveSameSize,
  prepareProgramToRenderOutput,
  validateDefined,
  appendCommonGlsl,
} from "../webGlUtil";

import { CopyRenderer } from "./copyRenderer";

/**
 * A shader that implements "diffuse" operation from the Paper (see README).
 */
export class DiffuseRenderer {
  private gl: GL;
  private program: WebGLProgram;
  private copyRenderer: CopyRenderer;

  constructor(gl: GL) {
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      genericVertexShader,
      appendCommonGlsl(diffuseFragmentShader)
    );
    this.copyRenderer = new CopyRenderer(gl);
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
    beforeDiffusion: Texture,
    tempOutput: Texture,
    finalOutput: Texture,
    deltaSec: number,
    diffusionRate: number
  ) {
    validateTexturesHaveSameSize([beforeDiffusion, tempOutput, finalOutput]);
    // TODO this first copy is probably not needed
    this.copyRenderer.render(beforeDiffusion, tempOutput);
    this.copyRenderer.render(beforeDiffusion, finalOutput);

    // Diffuse applies k=20 times, iteratively (see p.6 of the Paper).
    for (let i = 0; i < 10; i++) {
      this.diffuseOnce(
        beforeDiffusion,
        finalOutput,
        tempOutput,
        deltaSec,
        diffusionRate
      );
      this.diffuseOnce(
        beforeDiffusion,
        tempOutput,
        finalOutput,
        deltaSec,
        diffusionRate
      );
    }
  }

  private diffuseOnce(
    initial: Texture,
    prevOutput: Texture,
    nextOutput: Texture,
    deltaSec: number,
    diffusionRate: number
  ) {
    const gl = this.gl;
    var program = this.program;
    gl.useProgram(program);

    const vertexCount = prepareProgramToRenderOutput(gl, program, nextOutput);

    var u_initial_density = gl.getUniformLocation(program, "u_initial_density");
    validateDefined({ u_initial_density });
    gl.uniform1i(u_initial_density, initial.texture_id);

    var u_prev_density = gl.getUniformLocation(program, "u_prev_density");
    validateDefined({ u_prev_density });
    gl.uniform1i(u_prev_density, prevOutput.texture_id);

    var u_texture_size = gl.getUniformLocation(program, "u_texture_size");
    validateDefined({ u_texture_size });
    gl.uniform2f(u_texture_size, initial.width, initial.height);

    var u_diff = gl.getUniformLocation(program, "u_diff");
    validateDefined({ u_diff });
    gl.uniform1f(u_diff, diffusionRate);

    var u_dt = gl.getUniformLocation(program, "u_dt");
    validateDefined({ u_dt });
    gl.uniform1f(u_dt, deltaSec);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
