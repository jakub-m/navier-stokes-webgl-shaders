#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

uniform sampler2D u_texture_source;


void main() {
    output_color = texture(u_texture_source, v_input_texture_coord);
}
