#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

// Initial density, x0 in the paper
uniform sampler2D u_initial_density;

// The output density, x in the paper. The output of the shader is swapped with u_output_density in the next
// iteration, so in the share we can freely operate on the prevoius "snapshot" of the output and produce new
// output at the same time.
uniform sampler2D u_output_density;

void main() {
    output_color = texture(u_initial_density, v_input_texture_coord);
}
