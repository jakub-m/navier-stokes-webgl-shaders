import diffuseFragmentShader from "./diffuse.fragmentShader.glsl";
import genericVertexShader from "./generic.vertexShader.glsl";

import {
  GL,
  Texture,
  createProgramFromSources,
  validateTexturesHaveSameSize,
  prepareProgramToRenderOutput,
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
  renderToTexture({
    initialDensity,
    prevOutputDensity,
    nextOutputDensity,
  }: {
    initialDensity: Texture;
    prevOutputDensity: Texture;
    nextOutputDensity: Texture;
  }) {
    validateTexturesHaveSameSize([
      initialDensity,
      prevOutputDensity,
      nextOutputDensity,
    ]);
    var gl = this.gl;
    var program = this.program;
    gl.useProgram(program);

    new CopyRenderer(this.gl).renderToTexture({
      input: initialDensity,
      output: prevOutputDensity,
    });
    const vertexCount = prepareProgramToRenderOutput(
      gl,
      program,
      nextOutputDensity
    );

    var u_initial_density = gl.getUniformLocation(program, "u_initial_density");
    gl.uniform1i(u_initial_density, initialDensity.texture_id);
    var u_output_density = gl.getUniformLocation(program, "u_output_density");
    gl.uniform1i(u_output_density, prevOutputDensity.texture_id);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
