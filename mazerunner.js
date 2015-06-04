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
var graphics, walls, player, cursors;
var maze = data['grid'];
var playerGrid = {'x': 0, 'y': 0};

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
        console.log("x= ", gridX);
        console.log(gridY);
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

  if (cursors.left.isDown) {
    player.x -= 4;
  }
  else if (cursors.right.isDown) {
    player.x += 4;
  }
  else if (cursors.up.isDown) {
    player.y -= 4;
  }
  else if (cursors.down.isDown) {
    player.y += 4;
  }
}
