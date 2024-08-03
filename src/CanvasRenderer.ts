import drawTextureToScreenVS from "./shaders/drawTextureToScreen.vertexShader.glsl";
import drawTextureToScreenFS from "./shaders/drawTextureToScreen.fragmentShader.glsl";

import {
  GL,
  createProgramFromSources,
  Texture,
  validateLocation,
  initFullSquareVertexPos,
  initFullSquareTexturePos,
} from "./webGlUtil";

export class CanvasRenderer {
  gl: GL;
  program: WebGLProgram;
  constructor(gl: GL) {
    resizeCanvasToDisplaySize(gl.canvas);
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      drawTextureToScreenVS,
      drawTextureToScreenFS
    );
  }

  render(textureA?: Texture, textureB?: Texture) {
    var gl = this.gl;
    var program = this.program;
    gl.useProgram(program);

    var a_position_loc = gl.getAttribLocation(program, "a_position");
    var a_texcoord_loc = gl.getAttribLocation(program, "a_texcoord");
    var u_texture_a_loc = gl.getUniformLocation(program, "u_texture_a");
    var u_texture_b_loc = gl.getUniformLocation(program, "u_texture_b");
    validateLocation({ a_position_loc, a_texcoord_loc });

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // TODO Is this initialization needed each time or once?
    const vertexCount = initFullSquareVertexPos(gl, a_position_loc);
    initFullSquareTexturePos(gl, a_texcoord_loc);

    var hasTexture = false;
    if (textureA !== undefined) {
      gl.uniform1i(u_texture_a_loc, textureA.texture_id);
      hasTexture = true;
    }
    if (textureB !== undefined) {
      gl.uniform1i(u_texture_b_loc, textureB.texture_id);
      hasTexture = true;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Render to the canvas.

    if (hasTexture) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // gl.NEAREST_MIPMAP_LINEAR is default
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}

/**
 * Ensure that the canvas has the same number of pixels as displayed on the screen. This is no obvious
 * because you could have canvas that has logically 10x10 pixels displayed as 40x40 picture on screen.
 */
const resizeCanvasToDisplaySize = (
  canvas: HTMLCanvasElement | OffscreenCanvas
) => {
  if (canvas instanceof OffscreenCanvas) {
    return;
  }
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  // width - number of logical pixels
  // clientWidth - number of pixels occupied on the screen

  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
  return needResize;
};
