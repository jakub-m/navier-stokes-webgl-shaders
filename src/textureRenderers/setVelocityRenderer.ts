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
    mode: "horizontal" | "vertical",
    relativeRadius?: number
  ) {
    const gl = this.gl;
    var program = this.program;
    gl.useProgram(program);

    if (relativeRadius === undefined) {
      relativeRadius = defaultRelativeRadius;
    }
    const vertexCount = prepareProgramToRenderOutput(gl, program, output);
    const u_relative_radius = gl.getUniformLocation(
      program,
      "u_relative_radius"
    );
    validateDefined({ u_relative_radius });
    gl.uniform1f(u_relative_radius, relativeRadius);

    const u_relative_pos_0 = gl.getUniformLocation(program, "u_relative_pos_0");
    validateDefined({ u_relative_pos_0 });
    gl.uniform2f(u_relative_pos_0, p0.x, p0.y);

    const u_time_sec_0 = gl.getUniformLocation(program, "u_time_sec_0");
    validateDefined({ u_time_sec_0 });
    gl.uniform1f(u_time_sec_0, tSec0); // tSec0);
    console.log("tSec0", tSec0);

    const u_relative_pos_1 = gl.getUniformLocation(program, "u_relative_pos_1");
    validateDefined({ u_relative_pos_1 });
    gl.uniform2f(u_relative_pos_1, p1.x, p1.y);

    const u_time_sec_1 = gl.getUniformLocation(program, "u_time_sec_1");
    validateDefined({ u_time_sec_1 });
    gl.uniform1f(u_time_sec_1, tSec1); // tSec1);
    console.log("tSec1", tSec1);

    const u_mode = gl.getUniformLocation(program, "u_mode");
    validateDefined({ u_mode });
    if (mode === "horizontal") {
      gl.uniform1i(u_mode, 0);
    } else if (mode === "vertical") {
      gl.uniform1i(u_mode, 1);
    } else {
      throw Error(`Bad mode ${mode}`);
    }

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
