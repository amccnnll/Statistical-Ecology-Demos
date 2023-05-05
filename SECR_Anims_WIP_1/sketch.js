// Define global variables
let rows = 10;
let cols = 10;
let traps = [];
let animal;

// Define the Trap class
class Trap {
  constructor(x, y, detectionProb) {
    this.x = x;
    this.y = y;
    this.detectionProb = detectionProb;
    this.captured = false;
  }
  
  // Check if the animal is captured
  checkCapture(x, y) {
    let distance = dist(x, y, this.x, this.y);
    let prob = this.detectionProb(distance);
    if (random() < prob) {
      this.captured = true;
      return true;
    } else {
      return false;
    }
  }
}

// Set up the canvas and create the traps and animal
function setup() {
  createCanvas(400, 400);
  
  // Create the traps
  let trapSpacing = width/(cols+1);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = (i+1)*trapSpacing;
      let y = (j+1)*trapSpacing;
      let detectionProb = function(distance) {
        return 1 - exp(-distance/50);
      };
      traps.push(new Trap(x, y, detectionProb));
    }
  }
  
  // Create the animal
  animal = {
    x: width/2,
    y: height/2,
    speed: 2
  };
}

// Move the animal, check for captures, and display the results
function draw() {
  background(220);
  
  // Move the animal
  let dx = random(-animal.speed, animal.speed);
  let dy = random(-animal.speed, animal.speed);
  animal.x += dx;
  animal.y += dy;
  
  // Keep the animal within the canvas
  animal.x = constrain(animal.x, 0, width);
  animal.y = constrain(animal.y, 0, height);
  
  // Check for captures
  for (let i = 0; i < traps.length; i++) {
    let trap = traps[i];
    if (!trap.captured) {
      let captured = trap.checkCapture(animal.x, animal.y);
      if (captured) {
        console.log("Animal captured in trap " + i);
      }
    }
  }
  
  // Display the traps and the animal
  for (let i = 0; i < traps.length; i++) {
    let trap = traps[i];
    if (trap.captured) {
      fill(255, 0, 0);
    } else {
      fill(0, 255, 0);
    }
    ellipse(trap.x, trap.y, 10, 10);
  }
  
  fill(0, 0, 255);
  ellipse(animal.x, animal.y, 20, 20);
}

