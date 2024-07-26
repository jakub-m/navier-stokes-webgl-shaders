import drawTextureToScreenVS from "./shaders/drawTextureToScreen.vertexShader.glsl";
import drawTextureToScreenFS from "./shaders/drawTextureToScreen.fragmentShader.glsl";
import commonFS from "./textureRenderers/common.fragmentShader.glsl";

export type GL = WebGL2RenderingContext;

export const initializeGl = (selector: string): GL => {
  const gl = getGlContext(selector);
  enableExtension(gl, "OES_texture_float_linear"); // Allows rendering float texture, need also for gl.NEAREST.
  enableExtension(gl, "EXT_color_buffer_float"); // Allows rendering to float texture.
  return gl;
};

const enableExtension = (gl: GL, name: string) => {
  const ext = gl.getExtension(name);
  if (!ext) {
    const version = gl.getParameter(gl.VERSION);
    const lang = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
    const extensions = gl.getSupportedExtensions()?.join("\n");
    throw Error(
      `${name}  extension not available. \nGL version: ${version}.\nGLSL version: ${lang}.\nSupported extensions: \n${extensions}`
    );
  }
};

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

/** Get WebGL context */
export const getGlContext = (selector: string): GL => {
  const canvas = <HTMLCanvasElement>document.querySelector(selector);
  if (canvas === null) {
    throw Error("canvas is missing");
  }
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    throw Error("no webgl2!");
  }
  return gl;
};

interface TextureProps {
  gl: GL;
  texture_id: GLint;
  width: number;
  height: number;
  type: "float" | "rgba";
}

export class Texture {
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

  fill(value: number): Texture {
    const data = Array(this.width * this.height).fill(value);
    this.setValues(data);
    return this;
  }

  setValues(data: any): Texture {
    initializeTexture(this.gl, this.width, this.height, this.textureType, data);
    return this;
  }
}

///**
// * DEPRECATE
// * Render program to texture.
// */
//export class TextureRenderer {
//  gl: GL;
//  program: WebGLProgram;
//
//  constructor(gl: GL, vertexShader: string, fragmentShader: string) {
//    validateDefined({ gl });
//    this.gl = gl;
//    this.program = createProgramFromSources(gl, vertexShader, fragmentShader);
//  }
//
//  /**
//   * @param inputTextures is a mapping of variable name ("uniform location") to Texture.
//   */
//  renderToTexture({
//    inputs,
//    intervalMs,
//    output,
//  }: {
//    inputs?: { [loc: string]: Texture };
//    intervalMs?: number;
//    output: Texture;
//  }) {
//    var gl = this.gl;
//    var program = this.program;
//    gl.useProgram(program);
//
//    var a_position_loc = gl.getAttribLocation(program, "a_position");
//    var a_texcoord_loc = gl.getAttribLocation(program, "a_texcoord");
//    var u_texture_size = gl.getUniformLocation(program, "u_texture_size");
//    var u_dt = gl.getUniformLocation(program, "u_dt");
//
//    validateLocation({
//      a_position_loc,
//      a_texcoord_loc,
//      u_dt,
//      // u_texture_size,
//    });
//
//    var vao = gl.createVertexArray();
//    gl.bindVertexArray(vao);
//
//    // TODO do it only once, if at all.
//    initFullSquareTexturePos(gl, a_texcoord_loc);
//    const vertexCount = initFullSquareVertexPos(gl, a_position_loc);
//    // TODO do I need to create frame buffer each time, or only once?
//    this._attachFramebuffer(gl, output.texture, output.width, output.height);
//
//    gl.clearColor(0, 0, 0, 0);
//    gl.clear(gl.COLOR_BUFFER_BIT);
//    const [width, height] = [output.width, output.height];
//    gl.uniform2f(u_texture_size, width, height);
//
//    const setUniform1iLoc = (
//      tex: Texture | undefined,
//      loc: WebGLUniformLocation | null,
//      message: string
//    ) => {
//      if (tex === undefined) {
//        console.log(`Skip setting ${message}`);
//        return;
//      }
//      validateTexturesHaveSameSize([output, tex]);
//      gl.uniform1i(loc, tex.texture_id);
//    };
//
//    if (inputs !== undefined) {
//      Object.keys(inputs).forEach((u_variable_name) => {
//        var u_loc = gl.getUniformLocation(program, u_variable_name);
//        const texture = inputs[u_variable_name];
//        setUniform1iLoc(texture, u_loc, u_variable_name);
//      });
//    }
//
//    if (intervalMs !== undefined) {
//      gl.uniform1f(u_dt, intervalMs / 1000);
//    }
//
//    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
//  }
//
//  _attachFramebuffer(
//    gl: GL,
//    texture: WebGLTexture,
//    width: number,
//    height: number
//  ) {
//    const fb = gl.createFramebuffer();
//    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
//    gl.viewport(0, 0, width, height);
//    const attachmentPoint = gl.COLOR_ATTACHMENT0;
//    const level = 0;
//    gl.framebufferTexture2D(
//      gl.FRAMEBUFFER,
//      attachmentPoint,
//      gl.TEXTURE_2D,
//      texture,
//      level
//    );
//  }
//}

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
export const validateDefined = (args: { [key: string]: any }) => {
  for (const key of Object.keys(args)) {
    const v = args[key];
    if (v === null || v === undefined) {
      console.error("Value not defined:", key, "=", args[key]);
    }
  }
};

