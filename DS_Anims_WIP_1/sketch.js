// Global variables
const canvasWidth = 800;
const canvasHeight = 600;
const numWhales = 100;
const sigma = 150; // Scale parameter for the half-normal detection function

let boat;
let transect;
let whaleCount = 0;
let whales = [];
let detectedDistances = [];

function setup() {
  createCanvas(canvasWidth, canvasHeight);

  boat = new Boat(0, canvasHeight / 2);
  transect = new Transect(canvasHeight / 2);

  for (let i = 0; i < numWhales; i++) {
    let x = random(canvasWidth);
    let y = random(canvasHeight);
    whales.push(new Whale(x, y));
  }
}

function draw() {
  background(255);

  transect.display();
  boat.display();
  boat.move();

  for (let whale of whales) {
    whale.display();
  }

  detectWhales();
  displayWhaleCount();
  drawDetectionFunctionGraph();
}

class Boat {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 2;
  }

  display() {
    fill(0, 0, 255);
    rect(this.x, this.y, 30, 20);
  }

  move() {
    this.x += this.speed;
  }
}

class Transect {
  constructor(y) {
    this.y = y;
  }

  display() {
    stroke(0);
    line(0, this.y, canvasWidth, this.y);
  }
}

class Whale {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.detected = false;
  }

  display() {
    if (this.detected) {
      fill(0, 255, 0);
    } else {
      fill(255, 0, 0);
    }
    ellipse(this.x, this.y, 10, 10);
  }
}

function detectWhales() {
  for (let whale of whales) {
    let d = Math.abs(whale.y - transect.y);
    let isOrthogonal = Math.abs(boat.x - whale.x) <= boat.speed;
    let detectionProb = Math.exp(-(Math.pow(d, 2) / (2 * Math.pow(sigma, 2))));

    if (isOrthogonal && Math.random() < detectionProb) {
      whale.detected = true;
      if (!whale.counted) {
        whaleCount++;
        whale.counted = true;
        detectedDistances.push(d);
      }
    }
  }
}

function displayWhaleCount() {
  textSize(24);
  fill(0);
  text("Detected Whales: " + whaleCount, 250, 40);
}

function fitHalfNormal() {
  let optimalSigma = sigma;
  let minError = Infinity;
  let dynamicStepSize = Math.max(5, Math.floor(200 / detectedDistances.length)); // Use dynamic step size
  let maxSigma = 400;

  for (let testSigma = dynamicStepSize; testSigma <= maxSigma; testSigma += dynamicStepSize) {
    let errorSum = 0;
    for (let d of detectedDistances) {
      let trueProb = Math.exp(-(Math.pow(d, 2) / (2 * Math.pow(testSigma, 2))));
      errorSum += Math.pow(trueProb - (1 - Math.exp(-(Math.pow(d, 2) / (2 * Math.pow(sigma, 2))))), 2);
    }

    if (errorSum < minError) {
      minError = errorSum;
      optimalSigma = testSigma;
    }
  }

  return optimalSigma;
}

function drawDetectionFunctionGraph() {
  let graphWidth = 200;
  let graphHeight = 150;
  let graphX = canvasWidth - graphWidth - 20;
  let graphY = canvasHeight - graphHeight - 20;
  let distanceIntervals = [0, 100, 200, 300, 400];
  let histogramCounts = [];

  // Count the detected whales in each interval
  for (let i = 0; i < distanceIntervals.length - 1; i++) {
    let lowerBound = distanceIntervals[i];
    let upperBound = distanceIntervals[i + 1];

    let detectedInRange = detectedDistances.filter(d => d >= lowerBound && d < upperBound).length;
    histogramCounts.push(detectedInRange);
  }

  // Draw graph background
  fill(255);
  stroke(0);
  rect(graphX, graphY, graphWidth, graphHeight);

  // Draw histogram bars
  stroke(0, 0, 255);
  let barWidth = graphWidth / (histogramCounts.length * 2);
  for (let i = 0; i < histogramCounts.length; i++) {
    let barHeight = (histogramCounts[i] / numWhales) * graphHeight;
    rect(graphX + i * 2 * barWidth, graphY + graphHeight - barHeight, barWidth, barHeight);
  }
}
