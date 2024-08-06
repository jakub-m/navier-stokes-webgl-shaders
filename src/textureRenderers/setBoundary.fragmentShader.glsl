#version 300 es

precision highp float;

float getDataAtDXDY(sampler2D source, int dx, int dy);
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
    float max_x = width - 1;
    float max_y = height - 1;
    vec2 pos = fragCoordToResolution();

    if (pos.x == min_x && pos.y >= 1 && pos.y <= max_y - 1) {
      // x[IX(0 ,i)] = b==1 ? –x[IX(1,i)] : x[IX(1,i)];
      result = u_mode_b == 1 ? -getDataAtDXDY(1, 0) : getDataAtDXDY(1, 0);
    }
    else if (pos.x == max_x && pos.y >= 1 && pos.y <= max_y - 1) {
      // x[IX(N+1,i)] = b==1 ? –x[IX(N,i)] : x[IX(N,i)];
      result = u_mode_b == 1 ? -getDataAtDXDY(-1, 0) : getDataAtDXDY(-1, 0);
    }
    else if (pos.x >= 1 && pos.x <= max_x - 1 && pos.y == min_y) {
      // x[IX(i,0 )] = b==2 ? –x[IX(i,1)] : x[IX(i,1)];
      result = u_mode_b == 2 ? -getDataAtDXDY(0, 1) : getDataAtDXDY(0, 1);
    }
    else if (pos.x >= 1 && pos.x <= max_x - 1 && pos.y == max_y - 1) {
  ///   x[IX(i,N+1)] = b==2 ? –x[IX(i,N)] : x[IX(i,N)];
      result = u_mode_b == 2 ? -getDataAtDXDY(0, -1) : getDataAtDXDY(0, -1);
    }
    else if (pos == vec2(min_x, min_y)) {
      result = 0.5 * (getDataAt(min_x + 1, min_y) + getDataAt(min_x, min_y + 1));
    } else if (pos == vec2(min_x, max_y)) {
      result = 0.5 * (getDataAt(min_x + 1, max_y) + getDataAt(min_x, max_y - 1));
    } else if (pos == vec2(max_x, min_y)) {
      result = 0.5 * (getDataAt(max_x - 1, min_y) + getDataAt(max_x, min_y + 1));
    } else if (pos == vec2(max_x, max_y)) {
      result = 0.5 * (getDataAt(max_x - 1, max_y) + getDataAt(max_x, max_y - 1));
    } else {
      result = getData();
    }

    output_color = vec4(result, 1, 1, 1);
}