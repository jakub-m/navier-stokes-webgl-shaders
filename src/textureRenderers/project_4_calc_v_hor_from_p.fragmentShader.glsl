#version 300 es

precision highp float;

float getData(sampler2D source);
float getDataAt(sampler2D source, int x, int y);
float getDataAtDXDY(sampler2D source, int dx, int dy);
vec2 fragCoordToResolution();
vec2 resolutionToTextureCoord(vec2 abs_coord);

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

uniform sampler2D u_horizontal_velocity;
uniform sampler2D u_p;
uniform vec2 u_texture_size;

// 4. Calculate horizontal velocity based on p
void main() {
    float width = u_texture_size.x;
    float height = u_texture_size.y;
    float h = 1.0/(width * height);

    float velocity_out = getData(u_horizontal_velocity) -
        0.5 * (getDataAtDXDY(u_p,1,0)-getDataAtDXDY(u_p,-1,0)) / h;

    //set_bnd ( N, 1, u ); // TODO
    output_color = vec4(velocity_out, 1, 1, 1);
}
