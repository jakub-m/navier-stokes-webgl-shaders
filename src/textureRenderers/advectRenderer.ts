import advectFragmentShader from "./advect.fragmentShader.glsl";
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

//export interface DiffuseRendererProps {
//  gl: GL;
//  diffusionRate: number;
//}
//
/**
 * A shader that implements "advect" operation from the Paper (see README).
 */
export class AdvectRenderer {
  private gl: GL;
  private program: WebGLProgram;

  constructor(gl: GL) {
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      genericVertexShader,
      appendCommonGlsl(advectFragmentShader)
    );
  }

  render(
    inputDensity: Texture,
    finalOutputDensity: Texture,
    horizontalVelocity: Texture,
    verticalVelocity: Texture,
    deltaSec: number
  ) {
    validateTexturesHaveSameSize([
      inputDensity,
      finalOutputDensity,
      horizontalVelocity,
      verticalVelocity,
    ]);
    const gl = this.gl;
    const program = this.program;
    gl.useProgram(program);

    const vertexCount = prepareProgramToRenderOutput(
      gl,
      program,
      finalOutputDensity
    );

    const u_input_density = gl.getUniformLocation(program, "u_input_density");
    validateDefined({ u_input_density });
    gl.uniform1i(u_input_density, inputDensity.texture_id);

    const u_horizontal_velocity = gl.getUniformLocation(
      program,
      "u_horizontal_velocity"
    );
    validateDefined({ u_horizontal_velocity });
    gl.uniform1i(u_horizontal_velocity, horizontalVelocity.texture_id);

    const u_vertical_velocity = gl.getUniformLocation(
      program,
      "u_vertical_velocity"
    );
    validateDefined({ u_vertical_velocity });
    gl.uniform1i(u_vertical_velocity, verticalVelocity.texture_id);

    const u_texture_size = gl.getUniformLocation(program, "u_texture_size");
    validateDefined({ u_texture_size });
    gl.uniform2f(
      u_texture_size,
      finalOutputDensity.width,
      finalOutputDensity.height
    );

    const u_dt = gl.getUniformLocation(program, "u_dt");
    validateDefined({ u_dt });
    gl.uniform1f(u_dt, deltaSec);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
