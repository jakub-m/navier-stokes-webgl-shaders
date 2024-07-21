#version 300 es

// Positions are in [-1, 1] cull space.

in vec4 a_position;
in vec2 a_texcoord;

out vec4 v_position;
out vec2 v_input_texture_coord;

void main() {
  gl_Position = a_position;
  v_position = a_position;
  v_input_texture_coord = a_texcoord;
}