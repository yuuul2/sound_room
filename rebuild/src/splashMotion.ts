/** Draw-time motion of the original texture only. No replacement artwork or new stars. */
export const splashVertex = `
attribute vec2 position;
varying vec2 uv;
void main(){uv=vec2((position.x+1.0)*0.5,(1.0-position.y)*0.5);gl_Position=vec4(position,0.0,1.0);}
`;
export const splashFragment = `
precision highp float;
varying vec2 uv;
uniform sampler2D picture;
uniform vec2 cover;
uniform float time;
uniform float dark;
uniform float saturation;
uniform vec2 stars[8];
float oval(vec2 p,vec2 center,vec2 radius){float d=length((p-center)/radius);return 1.0-smoothstep(0.65,1.15,d);}
void main(){
 vec2 p=(uv-0.5)*cover+0.5;
 float horizon=mix(0.652,0.674,dark);
 vec2 boatCenter=mix(vec2(0.261,0.662),vec2(0.266,0.682),dark);
 float boat=oval(p,boatCenter,vec2(0.061,0.038));
 float foreground=clamp(oval(p,vec2(0.02,0.89),vec2(0.25,0.19))+oval(p,vec2(0.98,0.88),vec2(0.20,0.17))+smoothstep(0.93,1.0,p.y),0.0,1.0);
 float clouds=clamp(oval(p,vec2(0.03,0.055),vec2(0.37,0.12))+oval(p,vec2(0.995,0.23),vec2(0.20,0.28))+oval(p,vec2(0.03,0.46),vec2(0.32,0.19))+foreground,0.0,1.0);
 vec2 moonCenter=mix(vec2(0.572,0.255),vec2(0.556,0.279),dark);
 float moon=oval(p,moonCenter,vec2(0.115,0.078));
 clouds*=1.0-moon;
 float water=smoothstep(horizon,horizon+0.018,p.y)*(1.0-foreground)*(1.0-boat);
 vec2 q=p;
 q.x+=clouds*0.003*(sin(time*0.17+p.y*5.0)-sin(p.y*5.0));
 q.y+=clouds*0.00065*(sin(time*0.21+p.x*4.0)-sin(p.x*4.0));
 q.x+=water*0.0015*(sin(p.y*190.0-time*0.6)-sin(p.y*190.0));
 q.y+=water*0.00055*(sin(p.x*38.0+p.y*90.0+time*0.5)-sin(p.x*38.0+p.y*90.0));
 float angle=sin(time*0.39)*0.010;
 vec2 local=p-boatCenter;
 vec2 rotated=vec2(cos(angle)*local.x-sin(angle)*local.y*2.0,sin(angle)*local.x*0.5+cos(angle)*local.y);
 q+=boat*(rotated-local+vec2(0.0028*sin(time*0.25),0.00085*sin(time*0.43)));
 vec3 color=texture2D(picture,clamp(q,vec2(0.001),vec2(0.999))).rgb;
 float luminance=dot(color,vec3(0.213,0.715,0.072));
 color=mix(vec3(luminance),color,saturation);
 // Brightness stays tied to existing bright pixels, not drawn substitute shapes.
 float shimmer=0.0;
 for(int i=0;i<8;i++){
  vec2 distance=(p-stars[i])/vec2(0.013,0.0065);
  float sparkle=exp(-dot(distance,distance)*2.0);
  float rhythm=0.5+0.5*sin(time*(0.55+float(i)*0.07)+float(i)*1.9);
  shimmer+=sparkle*rhythm*rhythm*0.16;
 }
 shimmer*=smoothstep(0.35,0.8,luminance);
 float breath=moon*smoothstep(0.52,0.92,luminance)*(0.5+0.5*sin(time*0.44))*0.065;
 float reflection=exp(-pow((p.x-0.52)/0.095,2.0))*water*smoothstep(0.5,0.9,luminance);
 float glint=reflection*(0.5+0.5*sin(p.y*240.0-time*0.95+sin(p.x*80.0)))*0.105;
 gl_FragColor=vec4(clamp(color*(1.0+shimmer+breath+glint),0.0,1.0),1.0);
}
`;
export const splashStars = {
  light: [
    0.65, 0.084, 0.465, 0.133, 0.423, 0.177, 0.217, 0.204, 0.425, 0.246, 0.071,
    0.275, 0.322, 0.291, 0.66, 0.336,
  ],
  dark: [
    0.71, 0.152, 0.417, 0.189, 0.212, 0.197, 0.352, 0.143, 0.15, 0.245, 0.338,
    0.282, 0.64, 0.407, 0.68, 0.36,
  ],
};
