// board settings
var tilesX = 16;
var tilesY = 16;
var numBombs = 40;

var tileSize = 30;

var gameWidth = tilesX * tileSize;
var gameHeight = tilesY * tileSize;
var tiles = [];

var start;
var end;


function setup() {
    let canvas = createCanvas(gameWidth, gameHeight);
    canvas.parent('minesweeperjs');
    noLoop();

    createBoard();
}
  
function draw() {
    background(120);
    for (let t in tiles) {
        tiles[t].show();
    }
}

function createBoard() {
    for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
            tiles.push(Object.create(Tile).init(x, y));
        }
    }

    // fill array with values from 0->tiles.length, then shuffle randomly
    // TODO - simplify, don't really understand this method and sometimes produces weird results
    var rand = Array(tiles.length).fill().map((_, i) => i++).sort(() => Math.random() - 0.5);
    
    // take the first numBombs number of values from array to fill with bombs
    // also increment bombsNearby property for adjacent tiles
    var bombIndexes = rand.slice(0, numBombs);
    bombIndexes.forEach(i => {
        tiles[i].isBomb = true;
        var adjTiles = getAdjacent(i);
        adjTiles.forEach(j => {
            let tile = tiles[j];
            if (tile) { tile.bombsNearby = tile.bombsNearby + 1 || 1 }
        });
    });

    console.log(tiles);
}

function mouseClicked() {
    var posX = Math.floor(mouseX / tileSize);
    var posY = Math.floor(mouseY / tileSize);
    if (mouseX > width || mouseY > height) return;
    console.log(`[${posX}, ${posY}]`);

    var tile = tiles[gridToIndex(posX, posY)];

    if (keyIsPressed === true && keyCode === CONTROL) {
        tile.flagged = !tile.flagged;
        redraw();
    }
    else { tile.clear() }   
}

function gridToIndex(x, y) {
    return (x * tilesY) + y;
}

function getAdjacent(index) {
    var indices = [];
    /*
    1 2 3   :   -(tilesY+1), -1, (tilesY-1)
    4 5 6   :   -tilesY    ,  0, tilesY
    7 8 9   :   -(tilesY-1),  1, (tilesY+1)
    */
    var dirs = [-(tilesY+1), -1, (tilesY-1), -tilesY, 0, tilesY, -(tilesY-1), 1, (tilesY+1)];
    if (index % tilesY == 0) {
        // if starting in top row remove upper checks
        dirs = dirs.slice(3);
    }
    else if (index % tilesY == tilesY-1) {
        // if starting in bottom row remove lower checks
        dirs = dirs.slice(0, 6);
    }
    for (let i = 0; i < dirs.length; i++) {
        var ci = index + dirs[i];
        // remove indices that are out of bounds
        if (ci < 0 || ci >= tiles.length) continue;
        indices.push(ci);
    }
    return indices;
}


var Tile = {
    init: function(x, y) {
        this.x = x * tileSize;
        this.y = y * tileSize;
        this.i = gridToIndex(x, y);
        return this;
    },
    show: function() {
        if (this.isBomb) { fill(230, 30, 75) }
        else if (this.cleared) { fill(200) }
        else if (this.flagged) { fill(60, 80, 180) }
        else { fill(40) }
        
        // draw settings for tile
        stroke(160);
        rect((this.x), (this.y), tileSize, tileSize);

        // ---- Show tile indices for debugging ----
        // if (this.i % tilesY == 0) fill(0, 200, 0);
        // else if (this.i % tilesY == tilesY-1) fill(0, 0, 200);
        // else fill(255);
        // textAlign(CENTER, CENTER);
        // text(this.i, (this.x+tileSize/2), (this.y+tileSize/2));

        if (this.bombsNearby && this.cleared) {
            // add numbers for nearby bombs on cleared tiles
            fill(20);
            textAlign(CENTER, CENTER);
            text(this.bombsNearby, (this.x+tileSize/2), (this.y+tileSize/2));
        }
    },
    clear: function() {
        start = window.performance.now();
        if (this.flagged) { return }
        else if (!this.bombsNearby && !this.cleared) {
            this.recursiveClear();
        }
        else if (!this.isBomb) {
            this.cleared = true;
        }
        redraw();
        end = window.performance.now();
        console.log(`clear execution time: ${end - start} ms`);
    },
    recursiveClear: function() {
        // recursively clear empty tiles
        // TODO - very slow /// FIXED - previous method repeatedly called redraw() adding 5-10ms each time
        if (this.flagged) { return }
        else if (!this.bombsNearby && !this.cleared) {
            this.cleared = true;
            var adjTiles = getAdjacent(this.i);
            adjTiles.forEach(j => {
                let tile = tiles[j];
                if (tile) { tile.recursiveClear(); }
            });
        }
        else if (!this.isBomb) {
            this.cleared = true;
        }
    },
    hello: function() {
        // debugging function for outputing tile location
        console.log(`Hello! I live at [${this.x}, ${this.y}]`);
        console.log(this);
    }
}