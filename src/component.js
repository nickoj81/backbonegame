// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
  init: function() {
    this.attr({
      w: Game.map_grid.tile.width,
      h: Game.map_grid.tile.height
    })
  },

  // Locate this entity at the given position on the grid
  at: function(x, y) {
    if (x === undefined && y === undefined) {
      return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
    } else {
      this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
      return this;
    }
  }
});

// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas, Grid');
  },
});

Crafty.c('Block', {
  init: function() {
    this.requires('Actor, Solid, Color');
    this.color('rgb(50, 50, 50)');
  },
  });

  // Our slide component - listens for slide events
  // and smoothly slides to another tile location
  Crafty.c("Slide", {
    init: function() {
      this._stepFrames = 5;
      this._tileSize = 16;
      this._moving = false;
      this._vx = 0; this._destX = 0; this._sourceX = 0;
      this._vy = 0; this._destY = 0; this._sourceY = 0;
      this._frames = 0;

      this.bind("Slide", function(direction) {
        // Don't continue to slide if we're already moving
        if(this._moving) return false;
        this._moving = true;

        // Let's keep our pre-movement location
        // Hey, Maybe we'll need it later :)
        this._sourceX = this.x;
        this._sourceY = this.y;

        // Figure out our destination
        this._destX = this.x + direction[0] * 32;
        this._destY = this.y + direction[1] * 32;

        // Get our x and y velocity
        this._vx = direction[0] * this._tileSize / this._stepFrames;
        this._vy = direction[1] * this._tileSize / this._stepFrames;

        this._frames = this._stepFrames;
      }).bind("EnterFrame",function(e) {
        if(!this._moving) return false;

        // If we'removing, update our position by our per-frame velocity
        this.x += this._vx;
        this.y += this._vy;
        this._frames--;

        if(this._frames == 0) {
          // If we've run out of frames,
          // move us to our destination to avoid rounding errors.
          this._moving = false;
          this.x = this._destX;
          this.y = this._destY;
        }
        this.trigger('Moved', {x: this.x, y: this.y});
      });

    }, 
    slideFrames: function(frames) { 
       this._stepFrames = frames;
    },

    // A function we'll use later to 
    // cancel our movement and send us back to where we started
    cancelSlide: function() {
      this.x = this._sourceX;
      this.y = this._sourceY;
      this._moving = false;
    }
  });

// a mover is an entity that moves
Crafty.c("Mover",{
  _directions:  [[0,-1], [0,1], [1,0], [-1,0]],
  init: function() {
    this._moveChance = 0.5;
    this.requires('Actor, Slide');

    this.bind("Tick",function() {
      if(Math.random() < this._moveChance) {
        this.trigger("Slide", this._randomDirection());
      }
    });
    this.checkMove();
  },


  checkMove: function() {
    var that = this;
     setInterval(function(){that.trigger('Tick')},1000)

  },

  moveChance: function(val) {
    this._moveChance = val;

  },
  _randomDirection: function() {
    return this._directions[Math.floor(Math.random()*4)];
  }

});

Crafty.c('Robot', {
  init: function() {
    this.requires('Actor, Color, Collision, Mover');
    this.color('rgb(200, 50, 50)')
    .stopOnSolids();
  },


  // Registers a stop-movement function to be called when
  //  this entity hits an entity with the "Solid" component
  stopOnSolids: function() {
    this.onHit('Solid', this.stopMovement);
 
    return this;
  },
});

