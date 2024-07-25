#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

uniform sampler2D u_vertical_velocity;
uniform sampler2D u_p;

uniform vec2 u_texture_size;

float getData(sampler2D source);
float getDataAtDXDY(sampler2D source, int dx, int dy);

// Calculate vertical velocity based on p
void main() {
{
    float width = u_texture_size.x;
    float height = u_texture_size.y;
    float h = 1.0/(width * height);

    float out_v = getData(u_vertical_velocity) -
        0.5 * (
            getDataAtDXDY(u_p, 0,+1) -
            getDataAtDXDY(u_p, 0,-1)) / h;

    //set_bnd ( N, 2, v ); // TODO

    output_color = vec4(out_v, 1.0, 1.0, 1.0);
}