/*
 * @name Shader Using Webcam
 * @description The webcam can be passed to shaders as a texture.
 * <br> To learn more about using shaders in p5.js: <a href="https://itp-xstory.github.io/p5js-shaders/">p5.js Shaders</a>
 */

// this variable will hold our shader object
let theShader;
// this variable will hold our webcam video
let cam;
let w
let h = 720

let faceapi;
let pg;
let detections;
let color
let leftEye = null
let leftEyePos
let sharingan
let eyeLayer
let eyeDrawingLayer
let myFrameCount = 0
let eyeX
let eyeY
let eyeWidth
let eyeLeft
let eyeTop
let bufferFrame = 0
let predictions = [];
let handpose;
let detected = false
let slider
let slider2
let unisonSignPos
let unisonSignPos2
let fingerTips = []
let unisonSignImg
let spinnedCount = 0;
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
  unisonSignImg = loadImage('assets/UnisonSign.png')
}

function setup() {
  unisonSignPos = createVector(30, 100)


  // slider = createSlider(-200, 200, 100);
  // slider.position(1000, 10);
  // slider2 = createSlider(-200, 200, 100);
  // slider2.position(1000, 50);
  angleMode(DEGREES)
  noStroke()
  w = h * 4 / 3
  // shaders require WEBGL mode to work
  createCanvas(w, h);

  pg = createGraphics(w, h, WEBGL);
  eyeLayer = createGraphics(100, 100)
  eyeDrawingLayer = createGraphics(w, h)
  cam = createCapture(VIDEO);
  cam.size(w, h);

  cam.hide();
  // translate(-w / 2, -h / 2)

  handpose = ml5.handpose(cam, loadFingers);
  handpose.on("predict", results => {
    predictions = results;
  });


  faceapi = ml5.faceApi(cam, detection_options, modelReady)

  eyeLayer.translate(50, 50)
}
function loadFingers() {
  console.log("loadFingers")
}

function draw() {

  background(220);
  eyeLayer.rotate(-0.3)
  eyeLayer.image(sharingan, -50, -50, 100, 100)

  pg.shader(theShader);

  // passing cam as a texture
  theShader.setUniform('tex0', cam);
  theShader.setUniform("iResolution", [width, height]);
  theShader.setUniform("iFrame", myFrameCount);
  if (detected == true && unisonSign() == true) {
    myFrameCount++
    spinnedCount = 0
  } else {
    myFrameCount -= 10
    myFrameCount = max(0, myFrameCount)
    spinnedCount++
  }
  pg.rect(0, 0, width, height);
  image(pg, 0, 0)

  noStroke()
  fill('blue')
  if (leftEye != null && detections) {
    eyeX = (leftEye[1]._x + leftEye[2]._x) / 2
    eyeY = leftEye[0]._y
    eyeWidth = (leftEye[3]._x - leftEye[0]._x) / 2
    eyeLeft = eyeX - eyeWidth / 2.5
    eyeTop = eyeY - eyeWidth / 2.2
    if (detections) {
      if (detections.length > 0) {
        image(eyeLayer, eyeLeft, eyeTop, eyeWidth, eyeWidth)
      }
    }
  }

  theShader.setUniform("iMouse", [map(eyeLeft + eyeWidth / 2, 0, width, 0, 1), map(eyeTop + eyeWidth / 2, 0, height, 0, 1)]);

  drawKeypoints();
  // console.log(slider.value())
  displaySign()
}

function unisonSign() {//detect sign hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
  let result = false
  if (fingerTips.length > 0) {

    let d = abs(unisonSignPos.copy().add(eyeLeft, eyeTop).dist(fingerTips[1]))
    let d2 = abs(unisonSignPos.copy().add(eyeLeft, eyeTop).dist(fingerTips[2]))

    if (d < 48 && d2 < 48) {
      result = true
    }
  }

  return result
}

function displaySign() {
  let x = unisonSignPos.x + eyeX
  let y = unisonSignPos.y + eyeY

  if (spinnedCount > 30) {
    image(unisonSignImg, x - 100, y - 54)
    push()
    strokeWeight(2)
    stroke('white')
    fill('orange')
    textSize(24)
    text("Mix and Feel your Chakra", x - 40, y + 200)
    pop()
  }

  // console.log(slider.value(), slider2.value())
}

function gotResults(err, result) {//update
  // console.log(predictions)

  if (err) {
    console.log(err)
    return
  }


  // console.log(result)
  detections = result;

  if (detections) {
    if (detections.length > 0) {
      detected = true
      // let theText = detections[0].detection.score
      // console.log(theText)
      leftEye = detections[0].parts.leftEye;

    } else {
      detected = false

    }
  }


  if (mouseIsPressed) {
    if (detections) {

      console.log(detections[0].detection.score)

    }
    // console.log(detections)
  }



  // drawRect()

  faceapi.detect(gotResults)
}

function drawRect() {
  push()
  const keypoint = prediction.annotations.thumb[3];
  rect(keypoint.x, keypoint.y, 100, 100)
  pop()
}
//============================End of my code ==================================

function drawKeypoints() {
  fingerTips = []
  for (let i = 0; i < predictions.length; i += 1) {
    const prediction = predictions[i];
    for (let j = 4; j < prediction.landmarks.length; j += 4) {
      const keypoint = prediction.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      // ellipse(keypoint[0] * 1.5, keypoint[1] * 1.5, 10, 10);

      fingerTips.push(createVector(keypoint[0] * 1.5, keypoint[1] * 1.5))
    }
  }
}

function modelReady() {
  console.log('ready!')
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