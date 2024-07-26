#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

uniform sampler2D u_horizontal_velocity;
uniform sampler2D u_vertical_velocity;
uniform vec2 u_texture_size;

float getData(sampler2D source);
float getDataAt(sampler2D source, int x, int y);
float getDataAtDXDY(sampler2D source, int dx, int dy);
vec2 fragCoordToResolution();
vec2 resolutionToTextureCoord(vec2 abs_coord);

// Implement "project" from p.10 of the Paper.
// The "project" was split into the following sub-programs:
// 1. Calculate "div"
// 2. Empty "p"
// 3. Calculate p based on div
// 4. Calculate horizontal velocity based on p
// 5. Calculate vertical velocity based on p

// Calculate div.
void main() {
    float width = u_texture_size.x;
    float height = u_texture_size.y;
    float h = 1.0/(width * height);

    //for ( i=1 ; i<=N ; i++ ) {
    //    for ( j=1 ; j<=N ; j++ ) {
    //        div[IX(i,j)] = -0.5 * h * (u[IX(i+1,j)] - u[IX(i-1,j)]+ v[IX(i,j+1)]-v[IX(i,j-1)]);
    //        p[ IX(i,j) ] = 0; // This is moved to other program.
    //    }
    //}

    float out_div = -0.5 * h * (
        getDataAtDXDY(u_horizontal_velocity, 1, 0) -
        getDataAtDXDY(u_horizontal_velocity, -1, 0) +
        getDataAtDXDY(u_vertical_velocity, 0, 1) -
        getDataAtDXDY(u_vertical_velocity, 0, -1));
    
    output_color = vec4(out_div, 1, 1, 1);

    // set_bnd ( N, 0, div ); // TODO set_bnd for div
    // set_bnd ( N, 0, p ); // TODO set_bnd for p
}
