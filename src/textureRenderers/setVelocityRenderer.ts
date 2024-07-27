import setVelocityFragmentShader from "./setVelocity.fragmentShader.glsl";
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

//const defaultRelativeRadius = 0.1;

interface XY {
  x: number;
  y: number;
}

const defaultRelativeRadius = 0.1;

export class SetVelocityRenderer {
  private gl: GL;
  private program: WebGLProgram;

  constructor(gl: GL) {
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      genericVertexShader,
      setVelocityFragmentShader
    );
  }

  render(
    output: Texture,
    p0: XY,
    tSec0: number,
    p1: XY,
    tSec1: number,
    relativeRadius?: number
  ) {
    const gl = this.gl;
    var program = this.program;
    gl.useProgram(program);

    if (relativeRadius === undefined) {
      relativeRadius = defaultRelativeRadius;
    }
    const vertexCount = prepareProgramToRenderOutput(gl, program, output);
    //"u_relative_radius";
    //"u_relative_pos_0";
    //"u_time_sec_0";
    //"u_relative_pos_1";
    //"u_time_sec_1";
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}

//    var u_relative_radius = gl.getUniformLocation(program, "u_relative_radius");
//    validateDefined({ u_relative_radius });
//    gl.uniform1f(u_relative_radius, relativeRadius);
//
//    var u_relative_pos = gl.getUniformLocation(program, "u_relative_pos");
//    validateDefined({ u_relative_pos });
//    gl.uniform2f(u_relative_pos, relativePos.x, relativePos.y);
