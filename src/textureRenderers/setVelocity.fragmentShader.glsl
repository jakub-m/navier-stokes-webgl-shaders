#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

uniform float u_relative_radius;
uniform vec2 u_relative_pos_0;
uniform float u_time_sec_0;
uniform vec2 u_relative_pos_1;
uniform float u_time_sec_1;
// mode 0 = horizontal, 1 = vertical
uniform int u_mode;

void main() {
    float base_vel = 200.0;
    vec2 delta_pos = u_relative_pos_1 - u_relative_pos_0;
    //float v_tot = length(delta_pos) * v_multiplier;
    //float dt = u_time_sec_1 - u_time_sec_0;
    float dt = 1.0;
    float v = 0.0;
    //float v = v_tot;
    if (u_mode == 0) {
        // vertical
        v = delta_pos.x / dt * base_vel;
    } else if (u_mode == 1) {
        // horizontal
        v = delta_pos.y / dt * base_vel;
    }

    // BUG: No idea why both times are equal.
    //if (u_time_sec_0 > 1722699570.0 + 240.0 ) {
    //    v = 10.0;
    //}
    //if (u_time_sec_1 == u_time_sec_0) { // what???
    //    v = 10.0;
    //}

    // Render circle with radius.
    float dx = u_relative_pos_1.x - v_input_texture_coord.x;
    float dy = u_relative_pos_1.y - v_input_texture_coord.y;
    if (dx * dx + dy * dy < u_relative_radius * u_relative_radius) {
        output_color = vec4(v, 1.0, 1.0, 1.0);
    } else {
        output_color = vec4(0.0, 0.0, 0.0, 0.0);
    }
}

