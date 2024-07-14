#version 300 es
 
in vec2 a_position;
in vec2 a_texcoord;

uniform vec2 u_resolution;
// Offset, in pixels
uniform vec2 u_offset;
// "varying" variable is called for each output pixel in the
// fragment shader for the rectangle.
out vec2 v_texcoord;

void main() {
  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = (a_position + u_offset) / u_resolution;
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  //v_color = gl_Position * 0.5 + 0.5;
  v_texcoord = a_texcoord;
  //v_texcoord = gl_Position.xy * 0.5 + 0.5;
}