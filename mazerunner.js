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
  ]
}

var TEAL = 0x28AFAA;
var DARK_TEAL = 0x007470;
var ORANGE = 0xFF933D;

function MazeGame(grid) {
  this.grid = grid;
  this.player = new Player();

  this.SCALE = 80;
  this.SPEED = 300;  // movement tweening in ms

  this.walls;
  this.cursors;
  this.isPlaying = true;

  this.preload = function () {
      this.game.load.image('salty', 'assets/salty.png');
      // this.load.image('rock', 'assets/rock.png');
      this.game.load.spritesheet('rock', 'assets/rock.png', 100,100,2);
      this.addEvent(document.querySelector('#btn-run'), 'click', this.runMaze);
      this.addEvent(document.querySelector('#btn-restart'), 'click', this.restart);
      // this.addEvent(document.querySelector('#btn-theme-rocks'), 'click', this.setTheme(this.walls, 0));
      // this.addEvent(document.querySelector('#btn-theme-rocks2'), 'click', this.setTheme(this.walls, 1));
  }.bind(this);

  this.create = function () {
    var graphics = this.game.add.graphics(0, 0);

    // draw background
    graphics.beginFill(TEAL);
    graphics.drawRect(0, 0 ,this.SCALE * this.grid.length, this.SCALE * this.grid[0].length);

    this.walls = this.game.add.group();
    for (var y = 0; y < this.grid.length; y++) {
      for (var x = 0; x < this.grid.length; x++) {
        if (this.grid[y][x] === 1) {
          var wall = this.walls.create(x * this.SCALE, y * this.SCALE, 'rock');
          wall.frame = 0;
          wall.scale.setTo(this.SCALE/wall.width, this.SCALE/wall.height);
        }
        else if (x == 0 && this.player.sprite === undefined) {
          this.player.sprite = this.game.add.sprite(x * this.SCALE, y * this.SCALE, 'salty');
          this.player.sprite.scale.setTo(this.SCALE/this.player.sprite.width, this.SCALE/this.player.sprite.height);
          this.player.sprite.anchor.setTo(0, 0);
          this.player.startLocation = new Coordinate(x, y);
          this.player.location = new Coordinate(x,y);
        }
      }
    }

    //  keyboard controls
    this.cursors = this.game.input.keyboard.createCursorKeys();
  }.bind(this);

  this.update = function () {
    if (this.isPlaying) {
      if (!this.player.isMoving) {
        if (this.cursors.left.isDown && this.check('left', 0)) {
          this.movePlayer('left');
        }
        else if (this.cursors.right.isDown && this.check('right', 0)) {
          this.movePlayer('right');
        }
        else if (this.cursors.up.isDown && this.check('up', 0)) {
          this.movePlayer('up');
        }
        else if (this.cursors.down.isDown && this.check('down', 0)) {
          this.movePlayer('down');
        }
      }

    }
    else {
      // game over
    }
  }.bind(this);

  this.movePlayer = function (direction) {
    var newCoord;
    switch (direction) {
      case 'up':
        this.player.location.increment(Coordinate.prototype.direction.up);
        break;
      case 'down':
        this.player.location.increment(Coordinate.prototype.direction.down);
        break;
      case 'left':
        this.player.location.increment(Coordinate.prototype.direction.left);
        break;
      case 'right':
        this.player.location.increment(Coordinate.prototype.direction.right);
        break;
    }
    coord = this.player.location;
    console.log(this.player.sprite.x, this.player.sprite.y);
    this.player.isMoving = true;

    this.game.add.tween(this.player.sprite).to({'x': coord.x * this.SCALE, 'y': coord.y * this.SCALE}, this.SPEED, Phaser.Easing.Quadratic.InOut,  true).onComplete.add(function() { this.player.isMoving = false;}, this);
  };

  this.runMaze = function () {
    console.log('RUNNING MAZE');
    // path = [new Coordinate(1,8), new Coordinate(1,7), new Coordinate(1,6)];

  };

  this.restart = function () {
    if (this.player.startLocation != undefined) {
      this.player.sprite.x = this.player.startLocation.x * this.SCALE;
      this.player.sprite.y = this.player.startLocation.y * this.SCALE;
      this.player.location.x = this.player.startLocation.x;
      this.player.location.y = this.player.startLocation.y;
    }
  }.bind(this);

  // this.setTheme = function (group, frameNumber) {
  //   group.children.forEach(function(sprite){
  //     sprite.frame = frameNumber;
  //   });
  // }.bind(this);

  this.mazeToGraph = function (maze) {
    var start = new Coordinate(null, null);
    var finish = new Coordinate(null, null);
    var graph = {start: {}, finish: {}};
    var toVisit = [];

    for (var y=0; y < maze.length; y++) {
      if (maze[y][0] === 0) {
        var p = new Coordinate(0, y);
        toVisit.push(p);

        // connect coordinates in leftmost column to start node
        graph.start[p] = 0;
      }
    }

    return graph;
  }

  createGame = function () {
    var game = new Phaser.Game(this.SCALE * this.grid.length, this.SCALE * this.grid[0].length, Phaser.AUTO, 'game', { preload: this.preload, create: this.create, update: this.update });
    return game;
  }.bind(this);

  this.game = createGame();
  // this.graph = mazeToGraph(this.grid);
}
MazeGame.prototype.check = function (direction, val) {
  x = this.player.location.x;
  y = this.player.location.y;
  switch (direction) {
    case 'up':
      y -= 1;
      break;
    case 'down':
      y += 1;
      break;
    case 'left':
      x -= 1;
      break;
    case 'right':
      x += 1;
      break;
  }
  if (val !== undefined) {
    return (0 <= x) && (x < this.grid.length) && (0 <= y) && (y < this.grid.length) && (this.grid[y][x] === val);
  }
  return (0 < x) && (x < this.grid.length) && (0 < y) && (y < this.grid.length);
};
MazeGame.prototype.addEvent = function (element, evnt, funct) {
  // IE9 and below
  if (element.attachEvent)
   return element.attachEvent('on'+evnt, funct);
  else
   return element.addEventListener(evnt, funct, false);
}

saltydog = new MazeGame(data['grid']);



function Coordinate(x, y) {
  this.x = x;
  this.y = y;
}

Coordinate.prototype.direction = { "up": new Coordinate(0, -1),
                                    "down": new Coordinate(0, 1),
                                    "left": new Coordinate(-1, 0),
                                    "right": new Coordinate(1, 0) };

Coordinate.prototype.increment = function (other) { this.x += other.x; this.y += other.y; };
Coordinate.prototype.sum = function (other) { return new Coordinate(this.x = other.x, this.y + other.y) };

function Player(location, startLocation, sprite) {
  this.location = location;
  this.startLocation = startLocation;
  this.sprite = sprite;
  this.isMoving = false;
}

function getNeighbors(point, val, maze) {
  neighbors = [];
  for (key in Coordinate.prototype.check) {
    if (point.check[key](val, maze)) {
      neighbors.push()
    }
  }
}
