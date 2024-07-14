#version 300 es

// Vertex shader to draw array of points.

in vec4 a_position;

void main() {
  gl_Position = a_position;
}