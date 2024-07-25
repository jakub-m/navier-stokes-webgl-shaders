#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

// Empty "p"
void main() {
{
    //for ( i=1 ; i<=N ; i++ ) {
    //    for ( j=1 ; j<=N ; j++ ) {
    //        ...
    //        p[ IX(i,j) ] = 0;
    //    }
    //}

    output_color = vec4(0.0, 0.0, 0.0, 0.0)
}