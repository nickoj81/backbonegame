Game = {
  // This defines our grid's size and the size of each of its tiles
  max_entitiesA: 60,
  max_entitiesB: 60,
  current_entities: 0,

  map_grid: {
    width:  64,
    height: 36,
    tile: {
      width:  16,
      height: 16
    }
  },

  // The total width of the game screen. Since our grid takes up the entire screen
  //  this is just the width of a tile times the width of the grid
  width: function() {
    return this.map_grid.width * this.map_grid.tile.width;
  },

  // The total height of the game screen. Since our grid takes up the entire screen
  //  this is just the height of a tile times the height of the grid
  height: function() {
    return this.map_grid.height * this.map_grid.tile.height;
  },

  createEntity: function(params){
  	if (Game.current_entities < Game.max_entities){
  		var robType = 'Robot' + params.type;
  		console.log(Game.current_entities + "hits made");
  		var entity = Crafty.e('RobotA').at(params.x/16, params.y/16);
  		entity.setGenes(params.genes);
  		Game.current_entities++;
  	}
  },


createInfoPanel: function() {
  Crafty.e("InfoPanel").attr({ x: 20, y:650});

},

  // Initialize and start our game
  start: function() {
    // Start crafty and set a background color so that we can see it's working
    Crafty.init(Game.width(), 800);
    Crafty.background('rgb(20, 20, 20)');
    Crafty.bind('NewRob', Game.createEntity);
	

    // Place a tree at every edge square on our grid of 16x16 tiles
    for (var x = 0; x < Game.map_grid.width; x++) {
      for (var y = 0; y < Game.map_grid.height; y++) {
 			//Crafty.e('Tile, DOM, 2D, Color').attr({x:x, y:y}).color('rgb(20, 180, 20)');
       var at_edge = x == 0 || x == Game.map_grid.width - 1 || y == 0 || y == Game.map_grid.height - 1;
        //var ranVal = Math.random();
        if (at_edge) {
          // Place a tree entity at the current tile
          Crafty.e('Block').at(x, y);



        } else{


         if (  x >  (Game.map_grid.width/2) +5 &&  Game.max_entitiesA >0)
            {
                Crafty.e('RobotA').at(x, y);
                Game.max_entitiesA --;
            }else if (  x < (Game.map_grid.width/2) -5 && Game.max_entitiesB >0) {

                   Crafty.e('RobotB').at(x, y);
                  Game.max_entitiesB--;
            }
           Game.current_entities++;

          /// ( ranVal< 0.06) {
          // Place a bush entity at the current tile
        // Crafty.e('Block').at(x, y);
        // }


        }


         
        
      }
    }

   /* for (var i = 0; i > max_entitiesA; i--) {

      else{
            if (  x >  (Game.map_grid.width/2) +5 )
            {
                
            }else if (  x < (Game.map_grid.width/2) -5) {

            }
         else if (ranVal>0.06 &&ranVal <0.08){
           Crafty.e('RobotA').at(x+1, y+1);
           Game.current_entities++
         }else if (ranVal>0.08 && ranVal<0.1)
         {

           Crafty.e('RobotB').at(x+1, y+1);
           Game.current_entities++
              }*/




       Game.createInfoPanel();
  }

  
}