#version 300 es

precision highp float;

float getData(sampler2D source);
float getDataAtDXDY(sampler2D source, int dx, int dy);
float getDataAt(sampler2D source, int x, int y);
vec2 fragCoordToResolution();
vec2 resolutionToTextureCoord(vec2 abs_coord);

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

uniform sampler2D u_input;
uniform vec2 u_texture_size;
uniform int u_mode_b;

void main() {
    float result;
    float width = u_texture_size.x;
    float height = u_texture_size.y;
    float min_x = 0.0;
    float min_y = 0.0;
    float max_x = width - 1.0;
    float max_y = height - 1.0;
    vec2 pos = fragCoordToResolution();

    // Left side, without corners. b==1 reverses the values at the almost-left line, otherwise sets the same values.
    if (pos.x == min_x && pos.y >= 1.0 && pos.y <= max_y - 1.0) {
      // x[IX(0 ,i)] = b==1 ? –x[IX(1,i)] : x[IX(1,i)];
      result = u_mode_b == 1 ? -getDataAtDXDY(u_input, 1, 0) : getDataAtDXDY(u_input, 1, 0);
    }
    // Right side.
    else if (pos.x == max_x && pos.y >= 1.0 && pos.y <= max_y - 1.0) {
      // x[IX(N+1,i)] = b==1 ? –x[IX(N,i)] : x[IX(N,i)];
      result = u_mode_b == 1 ? -getDataAtDXDY(u_input, -1, 0) : getDataAtDXDY(u_input, -1, 0);
    }
    // Top. b == 2 reverses the values at the almost-top, otherwise just rewrites the values.
    else if (pos.x >= 1.0 && pos.x <= max_x - 1.0 && pos.y == min_y) {
      // x[IX(i,0 )] = b==2 ? –x[IX(i,1)] : x[IX(i,1)];
      result = u_mode_b == 2 ? -getDataAtDXDY(u_input, 0, 1) : getDataAtDXDY(u_input, 0, 1);
    }
    // Bottom.
    else if (pos.x >= 1.0 && pos.x <= max_x - 1.0 && pos.y == max_y - 1.0) {
  ///   x[IX(i,N+1)] = b==2 ? –x[IX(i,N)] : x[IX(i,N)];
      result = u_mode_b == 2 ? -getDataAtDXDY(u_input, 0, -1) : getDataAtDXDY(u_input, 0, -1);
    }
    // Corners
    else if (pos == vec2(min_x, min_y)) {
      result = 0.5 * (getDataAt(u_input, int(min_x + 1.0), int(min_y)) + getDataAt(u_input, int(min_x), int(min_y + 1.0)));
    } else if (pos == vec2(min_x, max_y)) {
      result = 0.5 * (getDataAt(u_input, int(min_x + 1.0), int(max_y)) + getDataAt(u_input, int(min_x), int(max_y - 1.0)));
    } else if (pos == vec2(max_x, min_y)) {
      result = 0.5 * (getDataAt(u_input, int(max_x - 1.0), int(min_y)) + getDataAt(u_input, int(max_x), int(min_y + 1.0)));
    } else if (pos == vec2(max_x, max_y)) {
      result = 0.5 * (getDataAt(u_input, int(max_x - 1.0), int(max_y)) + getDataAt(u_input, int(max_x), int(max_y - 1.0)));
    } else {
      result = getData(u_input);
    }

    output_color = vec4(result, 1, 1, 1);
}