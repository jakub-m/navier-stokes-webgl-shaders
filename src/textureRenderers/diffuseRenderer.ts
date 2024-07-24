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

/**
 * A shader that implements "diffuse" operation from the Paper (see README).
 */
export class DiffuseRenderer {
  private gl: GL;
  private program: WebGLProgram;

  constructor(gl: GL) {
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      genericVertexShader,
      diffuseFragmentShader
    );
  }

  /**
   * initialDensity is x0 in the Paper. This value is the input density that is diffused.
   * prevOutputDensity and nextOutputDensity are the output textures to which the output
   * is calculated. The algorithm works iteratively, so it needs two outputs and will swap
   * between the outputs on each iteration.
   *
   * The final result will be placed in nextOutputDensity texture.
   */
  renderToTexture(
    initialDensity: Texture,
    prevOutputDensity: Texture,
    nextOutputDensity: Texture
  ) {
    validateTexturesHaveSameSize([
      initialDensity,
      prevOutputDensity,
      nextOutputDensity,
    ]);
    new CopyRenderer(this.gl).renderToTexture({
      input: initialDensity,
      output: prevOutputDensity,
    });

    // TODO apply diffuse 20 times
    this.diffuseOnce(initialDensity, prevOutputDensity, nextOutputDensity);
  }

  private diffuseOnce(
    initialDensity: Texture,
    prevOutputDensity: Texture,
    nextOutputDensity: Texture
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
    gl.uniform1f(u_diff, 0.5); // diffusion rate

    var u_dt = gl.getUniformLocation(program, "u_dt");
    validateDefined({ u_dt });
    gl.uniform1f(u_dt, 0.01); // interval in seconds

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
