// casey conchinha - @kcconch ( https://github.com/kcconch )
// louise lessel - @louiselessel ( https://github.com/louiselessel )
// more p5.js + shader examples: https://itp-xstory.github.io/p5js-shaders/

precision mediump float;

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;
uniform vec2 iResolution;
uniform float iFrame;
uniform vec2 iMouse;

float map(float value,float min1,float max1,float min2,float max2){
    return min2+(value-min1)*(max2-min2)/(max1-min1);
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
    sin(_angle),cos(_angle));
}


void main(){
    vec2 pivot=iMouse;
    vec2 uv=vTexCoord;
    float screenRatio=iResolution.x/iResolution.y;
    uv.y=1.-uv.y;
    vec2 st=uv;
    st.x*=screenRatio;
    vec2 va=uv-pivot;
    
    float dist=distance(uv,pivot);
    float rotateAngle=-1.6875/(dist+.0375)*iFrame/200.;
    rotateAngle=min(0.,rotateAngle);
    // rotateAngle = iFrame/100.;
    vec2 vb=rotate2d(rotateAngle)*va;
    uv=vb;
    vec3 col=vec3(st.x,st.y,st.x);
    col=vec3(uv.xyx);
    st=uv+pivot;
    vec4 tex=texture2D(tex0,st);

    // gl_FragColor = vec4(col,1.);
    gl_FragColor=tex;
}
