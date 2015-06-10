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

  this.preload = function() {
      // this.game.load.image('salty', 'assets/salty.png');
      this.game.load.spritesheet('salty', 'assets/salty_sheet.png', 300, 300, 2);
      // this.load.image('rock', 'assets/rock.png');
      this.game.load.spritesheet('rock', 'assets/rock_sheet.png', 212, 212, 2);
  }.bind(this);

  this.create = function() {
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
          this.player.sprite.animations.add('swim', [0, 1], 2, true);
          this.player.sprite.animations.play('swim');
          this.player.sprite.scale.setTo(this.SCALE/this.player.sprite.width, this.SCALE/this.player.sprite.height);
          this.player.sprite.anchor.setTo(0, 0);
          this.player.startLocation = new Coordinate(x, y);
          this.player.location = new Coordinate(x,y);
        }
      }
    }

    //  keyboard controls
    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.addEvent(document.querySelector('#btn-optimum-path'), 'click', this.optimumPath);
    this.addEvent(document.querySelector('#btn-restart'), 'click', this.restart);
    this.addEvent(document.querySelector('#btn-theme-rocks'), 'click', this.setTheme(this.walls, 0));
    this.addEvent(document.querySelector('#btn-theme-rocks2'), 'click', this.setTheme(this.walls, 1));
  }.bind(this);

  this.update = function() {
    if (this.isPlaying) {
      if (!this.player.isMoving) {
        if (this.cursors.left.isDown && this.check(this.player.location, 'left', 0)) {
          this.movePlayer('left');
        }
        else if (this.cursors.right.isDown && this.check(this.player.location, 'right', 0)) {
          this.movePlayer('right');
        }
        else if (this.cursors.up.isDown && this.check(this.player.location, 'up', 0)) {
          this.movePlayer('up');
        }
        else if (this.cursors.down.isDown && this.check(this.player.location, 'down', 0)) {
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
        this.player.location = this.player.location.sum(Coordinate.prototype.direction.up);
        break;
      case 'down':
        this.player.location = this.player.location.sum(Coordinate.prototype.direction.down);
        break;
      case 'left':
        this.player.location = this.player.location.sum(Coordinate.prototype.direction.left);
        break;
      case 'right':
        this.player.location = this.player.location.sum(Coordinate.prototype.direction.right);
        break;
    }
    var coord = this.player.location;
    console.log(this.player.sprite.x, this.player.sprite.y);
    this.player.isMoving = true;
    this.tweenPlayer(coord);
  };

  this.tweenPlayer = function (coord) {
      this.game.add.tween(this.player.sprite).to({'x': coord.x * this.SCALE, 'y': coord.y * this.SCALE}, this.SPEED, Phaser.Easing.Quadratic.InOut,  true).onComplete.add(function() { this.player.isMoving = false;}, this);
  }

  this.runMaze = function(path) {
    console.log('RUNNING MAZE');
    this.player.isMoving = true;
    var sprite = this.game.add.tween(this.player.sprite);
    for (var i = path.length-1; i >= 0; i--) {
      sprite.to({'x':path[i].x * this.SCALE, 'y': path[i].y * this.SCALE}, this.SPEED, Phaser.Easing.Quadratic.InOut);
    }
    sprite.start().onComplete.add(function() {
      this.player.isMoving = false;
      this.isPlaying = false;
    }, this);
  };

  this.restart = function() {
    if (this.player.startLocation != undefined) {
      this.player.sprite.x = this.player.startLocation.x * this.SCALE;
      this.player.sprite.y = this.player.startLocation.y * this.SCALE;
      this.player.location.x = this.player.startLocation.x;
      this.player.location.y = this.player.startLocation.y;
      this.isPlaying = true;
    }
  }.bind(this);

  this.setTheme = function (group, frameNumber) {
    return function() {group.children.forEach(function(sprite){
        sprite.frame = frameNumber;
      });
    };
  };

  this.optimumPath = function() {
    var path = this.calculatePath();
    this.runMaze(path);
  }.bind(this);

  this.calculatePath = function() {
    /* This is an implementation of Dijkstra's algorithm. We build the graph
       of DNodes (Dijkstra's Nodes) as we go, from left side of maze to right. */
    var maze = this.grid;
    var start = new DNode(null);
    var finish;

    // array of DNodes
    var toCheck = [start];

    // sets of Coords
    var discovered = [];

    var subarray = [];
    for (var i=0; i < maze.length; i++) {
      subarray.push(false);
    }
    for (var i=0; i < maze.length; i++) {
      var copy = subarray.slice(0);
      discovered.push(copy);
    }

    // initially coords neighboring 'start' node
    var gridNeighbors = [];
    var path = [];
    var minPathNode = null;
    start.distanceToSource = 0;

    // find available nodes in leftmost column in maze and connect to 'start' node
    for (var y=0; y < maze.length; y++) {
      if (maze[y][0] === 0) {
        gridNeighbors.push(new Coordinate(0, y));
      }
    }

    //Traverse the graph depth-first, discovering neighbors as we crawl.
    while (toCheck.length > 0) {
      // minPathNode is the current shortest path to source
      console.log('prevMinPathNode', minPathNode);
      var prevMinPathNode = minPathNode;
      minPathNode = toCheck.reduce(function(previousValue, currentValue) {
        // deal with the case of inspecting 'finish' node
        if (currentValue.distanceToSource = null) {
          return previousValue;
        }
        return currentValue.distanceToSource < previousValue.distanceToSource ? currentValue : previousValue;
      }, toCheck[0]);
      if (minPathNode == finish) {
        finish.prev = prevMinPathNode;
        break;
      }

      // remove the minPathNode from list of nodes to check
      toCheck.splice(toCheck.indexOf(minPathNode), 1);

      if (minPathNode != start) {
        var gridNeighbors = this.getNeighbors(minPathNode.coord, 0);
      }

      // add undiscovered grid coordinates into graph as dNodes
      gridNeighbors.forEach(function(coord) {
        if (discovered[coord.x][coord.y] === false) {
          var neighborNode = new DNode(coord);
          minPathNode.neighbors.add(neighborNode);
          neighborNode.neighbors.add(minPathNode);
          discovered[coord.x][coord.y] = true;

          toCheck.push(neighborNode);

          // connect to finish node if on the rightmost column of maze
          if (coord.x == maze.length-1) {
            console.log('create finish now!!', coord);
            if (finish == undefined) {
              finish = new DNode(null);
              toCheck.push(finish);
            }
            neighborNode.neighbors.add(finish);
            finish.neighbors.add(neighborNode);
          }
        }
      });
      // check each graph node neighbor of minPathNode
      minPathNode.neighbors.forEach(function(neighbor) {
        if (toCheck.indexOf(neighbor) > -1) {
          var altDistance = minPathNode.distanceToSource + 1;
          if (neighbor.distanceToSource == null || altDistance < neighbor.distanceToSource) {
            neighbor.distanceToSource = altDistance;
            neighbor.prev = minPathNode;
          }
        }
      });
    }
    console.log('neighbors');
    console.log(finish.neighbors);
    var node = finish;
    while (node.prev.coord != start.coord) {
      path.push(node.prev.coord);
      node = node.prev;
    }
    console.log(path);
    return path;
  }

  this.createGame = function() {
    var game = new Phaser.Game(this.SCALE * this.grid.length, this.SCALE * this.grid[0].length, Phaser.AUTO, 'game', { preload: this.preload, create: this.create, update: this.update });
    return game;
  }.bind(this);

  this.game = this.createGame();
}
MazeGame.prototype.check = function (coord, direction, val) {
  x = coord.x;
  y = coord.y;
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
MazeGame.prototype.getNeighbors = function (coord, val) {
  var neighbors = [];
  for (direction in coord.direction) {
    if (this.check(coord, direction, val)) {
      neighbors.push(coord.sum(coord.direction[direction]));
    }
  }
  return neighbors;
}

saltydog = new MazeGame(data['grid']);



function Coordinate(x, y) {
  this.x = x;
  this.y = y;
}

Coordinate.prototype.direction = {"up": new Coordinate(0, -1),
                                  "down": new Coordinate(0, 1),
                                  "left": new Coordinate(-1, 0),
                                  "right": new Coordinate(1, 0) };

Coordinate.prototype.sum = function (other) {
  return new Coordinate(this.x + other.x, this.y + other.y)
};

// dijkstra node
function DNode(coord) {
  this.coord = coord;
  this.prev = null;
  this.distanceToSource = null;
  this.neighbors = new Set();
}

function Player(location, startLocation, sprite) {
  this.location = location;
  this.startLocation = startLocation;
  this.sprite = sprite;
  this.isMoving = false;
}
