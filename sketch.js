/*
 * @name Shader Using Webcam
 * @description The webcam can be passed to shaders as a texture.
 * <br> To learn more about using shaders in p5.js: <a href="https://itp-xstory.github.io/p5js-shaders/">p5.js Shaders</a>
 */

// this variable will hold our shader object
let theShader;
// this variable will hold our webcam video
let cam;
let w = 600
let h

let faceapi;
let pg;
let detections;
let color
let leftEye = null
let leftEyePos
let sharingan
let eyeLayer
let eyeDrawingLayer 

// by default all options are set to true
const detection_options = {
  withLandmarks: true,
  withDescriptors: false,
}


function preload() {
  color = 'red'
  // load the shader
  theShader = loadShader('assets/webcam.vert', 'assets/webcam.frag');
  sharingan = loadImage('assets/eyeball.png')
}

function setup() {
  angleMode(DEGREES)
  noStroke()
  h = w * 2 / 3
  // shaders require WEBGL mode to work
  createCanvas(w, h, WEBGL);

  pg = createGraphics(w, h, WEBGL);
  eyeLayer = createGraphics(100,100)
  eyeDrawingLayer = createGraphics(w, h)
  cam = createCapture(VIDEO);
  cam.size(w, h);

  cam.hide();
  translate(-w / 2, -h / 2)
  faceapi = ml5.faceApi(cam, detection_options, modelReady)
  eyeLayer.translate(50,50)
}




function gotResults(err, result) {
  background(220);
  if (err) {
    console.log(err)
    return
  }
  
  eyeLayer.rotate(0.1)
  eyeLayer.image(sharingan, -50,-50, 100,100)
  // console.log(result)
  detections = result;

  if (detections) {
    if (detections.length > 0) {
      leftEye = detections[0].parts.leftEye;

    }
  }

  pg.shader(theShader);

  // passing cam as a texture
  theShader.setUniform('tex0', cam);
  theShader.setUniform('')
  // rect gives us some geometry on the screen
  pg.rect(0, 0, width, height);
  image(pg, 0, 0)


  noStroke()
  fill('blue')
  if(leftEye != null){
    let x = (leftEye[1]._x + leftEye[2]._x)/2
    let y = leftEye[0]._y
    let width = (leftEye[3]._x - leftEye[0]._x)/2
    let left = x - width/2
    let top = y - width/2
    image(eyeLayer, left, top, width, width)
  }
  

  // if (detections) {
  //   if (detections.length > 0) {
  //     // console.log(detections)
  //     // drawBox(detections)
  //     // drawLandmarks(detections)
  //   }

  // }

  // loadPixels();
  //  for(let i = 0; i < 10; i++){
  //   console.log(pixels[i] +" ][]" + i)
  //  }
  if (mouseIsPressed) {
    console.log(leftEye)
    image(pg, 0, 0)
    // saveCanvas(pg, 'myCanvas', 'jpg');
    if (color == 'red') {
      color = 'blue'

    } else {
      color = 'green'
    }

  }

  faceapi.detect(gotResults)
}

function modelReady() {
  console.log('ready!')
  console.log(faceapi)
  faceapi.detect(gotResults)
}

function drawBox(detections) {
  for (let i = 0; i < detections.length; i++) {
    const alignedRect = detections[i].alignedRect;
    const x = alignedRect._box._x
    const y = alignedRect._box._y
    const boxWidth = alignedRect._box._width
    const boxHeight = alignedRect._box._height

    noFill();
    stroke(161, 95, 251);
    strokeWeight(2);
    // rect(x, y, boxWidth, boxHeight);
  }

}

function drawLandmarks(detections) {
  // noFill();
  stroke(161, 95, 251)
  strokeWeight(2)

  for (let i = 0; i < detections.length; i++) {
    const mouth = detections[i].parts.mouth;
    const nose = detections[i].parts.nose;
    const leftEye = detections[i].parts.leftEye;
    const rightEye = detections[i].parts.rightEye;
    const rightEyeBrow = detections[i].parts.rightEyeBrow;
    const leftEyeBrow = detections[i].parts.leftEyeBrow;

    // drawPart(mouth, true);
    // drawPart(nose, false);
    // drawPart(leftEye, true);
    // drawPart(leftEyeBrow, false);
    // drawPart(rightEye, true);
    // drawPart(rightEyeBrow, false);

  }

}

function drawPart(feature, closed) {

  beginShape();
  for (let i = 0; i < feature.length; i++) {
    const x = feature[i]._x
    const y = feature[i]._y
    vertex(x, y)
  }

  if (closed === true) {
    endShape(CLOSE);
  } else {
    endShape();
  }

}