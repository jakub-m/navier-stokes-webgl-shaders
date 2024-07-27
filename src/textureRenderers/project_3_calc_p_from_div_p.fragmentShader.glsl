#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

uniform vec2 u_texture_size;
uniform sampler2D u_p;
uniform sampler2D u_div;

float getData(sampler2D source);
float getDataAt(sampler2D source, int x, int y);
float getDataAtDXDY(sampler2D source, int dx, int dy);
vec2 fragCoordToResolution();
vec2 resolutionToTextureCoord(vec2 abs_coord);

// Calculate p based on div.
// This program must be run k=20 times on p.
void main() {
    float out_p = (
        getData(u_div) + 
        getDataAtDXDY(u_p, -1, 0),
        getDataAtDXDY(u_p, 1,0),
        getDataAtDXDY(u_p, 0,-1),
        getDataAtDXDY(u_p, 0,1)) / 4.0;
//    set_bnd ( N, 0, p ); // TODO set bnd for p
    output_color = vec4(out_p, 1, 1, 1);
}