const validateLocation = (args: { [key: string]: any }) => {
  for (const key of Object.keys(args)) {
    const v = args[key];
    if (v === null || v < 0) {
      console.error("Bad location:", key, "=", args[key]);
    }
  }
};

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

export const createProgramFromSources = (
  gl: GL,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram => {
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
};

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
    console.error(
      `createShader ${name} ${gl.getShaderInfoLog(
        shader
      )}\n\n${annotateLineNumbers(source)}`
    );
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

/**
 * Set up attributes and framebuffer to render a rectangular output.
 * @returns vertex count
 */
export const prepareProgramToRenderOutput = (
  gl: GL,
  program: WebGLProgram,
  output: Texture
): number => {
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
  attachFramebuffer(gl, output.texture, output.width, output.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return vertexCount;
};

/**
 * Set 6 vertices so they form a rectangle covering whole viewport.
 */
const initFullSquareVertexPos = (gl: GL, a_position_loc: GLint) => {
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
};

const initFullSquareTexturePos = (gl: GL, a_texcoord_loc: GLint) => {
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
};

const attachFramebuffer = (
  gl: GL,
  texture: WebGLTexture,
  width: number,
  height: number
) => {
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
};

function gl_createTexture(gl: GL): WebGLTexture {
  const t = gl.createTexture();
  if (t === null) {
    throw Error("could not create texture");
  }
  return t;
}

export const assertEquals = (
  values: { [key: string]: any },
  expected: { [key: string]: any },
  message: string
) => {
  for (const key of Object.keys(values)) {
    const valueInput = values[key];
    const valueExpected = expected[key];
    if (valueInput !== valueExpected) {
      throw Error(
        `${message}. For key ${key} expected value ${valueExpected} but got ${valueInput}`
      );
    }
  }
};

export const validateTexturesHaveSameSize = (textures: Texture[]) => {
  if (textures.length === 0) {
    return;
  }
  const t = textures[0];
  const [w, h] = [t.width, t.height];
  for (var p of textures) {
    if (w === p.width && h === p.height) {
      continue;
    }
    throw Error(
      `Textures have different sizes: [${w}, ${h}] and [${p.width}, ${p.height}]`
    );
  }
};

export const appendCommonGlsl = (source: string): string => {
  return `${source}\n${commonFS}`;
};

const annotateLineNumbers = (s: string): string => {
  return s
    .split("\n")
    .map((s, i) => `${i + 1}\t${s}`)
    .join("\n");
};
