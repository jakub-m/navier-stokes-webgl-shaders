// Render texture A to texture B
// Render texture B to texture A
// display A
// display B

import drawTextureToScreenVS from "./shaders/drawTexture.vertexShader.glsl";
import drawTextureToScreenFS from "./shaders/drawTexture.fragmentShader.glsl";
import renderToTextureVS from "./shaders/renderToTexture.vertexShader.glsl";
import renderToTextureFS from "./shaders/renderToTexture.fragmentShader.glsl";

type GL = WebGL2RenderingContext;

const canvasId = "#c";

const TEXTURE_ID_A = 0;
const TEXTURE_ID_B = 1;

function render(args: { [key: string]: any }) {
  const { custom } = args;
  validateDefined({
    custom,
  });
  const gl = getGlContext(canvasId);
  enableExtension(gl, "OES_texture_float_linear"); // Allows rendering float texture (event with gl.NEAREST).
  enableExtension(gl, "EXT_color_buffer_float"); // Allows rendering to float texture.
  // gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  const textureA = new Texture({
    gl,
    texture_id: TEXTURE_ID_A,
    height: 2,
    width: 2,
    type: "float",
  });
  textureA.setValues([0.5, 0.5, 0.5, 0]);

  const textureB = new Texture({
    gl,
    texture_id: TEXTURE_ID_B,
    height: 2,
    width: 2,
    type: "float",
  });
  textureB.setValues([0, 0.5, 0.5, 0.5]);

  var textureRenderer = new TextureRenderer(gl);
  textureRenderer.renderToTexture({ input: textureA, output: textureB });

  var canvasRenderer = new CanvasRenderer(gl);
  canvasRenderer.render(textureA, textureB);
}

const enableExtension = (gl: GL, name: string) => {
  const ext = gl.getExtension(name);
  if (!ext) {
    const version = gl.getParameter(gl.VERSION);
    const lang = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
    throw Error(
      name +
        " extension not available. \n" +
        "GL version: " +
        version +
        ". GLSL version: " +
        lang +
        "\n" +
        "The supported extensions are:\n" +
        gl.getSupportedExtensions()?.join("\n")
    );
  }
};

class CanvasRenderer {
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

function getGlContext(selector: string): GL {
  const canvas = <HTMLCanvasElement>document.querySelector(selector);
  if (canvas === null) {
    throw Error("canvas is missing");
  }
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    throw Error("no webgl2!");
  }
  return gl;
}

interface TextureProps {
  gl: GL;
  texture_id: GLint;
  width: number;
  height: number;
  type: "float" | "rgba";
}

class Texture {
  gl: GL;
  texture: WebGLTexture;
  texture_id: GLint;
  width: number;
  height: number;
  textureType: "float" | "rgba";

  constructor({ gl, texture_id, width, height, type = "rgba" }: TextureProps) {
    this.gl = gl;
    this.texture = gl_createTexture(gl);
    this.texture_id = texture_id;
    this.width = width;
    this.height = height;
    this.textureType = type;
    gl.activeTexture(gl.TEXTURE0 + texture_id);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    initializeTexture(gl, this.width, this.height, this.textureType);
  }

  setValues(data: any) {
    initializeTexture(this.gl, this.width, this.height, this.textureType, data);
  }
}

/**
 * Render program to texture.
 */
class TextureRenderer {
  gl: GL;
  program: WebGLProgram;

  constructor(gl: GL) {
    validateDefined({ gl });
    this.gl = gl;
    this.program = createProgramFromSources(
      gl,
      renderToTextureVS,
      renderToTextureFS
    );
  }

  renderToTexture({ input, output }: { input?: Texture; output: Texture }) {
    var gl = this.gl;
    var program = this.program;
    gl.useProgram(program);

    var a_position_loc = gl.getAttribLocation(program, "a_position");
    var a_texcoord_loc = gl.getAttribLocation(program, "a_texcoord");
    var u_input_texture = gl.getUniformLocation(program, "u_input_texture");
    validateLocation({ a_position_loc, a_texcoord_loc });

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // TODO do it only once, if at all.
    initFullSquareTexturePos(gl, a_texcoord_loc);
    const vertexCount = initFullSquareVertexPos(gl, a_position_loc);
    // TODO do I need to create frame buffer each time, or only once?
    this._attachFramebuffer(gl, output.texture, output.width, output.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (input !== undefined) {
      gl.uniform1i(u_input_texture, input.texture_id);
    }

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

/**
 * data parameter is optional, if null then the data in the texture is undefined.
 */
function initializeTexture(
  gl: GL,
  width: number,
  height: number,
  textureType: "rgba" | "float",
  data?: any
) {
  // TODO here activate!
  validateDefined({ gl, width, height });
  assertEquals({ width, height }, { width: 2, height: 2 });

  // define size and format of level 0
  const level = 0;
  const border = 0;

  var type = null;
  var format = null;
  var internalFormat = null;
  var dataArray = null;

  if (textureType === "rgba") {
    type = gl.UNSIGNED_BYTE;
    format = gl.RGBA;
    internalFormat = gl.RGBA;
    if (data !== undefined) {
      dataArray = new Uint8Array(data);
    }
  } else if (textureType === "float") {
    type = gl.FLOAT;
    format = gl.RED;
    internalFormat = gl.R32F;
    if (data !== undefined) {
      dataArray = new Float32Array(data);
    }
  } else {
    throw Error(`Bad texture type: ${textureType}`);
  }
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    format,
    type,
    dataArray
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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

function assertEquals(
  values: { [key: string]: any },
  expected: { [key: string]: any }
) {
  for (const key of Object.keys(values)) {
    const valueInput = values[key];
    const valueExpected = expected[key];
    if (valueInput !== valueExpected) {
      console.error(
        "For key " +
          key +
          " expected value " +
          valueExpected +
          " but got " +
          valueInput
      );
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

function createProgramFromSources(
  gl: GL,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram {
  var vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    "vertex shader",
    vertexShaderSource
  );
  var fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    "fragment shader",
    fragmentShaderSource
  );
  return createProgram(gl, vertexShader, fragmentShader);
}

function createShader(
  gl: GL,
  type: GLenum,
  name: string,
  source: string
): WebGLShader {
  validateDefined({ gl });
  var shader = gl.createShader(type);
  if (shader === null) {
    throw Error("could not create shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    console.error("createShader " + name, gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }
  return shader;
}

function createProgram(
  gl: GL,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {
  var program = gl.createProgram();
  if (program === null) {
    throw Error("could not create program");
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    console.error("createProgram", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }
  return program;
}

function gl_createTexture(gl: GL): WebGLTexture {
  const t = gl.createTexture();
  if (t === null) {
    throw Error("could not create texture");
  }
  return t;
}

export { render };
