import setSourceAtPosFragmentShader from "./setSourceAtPos.fragmentShader.glsl";
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
 * A renderer that sets the diffusion source at some specific position,
 * e.g. from user input.
 */
export class SetSourceAtPosRenderer {
  private gl: GL;
  private program: WebGLProgram;

  constructor(gl: GL) {
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      genericVertexShader,
      setSourceAtPosFragmentShader
    );
  }

  render(output: Texture, relativePos: { x: number; y: number }) {
    validateTexturesHaveSameSize([output]);
    const gl = this.gl;
    var program = this.program;
    gl.useProgram(program);

    const vertexCount = prepareProgramToRenderOutput(gl, program, output);

    var u_relative_radius = gl.getUniformLocation(program, "u_relative_radius");
    validateDefined({ u_relative_radius });
    gl.uniform1f(u_relative_radius, 0.1);

    var u_relative_pos = gl.getUniformLocation(program, "u_relative_pos");
    validateDefined({ u_relative_pos });
    gl.uniform2f(u_relative_pos, relativePos.x, relativePos.y);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
