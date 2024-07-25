#version 300 es

precision highp float;

vec2 resolutionToTextureCoord(vec2 abs_coord);
float getDataAtDXDY(sampler2D source, int dx, int dy);
vec2 fragCoordToResolution();

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

// Initial density, x0 in the paper
uniform sampler2D u_initial_density;

// The output density, x in the paper. The output of the shader is swapped with u_output_density in the next
// iteration, so in the share we can freely operate on the prevoius "snapshot" of the output and produce new
// output at the same time.
uniform sampler2D u_prev_density;

// Width and height of the texture.
uniform vec2 u_texture_size;

// diff is the diffusion rate.
uniform float u_diff;

// u_dt is the interval, a fraction of the second.
uniform float u_dt;

// Implement "diffuse" function from page 6 of the paper. This is a single diffuse step,
// the shader needs to be run k=20 times for a single full diffusion cycle.
void main() {
    float width = u_texture_size.x;
    float height = u_texture_size.y;

    float a = u_dt * u_diff * width * height;

    float surrounding = (
        getDataAtDXDY(u_prev_density, -1, 0) + 
        getDataAtDXDY(u_prev_density, +1, 0) + 
        getDataAtDXDY(u_prev_density, 0, -1) + 
        getDataAtDXDY(u_prev_density, 0, +1));
    
    float x0 = getDataAtDXDY(u_initial_density, 0, 0); // To optimize, no need to use getDataAtDXDY.
    float d = (x0 + a * surrounding) / (1.0 + 4.0 * a);
    //output_color = vec4(d, 1.0, 1.0, 1.0);
    output_color = vec4(d, 1.0, 1.0, 1.0);

    // TODO implement set_bnd
    // set_bnd ( N, b, x );
}