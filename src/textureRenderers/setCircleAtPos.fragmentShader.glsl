#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;
uniform float u_relative_radius;
uniform vec2 u_relative_pos;

// Shader copying texture to another texture.
void main() {
    float dx = u_relative_pos.x - v_input_texture_coord.x;
    float dy = u_relative_pos.y - v_input_texture_coord.y;
    if (dx * dx + dy * dy < u_relative_radius * u_relative_radius) {
        output_color = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
        output_color = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
