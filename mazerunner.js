var data = {
 'grid': [
    [1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 0]
  ],
  'testGrid': [
    [1,0],
    [0,0]
  ]
}

var TEAL = 0x28AFAA;
var DARK_TEAL = 0x007470;
var ORANGE = 0xFF933D;

var SCALE = 80;
var SPEED = 300;  // movement tweening in ms

// TODO organise these into objects
var graphics, walls, player, cursors;
var maze = data['grid'];
var playerGrid = {'x': 0, 'y': 0};
var status = true; // false = gameover
var lastTimestep = null, stationary = true;
// debug
var savePlayerGrid = savePlayer = null;

var game = new Phaser.Game(SCALE * maze.length, SCALE * maze[0].length, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });


function preload() {
  game.load.image('salty', 'assets/salty.png');
  game.load.image('rock', 'assets/rock.png');

}

function create() {

  graphics = game.add.graphics(0, 0);

  // draw background
  graphics.beginFill(TEAL);
  graphics.drawRect(0, 0 ,SCALE * maze.length, SCALE * maze[0].length);

  walls = game.add.group();
  for (var gridY = 0; gridY < maze.length; gridY++) {
    for (var gridX = 0; gridX < maze.length; gridX++) {
      if (maze[gridY][gridX]) {
        var wall = walls.create(gridX * SCALE, gridY * SCALE, 'rock');
        wall.scale.setTo(SCALE/wall.width, SCALE/wall.height);
      }
      else if (gridX == 0 && !player) {
        player = game.add.sprite(gridX * SCALE, gridY * SCALE, 'salty');
        player.scale.setTo(SCALE/player.width, SCALE/player.height);
        player.anchor.setTo(0, 0);
        playerGrid.x = gridX;
        playerGrid.y = gridY;
      }
    }
  }



  //  keyboard controls
  cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  if (status) {
    debug();

    if (stationary) {
      if (cursors.left.isDown && playerGrid.x > 0 && maze[playerGrid.y][playerGrid.x-1] != 1) {
        move({x: player.x - SCALE, y: player.y});
        playerGrid.x -= 1;
      }
      else if (cursors.right.isDown && playerGrid.x < maze.length-1  && maze[playerGrid.y][playerGrid.x+1] != 1) {
        move({x: player.x + SCALE, y: player.y});
        playerGrid.x += 1;
      }
      else if (cursors.up.isDown && playerGrid.y > 0  && maze[playerGrid.y-1][playerGrid.x] != 1) {
        move({x: player.x, y: player.y - SCALE});
        playerGrid.y -= 1;
      }
      else if (cursors.down.isDown && playerGrid.y < maze.length-1  && maze[playerGrid.y+1][playerGrid.x] != 1) {
        move({x: player.x, y: player.y + SCALE});
        playerGrid.y += 1;
      }
    }

  }
  else {
    // game over
  }
}

function move(destination) {
  console.log(player.x, player.y);
  stationary = false;
  game.add.tween(player).to(destination, SPEED, Phaser.Easing.Quadratic.InOut,  true).onComplete.add(function() { stationary = true;}, this);
}

function debug() {
  if (savePlayerGrid === null) {
    savePlayerGrid = playerGrid;
  }
  else {
    // console.log("savePlayerGrid ", savePlayerGrid.x);
  }
  if (savePlayer === null) {
    savePlayer = player;
  }
  else {
    // console.log("playerGrid ", playerGrid.x);
  }

  if (playerGrid.x != savePlayerGrid.x || playerGrid.y != savePlayerGrid.y) {
    console.log("playerGrid = ", playerGrid.x, " ", playerGrid.y);
    savePlayerGrid = playerGrid;
  }
  if (player.x != savePlayer.x || player.y != savePlayer.y) {
    console.log("player = ", player.x, " ", player.y);
    savePlayer = player;
  }
}
