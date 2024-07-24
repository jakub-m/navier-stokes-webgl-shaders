import copyFragmentShader from "./copy.fragmentShader.glsl";
import genericVertexShader from "./generic.vertexShader.glsl";

import {
  GL,
  Texture,
  createProgramFromSources,
  validateTexturesHaveSameSize,
  prepareProgramToRenderOutput,
} from "../webGlUtil";

/**
 * A texture renderer that copies texture to other texture.
 */
export class CopyRenderer {
  private gl: GL;
  private program: WebGLProgram;

  constructor(gl: GL) {
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      genericVertexShader,
      copyFragmentShader
    );
  }

  renderToTexture({ input, output }: { input: Texture; output: Texture }) {
    validateTexturesHaveSameSize([output, input]);
    var gl = this.gl;
    var program = this.program;
    gl.useProgram(program);
    const vertexCount = prepareProgramToRenderOutput(gl, program, output);
    var u_texture_source = gl.getUniformLocation(program, "u_texture_source");
    gl.uniform1i(u_texture_source, input.texture_id);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
