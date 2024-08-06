import setBoundaryFragmentShader from "./setBoundary.fragmentShader.glsl";
import genericVertexShader from "./generic.vertexShader.glsl";

import {
  GL,
  Texture,
  createProgramFromSources,
  validateTexturesHaveSameSize,
  validateLocation,
  prepareProgramToRenderOutput,
  appendCommonGlsl,
} from "../webGlUtil";

export enum BoundaryMode {
  MODE_0 = 0,
  MODE_1 = 1,
  MODE_2 = 2,
}

/**
 * Implement "set_bnd" method from the Paper.
 */
export class SetBoundaryRenderer {
  private gl: GL;
  private program: WebGLProgram;

  constructor(gl: GL) {
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      genericVertexShader,
      appendCommonGlsl(setBoundaryFragmentShader)
    );
  }

  render(input: Texture, output: Texture, mode: BoundaryMode) {
    validateTexturesHaveSameSize([output, input]);
    const gl = this.gl;
    const program = this.program;
    gl.useProgram(program);
    const vertexCount = prepareProgramToRenderOutput(gl, program, output);

    const u_input = gl.getUniformLocation(program, "u_input");
    validateLocation({ u_input });
    gl.uniform1i(u_input, input.texture_id);

    var u_texture_size = gl.getUniformLocation(program, "u_texture_size");
    validateLocation({ u_texture_size });
    gl.uniform2f(u_texture_size, input.width, input.height);

    var u_mode_b = gl.getUniformLocation(program, "u_mode_b");
    validateLocation({ u_mode_b });
    gl.uniform1i(u_mode_b, mode);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
