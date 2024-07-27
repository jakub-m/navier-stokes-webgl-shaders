import genericVertexShader from "./generic.vertexShader.glsl";
import project_1_calc_div_fragmentShader from "./project_1_calc_div.fragmentShader.glsl";
import project_2_empty_p_fragmentShader from "./project_2_empty_p.fragmentShader.glsl";
import project_3_calc_p_from_div_p_fragmentShader from "./project_3_calc_p_from_div_p.fragmentShader.glsl";
import project_4_calc_v_hor_from_p_fragmentShader from "./project_4_calc_v_hor_from_p.fragmentShader.glsl";
//import project_5_calc_v_ver_from_p_fragmentShader from "./project_5_calc_v_ver_from_p.fragmentShader.glsl"

import {
  GL,
  Texture,
  createProgramFromSources,
  validateTexturesHaveSameSize,
  prepareProgramToRenderOutput,
  validateDefined,
  appendCommonGlsl,
  swap,
} from "../webGlUtil";
import { CopyRenderer } from "./copyRenderer";
import { validate } from "webpack";

const IN = 0;
const OUT = 1;

/**
 * A renderer that implements "project" function from p. 10 of the Paper.
 */
export class ProjectRenderer {
  private gl: GL;
  private program1_calcDiv: WebGLProgram;
  private program2_emptyP: WebGLProgram;
  private program3_calcPFromDiv: WebGLProgram;
  private program4_calcHorVel: WebGLProgram;
  private copyRenderer: CopyRenderer;

  constructor(gl: GL) {
    this.gl = gl;
    this.copyRenderer = new CopyRenderer(gl);
    this.program1_calcDiv = createProgramFromSources(
      gl,
      genericVertexShader,
      appendCommonGlsl(project_1_calc_div_fragmentShader)
    );

    this.program2_emptyP = createProgramFromSources(
      gl,
      genericVertexShader,
      project_2_empty_p_fragmentShader
    );

    this.program3_calcPFromDiv = createProgramFromSources(
      gl,
      genericVertexShader,
      appendCommonGlsl(project_3_calc_p_from_div_p_fragmentShader)
    );

    this.program4_calcHorVel = createProgramFromSources(
      gl,
      genericVertexShader,
      appendCommonGlsl(project_4_calc_v_hor_from_p_fragmentShader)
    );
  }

  /**
   * The "temp" textures are used internally for intermediate calculations,
   * the resulting value can be discarded by the caller.
   */
  render(
    inputHorizontalVelocity: Texture, // u
    inputVerticalVelocity: Texture, // v
    tempDiv: Texture,
    tempPIn: Texture,
    tempPOut: Texture,
    outputHorizontalVelocity: Texture,
    outputVerticalVelocity: Texture
  ) {
    validateTexturesHaveSameSize([
      inputHorizontalVelocity,
      inputVerticalVelocity,
      tempDiv,
      tempPIn,
      tempPOut,
    ]);
    this.renderCalcDiv(inputHorizontalVelocity, inputVerticalVelocity, tempDiv);
    this.renderEmptyP(tempPIn);
    const tempP = this.renderCalcPFromDiv(tempDiv, tempPIn, tempPOut);
    //this.renderCalcHorizontalVelocity(
    //  inputHorizontalVelocity,
    //  tempP,
    //  outputHorizontalVelocity
    //);
  }

  private renderCalcDiv(
    inputHorizontalVelocity: Texture,
    inputVerticalVelocity: Texture,
    tempDiv: Texture
  ) {
    const gl = this.gl;
    const program = this.program1_calcDiv;
    gl.useProgram(program);
    const vertexCount = prepareProgramToRenderOutput(gl, program, tempDiv);

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

  private renderEmptyP(tempP: Texture) {
    const gl = this.gl;
    const program = this.program2_emptyP;
    gl.useProgram(program);
    const vertexCount = prepareProgramToRenderOutput(gl, program, tempP);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }

  /**
   * tempPIn and Out hold the "in" and "out" direction only for the first iteration. After that
   * they are swapped. The final P output is returned by the method.
   */
  private renderCalcPFromDiv(
    tempDiv: Texture,
    tempPIn: Texture,
    tempPOut: Texture
  ): Texture {
    const temps = [tempPIn, tempPOut];

    const renderPFromDivOnce = (temps: Texture[]) => {
      const gl = this.gl;
      const program = this.program3_calcPFromDiv;
      gl.useProgram(program);

      const vertexCount = prepareProgramToRenderOutput(gl, program, temps[OUT]);

      const u_p = gl.getUniformLocation(program, "u_p");
      validateDefined({ u_p });
      gl.uniform1i(u_p, temps[IN].texture_id);

      const u_div = gl.getUniformLocation(program, "u_div");
      validateDefined({ u_div });
      gl.uniform1i(u_div, tempDiv.texture_id);

      const u_texture_size = gl.getUniformLocation(program, "u_texture_size");
      validateDefined({ u_texture_size });
      gl.uniform2f(u_texture_size, tempDiv.width, tempDiv.height);

      gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    };

    renderPFromDivOnce(temps);
    for (var i = 0; i < 20; i++) {
      swap(temps);
      renderPFromDivOnce(temps);
    }

    return temps[OUT];
  }

  private renderCalcHorizontalVelocity(
    horizontalVelocityIn: Texture,
    tempP: Texture,
    horizontalVelocityOut: Texture
  ) {
    const gl = this.gl;
    const program = this.program4_calcHorVel;
    gl.useProgram(program);
    const vertexCount = prepareProgramToRenderOutput(
      gl,
      program,
      horizontalVelocityOut
    );

    const u_horizontal_velocity = gl.getUniformLocation(
      program,
      "u_horizontal_velocity"
    );
    validateDefined({ u_horizontal_velocity });

    const u_p = gl.getUniformLocation(program, "u_p");
    gl.uniform1i(u_horizontal_velocity, horizontalVelocityIn.texture_id);
    validateDefined({ u_p });
    gl.uniform1i(u_p, tempP.texture_id);

    const u_texture_size = gl.getUniformLocation(program, "u_texture_size");
    validateDefined({ u_texture_size });
    gl.uniform2f(
      u_texture_size,
      horizontalVelocityIn.width,
      horizontalVelocityIn.height
    );

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}
