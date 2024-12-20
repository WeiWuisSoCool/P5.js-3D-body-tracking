let video;
let bodyPose;
let poses = [];
let connections;
let emojis = []; // 存储表情符号
let emojiInputs = []; // 用户输入的表情符号
let emojiCount = 10;
let gravity = 2;
let inputBox, addButton;

function preload() {
  bodyPose = ml5.bodyPose("BlazePose", { flipped: true });
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getSkeleton();
  console.log(connections);

  // 创建输入框和按钮
  inputBox = createInput('');
  inputBox.position(10, height + 10);
  addButton = createButton('Add Emoji');
  addButton.position(inputBox.x + inputBox.width + 5, height + 10);
  addButton.mousePressed(addEmoji);

  // 初始化表情符号
  for (let i = 0; i < emojiCount; i++) {
    emojis.push({
      x: random(width),
      y: random(-200, -50),
      vy: random(1, 3),
      char: random(['😀', '😂', '😅', '😊', '😎']),
      isFlying: false,
      vx: 0,
    });
  }
}

function draw() {
  background(220);
  image(video, 0, 0);

  if (poses.length > 0) {
    let pose = poses[0];

    // 绘制关键点
    for (let i = 0; i < pose.keypoints.length; i++) {
      let keypoint = pose.keypoints[i];
      fill(0, 0, 255);
      noStroke();
      if (keypoint.confidence > 0.1) {
        circle(keypoint.x, keypoint.y, 12);
      }
    }

    // 绘制骨骼
    for (let i = 0; i < connections.length; i++) {
      let connection = connections[i];
      let a = connection[0];
      let b = connection[1];
      let keyPointA = pose.keypoints[a];
      let keyPointB = pose.keypoints[b];
      stroke(0, 255, 0);
      strokeWeight(2);
      line(keyPointA.x, keyPointA.y, keyPointB.x, keyPointB.y);
    }

    // 更新和绘制表情符号
    for (let emoji of emojis) {
      if (!emoji.isFlying) {
        emoji.y += emoji.vy; // 重力作用
        if (emoji.y > height) {
          emoji.y = random(-200, -50);
          emoji.x = random(width);
        }
      } else {
        emoji.x += emoji.vx;
        emoji.y -= 5;
        if (emoji.y < -50) {
          emoji.isFlying = false;
          emoji.y = random(-200, -50);
          emoji.x = random(width);
        }
      }

      textSize(32);
      text(emoji.char, emoji.x, emoji.y);

      // 检测碰撞
      for (let i = 0; i < pose.keypoints.length; i++) {
        let keypoint = pose.keypoints[i];
        if (
          keypoint.confidence > 0.1 &&
          dist(keypoint.x, keypoint.y, emoji.x, emoji.y) < 30 &&
          !emoji.isFlying
        ) {
          emoji.isFlying = true;
          emoji.vx = random(-5, 5);
          break;
        }
      }
    }
  }
}

function gotPoses(results) {
  poses = results;
}

function addEmoji() {
  let newEmoji = inputBox.value().trim();
  if (newEmoji !== '') {
    emojis.push({
      x: random(width),
      y: random(-200, -50),
      vy: random(1, 3),
      char: newEmoji,
      isFlying: false,
      vx: 0,
    });
    inputBox.value('');
  }
}
