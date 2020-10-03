/* - - - - - - - - - - - - - - - - Variables  - - - - - - - - - - - - - - - - */

var WIDTH = 700, HEIGHT = 600, pi = Math.PI;
var UpArrow=38, DownArrow = 40;
var canvas, ctx, keystate;
var player, ai, ball;

/* - - - - - - - - - - - - - - - - Objects  - - - - - - - - - - - - - - - - */

score = {
  playerScore: 0,
  playerScorePos: 0,
  aiScore: 0,
  aiScorePos: 0,
  spacing: 112
};

player = {
  x: null,
  y: null,
  width: 20,
  height: 100,

  update: function(){
    if (keystate[UpArrow]) this.y -= 7;
    if (keystate[DownArrow]) this.y += 7;
    this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
  },
  draw: function(){
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};

ai = {
  x: null,
  y: null,
  width: 20,
  height: 100,

  update: function(){
    var dest = ball.y - (this.height - ball.side) * 0.5;
    this.y += (dest - this.y) * 0.1;
    this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
  },
  draw: function(){
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};

ball = {
  x: null,
  y: null,
  vel: null,
  side: 20,
  speed: 12,

  serve: function(side){
    var r = Math.random();
    this.x = side === 1 ? player.x + player.width : ai.x - this.side;
    this.y = (HEIGHT - this.side) * r;

    var phi = 0.1 * pi * (1 - 2 * r);
    this.vel = {
      x: side * this.speed * Math.cos(phi),
      y: this.speed * Math.sin(phi)
    };
  },
  update: function(){
    this.x += this.vel.x;
    this.y += this.vel.y;

    // Y Bounce
    if (0 > this.y || this.y + this.side > HEIGHT){
      var offset = this.vel.y < 0 ? 0 - this.y : HEIGHT - (this.y + this.side);
      this.y += 2 * offset;
      this.vel.y *= -1;
    }

    // X Bounce
    // axis aligned bounding boxex (AABB)
    var AABBIntersect = function(ax, ay, aw, ah, bx, by, bw, bh){
      return ax < bx + bw && ay < by + bh && bx < ax + aw && by < ay + ah;
    };

    var pdle = this.vel.x < 0 ? player : ai;
    if (AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height,
         this.x, this.y, this.side, this.side)
       ){
         this.x = pdle === player ? player.x + player.width : ai.x - this.side;

         var n = (this.y + this.side - pdle.y) / (pdle.height + this.side);
         var phi = 0.25 * pi * (2*n - 1);

         var smash = Math.abs(phi) > 0.2 * pi ? 1.5 : 1;
         this.vel.x = smash * (pdle === player ? 1 : -1) * this.speed * Math.cos(phi);
         this.vel.y = smash * this.speed * Math.sin(phi);
    }

    if (0 > this.x + this.side) {
      this.serve(pdle === player ? 1 : -1);
      score.playerScore++;

      if (score.playerScore === 10 || score.playerScore === 100 || score.playerScore === 1000){
        score.playerScorePos -= 100;
      }
    } else if (this.x > WIDTH){
      this.serve(pdle === player ? 1 : -1);
      score.aiScore++;
    }

    if (score.playerScore === 99 || score.aiScore === 99){
      var win = score.playerScore === 99 ? 'You' : 'The Ai';
      alert(win + " Won\nWith a score of 99...");

      score.playerScore = 0;
      score.aiScore = 0;
      score.playerScorePos = 0;
    }
  },
  draw: function(){
    ctx.fillRect(this.x, this.y, this.side, this.side);
  }
};

/* - - - - - - - - - - - - - - - - Main  - - - - - - - - - - - - - - - - */

function main() {
  canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx = canvas.getContext("2d");
  document.body.appendChild(canvas);

  keystate = {};
  document.addEventListener("keydown", function(evt){
    keystate[evt.keyCode] = true;
  });
  document.addEventListener("keyup", function(evt){
    delete keystate[evt.keyCode];
  });

  init();

  var loop = function(){
    update();
    draw();

    window.requestAnimationFrame(loop, canvas);
  };
  window.requestAnimationFrame(loop, canvas);
}

/* - - - - - - - - - - - - - - - - Init  - - - - - - - - - - - - - - - - */

function init() {
  player.x = player.width;
  player.y = (HEIGHT - player.height) / 2;

  ai.x = WIDTH - (player.width + ai.width);
  ai.y = (HEIGHT - ai.height) / 2;

  ball.serve(1);
}

/* - - - - - - - - - - - - - - - - Update  - - - - - - - - - - - - - - - - */

function update() {
  ball.update();
  player.update();
  ai.update();
}

/* - - - - - - - - - - - - - - - - Draw  - - - - - - - - - - - - - - - - */

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.fillStyle = '#eee';

  ctx.font = "100px 'Press Start 2P', cursive";
  ctx.fillText(score.playerScore, WIDTH / 2 - 87 - score.spacing + score.playerScorePos, 110);
  ctx.fillText(score.aiScore, (WIDTH / 2) + score.spacing, 110);

  ball.draw();
  player.draw();
  ai.draw();

  var w = 4;
  var x = (WIDTH - w) * 0.5;
  var y = 0;
  var step = HEIGHT/20;

  while (y < HEIGHT){
    ctx.fillRect(x, y + (step * 0.25), w, step * 0.5);
    y += step;
  }

  ctx.restore();
}

/* - - - - - - - - - - - - - - - - Run  - - - - - - - - - - - - - - - - */
main();
