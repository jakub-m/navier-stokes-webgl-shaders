import addFragmentShader from "./add.fragmentShader.glsl";
import genericVertexShader from "./generic.vertexShader.glsl";

import {
  GL,
  Texture,
  createProgramFromSources,
  validateTexturesHaveSameSize,
  prepareProgramToRenderOutput,
  validateDefined,
} from "../webGlUtil";

/**
 * A texture renderer that adds values of two textures.
 */
export class AddRenderer {
  private gl: GL;
  private program: WebGLProgram;

  constructor(gl: GL) {
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      genericVertexShader,
      addFragmentShader
    );
  }

  render(
    textureA: Texture,
    textureB: Texture,
    output: Texture,
    modifierB: number
  ) {
    validateTexturesHaveSameSize([output, textureA, textureB]);
    var gl = this.gl;
    var program = this.program;
    gl.useProgram(program);
    const vertexCount = prepareProgramToRenderOutput(gl, program, output);
    const u_texture_a = gl.getUniformLocation(program, "u_texture_a");
    const u_texture_b = gl.getUniformLocation(program, "u_texture_b");
    const u_modifier_b = gl.getUniformLocation(program, "u_modifier_b");
    validateDefined({ u_texture_a, u_texture_b, u_modifier_b });
    gl.uniform1i(u_texture_a, textureA.texture_id);
    gl.uniform1i(u_texture_b, textureB.texture_id);
    gl.uniform1f(u_modifier_b, modifierB);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
