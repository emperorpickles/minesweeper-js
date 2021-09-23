// board settings
var tilesX = 16;
var tilesY = 16;
var numMines = 200;

var tileSize = 30;

var boardWidth = tilesX * tileSize;
var boardHeight = tilesY * tileSize;
var tiles = [];

var tilesFlagged = 0;
var newGame = true;

var start;
var end;


function setup() {
    let canvas = createCanvas(boardWidth, boardHeight + 30);
    canvas.parent('minesweeperjs');
    noLoop();

    createBoard();
    UI.bottomBar.init(10, boardHeight + 15);
}
  
function draw() {
    background(80);
    for (let t in tiles) {
        tiles[t].show();
    }

    UI.bottomBar.show();
}

function createBoard() {
    for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
            tiles.push(Object.create(Tile).init(x, y));
        }
    }
    console.log(tiles);
}

function setMines(index) {
    // create array of len(numMines) filled with random unique values from 0 -> tiles.length
    var mineIndexes = new Array(numMines).fill().map((_, i, a) => {
        while (a.includes(rand) || rand === index) {
            var rand = Math.floor(Math.random() * tiles.length);
        }
        a[i] = rand;
        return rand;
    });
    // set each tile in mineIndexes to be a mine and increment adjacent tiles' mine count
    mineIndexes.forEach(i => {
        tiles[i].isMine = true;
        var adjTiles = getAdjacent(i);
        adjTiles.forEach(j => {
            let tile = tiles[j];
            if (tile) { tile.minesNearby = tile.minesNearby + 1 || 1 }
        });
    });
    console.log(tiles.filter(tile => tile.isMine).length);
}

function mouseClicked() {
    var posX = Math.floor(mouseX / tileSize);
    var posY = Math.floor(mouseY / tileSize);
    var index = gridToIndex(posX, posY);
    if (mouseX > boardWidth || mouseX < 0 || mouseY > boardHeight || mouseY < 0) return;
    console.log(`[${posX}, ${posY}]`);

    var tile = tiles[index];

    if (newGame) {
        setMines(index);
        newGame = false;
        tile.clear();
    }
    else if (keyIsPressed === true && keyCode === CONTROL) {
        tile.flagged = !tile.flagged;
        if (tile.flagged) tilesFlagged++;
        else tilesFlagged--;
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

// Tile Module
var Tile = {
    init: function(x, y) {
        this.x = x * tileSize;
        this.y = y * tileSize;
        this.i = gridToIndex(x, y);
        return this;
    },
    show: function() {
        if (this.isMine) { fill(230, 30, 75) }
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

        if (this.minesNearby && this.cleared) {
            // add numbers for nearby mines on cleared tiles
            fill(20);
            textAlign(CENTER, CENTER);
            text(this.minesNearby, (this.x+tileSize/2), (this.y+tileSize/2));
        }
    },
    clear: function() {
        start = window.performance.now();
        if (this.flagged) { return }
        else if (!this.minesNearby && !this.cleared) {
            this.recursiveClear();
        }
        else if (!this.isMine) {
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
        else if (!this.minesNearby && !this.cleared) {
            this.cleared = true;
            var adjTiles = getAdjacent(this.i);
            adjTiles.forEach(j => {
                let tile = tiles[j];
                if (tile) { tile.recursiveClear(); }
            });
        }
        else if (!this.isMine) {
            this.cleared = true;
        }
    },
    hello: function() {
        // debugging function for outputing tile location
        console.log(`Hello! I live at [${this.x}, ${this.y}]`);
        console.log(this);
    }
}

// UI Module
var UI = {
    bottomBar: {
        init: function(x, y) {
            this.y = y;
            this.x = x;
            return this;
        },
        show: function() {
            fill(240);
            textAlign(LEFT, CENTER);
            text(`Mines: ${numMines-tilesFlagged}`, (this.x), (this.y));
        }
    }
}