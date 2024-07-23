import copyFragmentShader from "./copy.fragmentShader.glsl";
import genericVertexShader from "./generic.vertexShader.glsl";

import {
  GL,
  Texture,
  createProgramFromSources,
  assertEquals,
} from "../webGlUtil";

/**
 * A texture renderer that copies texture to other texture.
 */
export class CopyRenderer {
  gl: GL;
  program: WebGLProgram;

  constructor(gl: GL) {
    validateDefined({ gl });
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      genericVertexShader,
      copyFragmentShader
    );
  }

  renderToTexture({ input, output }: { input: Texture; output: Texture }) {
    var gl = this.gl;
    var program = this.program;
    gl.useProgram(program);

    // TODO move this to common
    var a_position_loc = gl.getAttribLocation(program, "a_position");
    var a_texcoord_loc = gl.getAttribLocation(program, "a_texcoord");
    validateLocation({
      a_position_loc,
      a_texcoord_loc,
    });

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    initFullSquareTexturePos(gl, a_texcoord_loc);
    const vertexCount = initFullSquareVertexPos(gl, a_position_loc);
    this._attachFramebuffer(gl, output.texture, output.width, output.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // TODO end common

    const [width, height] = [output.width, output.height];
    var u_texture_source = gl.getUniformLocation(program, "u_texture_source");
    assertEquals(
      { width: input.width, height: input.height },
      { width, height },
      `u_texture_source side does not match the output`
    );
    gl.uniform1i(u_texture_source, input.texture_id);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }

  _attachFramebuffer(
    gl: GL,
    texture: WebGLTexture,
    width: number,
    height: number
  ) {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.viewport(0, 0, width, height);
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      attachmentPoint,
      gl.TEXTURE_2D,
      texture,
      level
    );
  }
}

/**
 * Set 6 vertices so they form a rectangle covering whole viewport.
 */
function initFullSquareVertexPos(gl: GL, a_position_loc: GLint) {
  validateDefined({ gl, a_position_loc });
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(a_position_loc);
  gl_vertexAttribPointer({
    gl,
    index: a_position_loc,
    size: 2,
    type: gl.FLOAT,
    normalize: false,
    stride: 0,
    offset: 0,
  });

  const w = 1;
  const h = 1;

  // -w, h  | w, h
  // -w, -h | w, -h
  const vertices = [-w, -h, w, h, -w, h, -w, -h, w, -h, w, h];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  return vertices.length / 2;
}

function initFullSquareTexturePos(gl: GL, a_texcoord_loc: GLint) {
  validateDefined({ gl, a_texcoord_loc });
  var texBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
  // The texture positions must correspond to the vertices positions.
  const texPositions = [0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1];
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(texPositions),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(a_texcoord_loc);
  gl_vertexAttribPointer({
    gl,
    index: a_texcoord_loc,
    size: 2, // 2 components per iteration
    type: gl.FLOAT,
    normalize: true, // convert from 0-255 to 0.0-1.0
    stride: 0,
    offset: 0,
  });
}

interface gl_vertexAttribPointerParams {
  gl: GL;
  index: GLint;
  size: number;
  type: any;
  normalize: boolean;
  stride: number;
  offset: number;
}
function gl_vertexAttribPointer({
  gl,
  index,
  size,
  type,
  normalize,
  stride,
  offset,
}: gl_vertexAttribPointerParams) {
  validateDefined({ gl, index, size, type, normalize, stride, offset });
  gl.vertexAttribPointer(index, size, type, normalize, stride, offset);
}

/** Validate that all the keys have defined values. */
function validateDefined(args: { [key: string]: any }) {
  for (const key of Object.keys(args)) {
    const v = args[key];
    if (v === null || v === undefined) {
      console.error("Value not defined:", key, "=", args[key]);
    }
  }
}

function validateLocation(args: { [key: string]: any }) {
  for (const key of Object.keys(args)) {
    const v = args[key];
    if (v === null || v < 0) {
      console.error("Bad location:", key, "=", args[key]);
    }
  }
}

/**
 * Ensure that the canvas has the same number of pixels as displayed on the screen. This is no obvious
 * because you could have canvas that has logically 10x10 pixels displayed as 40x40 picture on screen.
 */
function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement | OffscreenCanvas
) {
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
}
