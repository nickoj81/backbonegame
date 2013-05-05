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


Crafty.c('Tiled', {
  init: function() {
    this.requires('Actor, Color');
     this.color('rgb(50, 150, 50)');
  },
});




Crafty.c('Block', {
  init: function() {
    this.requires('Tiled, Solid');
    this.color('rgb(50, 50, 50)');
  },
  });

  // Our slide component - listens for slide events
  // and smoothly slides to another tile location
  Crafty.c("Slider", {
    init: function() {
      this.requires('Collision');
      this._stepFrames = 5;
      this._tileSize = 16;
      this._moving = false;
      this._vx = 0; this._destX = 0; this._sourceX = 0;
      this._vy = 0; this._destY = 0; this._sourceY = 0;
      this._frames = 0;

      this.bind("Slide", function(direction) {
        this._lastDirection = direction;
        // Don't continue to slide if we're already moving
        if(this._moving) return false;
        this._moving = true;

        // Let's keep our pre-movement location
        // Hey, Maybe we'll need it later :)
        this._sourceX = this.x;
        this._sourceY = this.y;

        // Figure out our destination
        this._destX = this.x + direction[0] * this._tileSize;
        this._destY = this.y + direction[1] * this._tileSize;

        // Get our x and y velocity
        this._vx = direction[0] * this._tileSize / this._stepFrames;
        this._vy = direction[1] * this._tileSize / this._stepFrames;

        this._frames = this._stepFrames;
      }).bind("EnterFrame",function(e) {
        if(!this._moving){

          return false;
        } 

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
      this.stopOnSolids();
    }, 
    slideFrames: function(frames) { 
       this._stepFrames = frames;
    },

    // Registers a stop-movement function to be called when
  //  this entity hits an entity with the "Solid" component
  stopOnSolids: function() {
    this.onHit('Solid', this.cancelSlide);
 
    return this;
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
    this._lastDirection = this._directions[0];
    this.requires('Actor, Slider');

    this.bind("EnterFrame",function() {
      if(Math.random() < this._moveChance) {
        this.trigger("Slide", this._randomDirection());
      }
    });
    
  },


  
  moveChance: function(val) {
    this._moveChance = val;

  },
  _randomDirection: function() {

    var index = Math.random()*40;
   

    if (index >= 4){
    direction = this._lastDirection;
    }else{
      
      direction = this._directions[Math.floor(index)];
    }

   
    this._lastDirection = direction;
    return direction;
  }

});

Crafty.c('Robot', {
  init: function() {
    this.requires('Actor, Mover, Color, Mouse');
    this.type ="";
    this.age = 0;
    this.numKids = 0;
    this.experience = 0;
    this.genes = {
      color : {red: 200, green: 200, blue: 200},
      virility : 2 + Math.floor(Math.random() *3),
      lifeSpan : Math.floor(Math.random() *80),
      strength : Math.floor(Math.random() *20),
      moveChance : Math.floor(Math.random()*9)/10
    };
    this.breedtTme = 5000;
    this.hitEligable = true;
    this.bind('MouseDown', function(){Crafty.trigger("EntitySelected", this);})
   this.alpha = 0.4;
    this.color('rgb(50,50,50)');
    this.onHit('Robot', this.hitRobot);
     this.setGenes(this.genes);
    this.bind('EnterFrame', function(){
      this.age+=0.01;
      this.alpha +=0.001;



        if (this.age > this.genes.lifeSpan){
        this.die();
      }
    })
  },



setGenes: function (genes) {
  this.genes = genes;
  this.setColor( this.genes.color.red , this.genes.color.green, this.genes.color.blue);
  this.moveChance(genes.moveChance);
},

  setColor : function (r, g, b) {
    this.genes.color.red = r;
    this.genes.color.green = g;
    this.genes.color.blue = b;
//
    this.color('rgb(' + this.genes.color.red + ',' + this.genes.color.green + ','+ this.genes.color.blue + ')' );

  },

  
  hitRobot:function(data){
  robot = data[0].obj
   if(robot.type != this.type){
    this.fight(robot);
     
   }else{
     if (this.hitEligable && this.age>5 && this.age<12 && this.numKids<this.genes.virility) {
  
    Crafty.trigger('NewRob', {type: this.type, x:this.x, y:this.y, genes:this.genes});
    this.hitEligable = false;
    var that = this;
    this.timeID = setInterval(function() {that.hitEligable = true; clearInterval(that.timeID);}, this.breedtTme);
  }
    }
  },


fight : function( robot) {

var thisPower = this.genes.strength + (this.age/10) + this.experience + Math.random()*10;
var robotPower = robot.genes.strength +(this.age/10) + robot.experience + Math.random()*10;

  if (thisPower > robotPower) {
    this.experience+=2;
    this.w = this.w + Game.map_grid.tile.width/5  ; //(this._w/2);
    this.h = this.h + Game.map_grid.tile.height/5  ; //(this._h/2);
    robot.die();
   }else {
      this.die();
    }
  
},

  die :function() {
   // $(.an)
    this.destroy();
    Game.current_entities--;
  },
});

  Crafty.c('RobotA', {
   init: function() {
     this.requires('Robot');
     this.type = "A";
     this.setColor(0, 0, 100 + Math.floor(Math.random()*200));
 },
});
   Crafty.c('RobotB', {
   init: function() {
    this.requires('Robot');
    this.type="B";
    this.setColor(100 + Math.floor(Math.random()*200), 0, 0 );
  },
});

   Crafty.c('InfoPanel', {
   init: function() {
    this.requires('DOM, 2D, Text');
    this.text("here is the text")
    this.textColor('#FFFFFF');
    this.bind('EntitySelected', this.handleEntitySelected )
  },


handleEntitySelected : function(data) {
  var selectedRob = data;

var strength = '<br/>Stength: ' + selectedRob.genes.strength
var age = '<br/>Age: ' + Math.floor(selectedRob.age) + "/" + Math.floor(selectedRob.genes.lifeSpan);
var moveChance = "<br/>MoveChance: " + selectedRob.genes.moveChance;
var virility = "<br/>virility: " + selectedRob.genes.virility;
var experience = "<br/>experience: " + selectedRob.experience;
 this.text(strength + "  " + age + " " + moveChance + virility + experience);

},
   
  
});

