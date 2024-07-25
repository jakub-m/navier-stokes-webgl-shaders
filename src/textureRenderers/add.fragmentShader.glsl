#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

uniform sampler2D u_texture_a;
uniform sampler2D u_texture_b;
uniform float u_modifier_b;

// Shader adding values of two texture to another texture
void main() {
    vec4 a = texture(u_texture_a, v_input_texture_coord);
    vec4 b = texture(u_texture_b, v_input_texture_coord);
    output_color = vec4(a[0] + u_modifier_b * b[0], 1.0, 1.0, 1.0);
}