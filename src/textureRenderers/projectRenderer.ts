import genericVertexShader from "./generic.vertexShader.glsl";
import project_1_calc_div_fragmentShader from "./project_1_calc_div.fragmentShader.glsl";
//import project_2_empty_p_fragmentShader from "./project_2_empty_p.fragmentShader.glsl"
//import project_3_calc_p_from_div_p_fragmentShader from "./project_3_calc_p_from_div_p.fragmentShader.glsl"
//import project_4_calc_v_hor_from_p_fragmentShader from "./project_4_calc_v_hor_from_p.fragmentShader.glsl"
//import project_5_calc_v_ver_from_p_fragmentShader from "./project_5_calc_v_ver_from_p.fragmentShader.glsl"

import {
  GL,
  Texture,
  createProgramFromSources,
  validateTexturesHaveSameSize,
  prepareProgramToRenderOutput,
  validateDefined,
  appendCommonGlsl,
} from "../webGlUtil";

//import { CopyRenderer } from "./copyRenderer";

/**
 * A renderer that implements "project" function from p. 10 of the Paper.
 */

export class ProjectRenderer {
  private gl: GL;
  private program1_calcDiv: WebGLProgram;

  constructor(gl: GL) {
    this.gl = gl;
    this.program1_calcDiv = createProgramFromSources(
      gl,
      genericVertexShader,
      appendCommonGlsl(project_1_calc_div_fragmentShader)
    );
  }

  render(
    inputHorizontalVelocity: Texture, // u
    inputVerticalVelocity: Texture, // v
    tempDiv: Texture
    // tempP: Texture,
    // outputHorizontalVelocity: Texture,
    // outputVerticalVelocity: Texture,
  ) {
    validateTexturesHaveSameSize([
      inputHorizontalVelocity,
      inputVerticalVelocity,
      tempDiv,
    ]);
    this.renderCalcDiv(inputHorizontalVelocity, inputVerticalVelocity, tempDiv);
  }

  private renderCalcDiv(
    inputHorizontalVelocity: Texture,
    inputVerticalVelocity: Texture,
    tempDiv: Texture
  ) {
    const gl = this.gl;
    const program = this.program1_calcDiv;
    gl.useProgram(program);
    const vertexCount = prepareProgramToRenderOutput(
      gl,
      this.program1_calcDiv,
      tempDiv
    );

    const u_horizontal_velocity = gl.getUniformLocation(
      program,
      "u_horizontal_velocity"
    );
    validateDefined({ u_horizontal_velocity });
    gl.uniform1i(u_horizontal_velocity, inputHorizontalVelocity.texture_id);

    const u_vertical_velocity = gl.getUniformLocation(
      program,
      "u_vertical_velocity"
    );
    validateDefined({ u_vertical_velocity });
    gl.uniform1i(u_vertical_velocity, inputVerticalVelocity.texture_id);

    const u_texture_size = gl.getUniformLocation(program, "u_texture_size");
    validateDefined({ u_texture_size });
    gl.uniform2f(
      u_texture_size,
      inputHorizontalVelocity.width,
      inputHorizontalVelocity.height
    );

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
