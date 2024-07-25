#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

uniform sampler2D u_horizontal_velocity;
uniform sampler2D u_p;

uniform vec2 u_texture_size;

float getData(sampler2D source);
float getDataAtDXDY(sampler2D source, int dx, int dy);

// 4. Calculate horizontal velocity based on p
void main() {
{
    float width = u_texture_size.x;
    float height = u_texture_size.y;
    float h = 1.0/(width * height);

    float u_out = getData(u_horizontal_velocity) -
        0.5 * (getDataAtDXDY(u_p,1,0)-getDataAtDXDY(u_p,-1,0)) / h;

    //set_bnd ( N, 1, u ); // TODO
}
