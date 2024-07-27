import setCircleAtPosFragmentShader from "./setCircleAtPos.fragmentShader.glsl";
import genericVertexShader from "./generic.vertexShader.glsl";

import {
  GL,
  Texture,
  createProgramFromSources,
  validateTexturesHaveSameSize,
  prepareProgramToRenderOutput,
  validateDefined,
} from "../webGlUtil";

const defaultRelativeRadius = 0.1;

/**
 * A renderer that sets a circle, e.g. a diffusion source at some specific position,
 * e.g. from user input.
 */
export class SetCircleAtPosRenderer {
  private gl: GL;
  private program: WebGLProgram;

  constructor(gl: GL) {
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      genericVertexShader,
      setCircleAtPosFragmentShader
    );
  }

  render(
    output: Texture,
    relativePos: { x: number; y: number },
    relativeRadius?: number
  ) {
    validateTexturesHaveSameSize([output]);
    const gl = this.gl;
    var program = this.program;
    gl.useProgram(program);

    if (relativeRadius === undefined) {
      relativeRadius = defaultRelativeRadius;
    }

    const vertexCount = prepareProgramToRenderOutput(gl, program, output);

    var u_relative_radius = gl.getUniformLocation(program, "u_relative_radius");
    validateDefined({ u_relative_radius });
    gl.uniform1f(u_relative_radius, relativeRadius);

    var u_relative_pos = gl.getUniformLocation(program, "u_relative_pos");
    validateDefined({ u_relative_pos });
    gl.uniform2f(u_relative_pos, relativePos.x, relativePos.y);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
