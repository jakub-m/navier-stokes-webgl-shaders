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

float getVelocity(float ds, float dt) {
    float v = 2.0;
    if (dt == 0.0) {
        return 0.0;
    }
    //float v = ds / dt;
    //if (v > 10.0) {
    //    v = 10.0;
    //}
    float dx = u_relative_pos_1.x - v_input_texture_coord.x;
    float dy = u_relative_pos_1.y - v_input_texture_coord.y;
    if (dx * dx + dy * dy < u_relative_radius * u_relative_radius) {
        return v;
    } else {
        return 0.0;
    }
}

void main() {
    float v = 0.0;
    if (u_mode == 0) {
        // horizontal
        float ds = u_relative_pos_1.x - u_relative_pos_0.x;
        float dt = u_time_sec_1 - u_time_sec_0;
        //v = getVelocity(ds, dt);
        if (dt == 0.0) {
            v = 1.0;
        }
        // v = 0.0;
    } else if (u_mode == 1) {
        // vertical
        // v = 1.0;
        //v = getVelocity(u_relative_pos_1.y - u_relative_pos_0.y, u_time_sec_1 - u_time_sec_0);
    }
    output_color = vec4(v, 1, 1, 1);
}

