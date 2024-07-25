#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

uniform sampler2D u_input_density; // "d0" in the Paper
uniform sampler2D u_horizontal_velocity; // "u" in the Paper
uniform sampler2D u_vertical_velocity; // "v" in the Paper

uniform vec2 u_texture_size;
uniform float u_dt;

float getData(sampler2D source);
float getDataAt(sampler2D source, int x, int y);
float getDataAtDXDY(sampler2D source, int dx, int dy);
vec2 fragCoordToResolution();
vec2 resolutionToTextureCoord(vec2 abs_coord);

// Implement "advect" from p.7 of the Paper.
void main() {
    float width = u_texture_size.x;
    float height = u_texture_size.y;

    float dt0 = u_dt * sqrt(width * height);

    vec2 xy_res = fragCoordToResolution();
    float i = xy_res.x;
    float j = xy_res.y;

    float x = i - dt0 * getData(u_horizontal_velocity);
    float y = j - dt0 * getData(u_vertical_velocity);
    if (x < 0.5) x = 0.5;
    if (x > width + 0.5) x = width + 0.5;
    int i0 = int(x);
    int i1 = i0 + 1;
    if (y < 0.5) y = 0.5;
    if (y > height + 0.5) y = height + 0.5;
    int j0 = int(y);
    int j1 = j0 + 1;
    float s1 = x - float(i0);
    float s0 = 1.0 - s1;
    float t1 = y - float(j0);
    float t0 = 1.0 - t1;

    float d = (
        s0 * (
            t0 * getDataAt(u_input_density, i0, j0) +
            t1 * getDataAt(u_input_density, i0, j1)) +
        s1 * (
            t0 * getDataAt(u_input_density, i1, j0) +
            t1 * getDataAt(u_input_density, i1, j1))
        );

    output_color = vec4(d, 1.0, 1.0, 1.0);

//    // set_bnd ( N, b, x ); // TODO implement set_bnd
}