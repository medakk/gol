// gol.js
// Conway's Game of Life Implementation

// Version 0.2
// Cells wrap around. Like a torus

// canvas size
const WIDTH = 800;
const HEIGHT = 400;

// to determine framerate
// update very UPDATE_RATE ms
const UPDATE_RATE = 20;

// GOL size
const GOL_DIV = 16;
const GOL_WIDTH = Math.floor(WIDTH/GOL_DIV);
const GOL_HEIGHT = Math.floor(HEIGHT/GOL_DIV);

// for drawing
const CELL_WIDTH = WIDTH/GOL_WIDTH;
const CELL_HEIGHT = HEIGHT/GOL_HEIGHT;

// half-gap between cells in pixels
const GAP = 2;

// colors
const COLOR_EMPTY = '#DDDDDD';
const COLOR_ALIVE = '#33DD33';
const COLOR_PAUSE = '#111111';

// cell states
const CELL_EMPTY = 0;
const CELL_ALIVE = 1;

// for input
const KEY_SPACEBAR = 32;

// obtain canvas and context from the DOM
var canvas = document.getElementById('canvasGol');
canvas.width=WIDTH;
canvas.height=HEIGHT;
var ctx = canvas.getContext('2d');

// returns a 2D array representing a grid
// of dimensions h*w
function create2dArray(w, h) {
    var arr = Array(h);
    for(var i=0; i<h; i++) {
        var subArr = Array(w);
        for(var j=0; j<w; j++)
            subArr[j] = CELL_EMPTY;
        arr[i] = subArr;
    }

    return arr;
}

// custom modulus function. Is always positive
function mod(a, n) {
    return ((a%n)+n)%n;
}

var gameOfLife = {
    grid:     create2dArray(GOL_WIDTH, GOL_HEIGHT),
    nextGrid: create2dArray(GOL_WIDTH, GOL_HEIGHT),
    isPaused: true,

    // draws the given grid onto the canvas
    drawGrid: function() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        for(var y=0; y<GOL_HEIGHT; y++) {
            for(var x=0; x<GOL_WIDTH; x++) {
                if(this.grid[y][x]==CELL_EMPTY)
                    ctx.fillStyle = COLOR_EMPTY;
                else
                    ctx.fillStyle = COLOR_ALIVE;

                ctx.fillRect(x*CELL_WIDTH+GAP,
                             y*CELL_HEIGHT+GAP,
                             CELL_WIDTH-GAP,
                             CELL_HEIGHT-GAP);
            }
        }

        if(this.isPaused) {
            ctx.fillStyle = COLOR_PAUSE;
            var pauseWidth = 10;
            var pauseHeight = 28;
            var pauseGap = 8;
            ctx.fillRect(WIDTH - 2*pauseGap - 2*pauseWidth,
                         pauseGap,
                         pauseWidth,
                         pauseHeight);
            ctx.fillRect(WIDTH - pauseGap - pauseWidth,
                         pauseGap,
                         pauseWidth,
                         pauseHeight);
        }
    },
    
    // returns the number of alive neighbours for
    // the given cell
    neighbourCount: function (y, x) {
        var count = 0;

        if(this.grid[mod((y-1), GOL_HEIGHT)][mod((x-1), GOL_WIDTH)])
            count++;
        if(this.grid[mod((y-1), GOL_HEIGHT)][x])
            count++;
        if(this.grid[mod((y-1), GOL_HEIGHT)][mod((x+1), GOL_WIDTH)])
            count++;

        if(this.grid[y][mod((x-1), GOL_WIDTH)])
            count++;
        if(this.grid[y][mod((x+1), GOL_WIDTH)])
            count++;
            
        if(this.grid[mod((y+1), GOL_HEIGHT)][mod((x-1), GOL_WIDTH)])
            count++;
        if(this.grid[mod((y+1), GOL_HEIGHT)][x])
            count++;
        if(this.grid[mod((y+1), GOL_HEIGHT)][mod((x+1), GOL_WIDTH)])
            count++;

        return count;
    },

    // swaps grid and nextGrid
    swapGrids: function() {
        var tmp = this.grid;
        this.grid = this.nextGrid;
        this.nextGrid = tmp;
    },

    // goes through the grid and stores the
    // next state in nextGrid
    tick: function() {
        if(this.isPaused)
            return;

        for(var y=0; y<GOL_HEIGHT; y++) {
            for(var x=0; x<GOL_WIDTH; x++) {
                var neighbours = this.neighbourCount(y, x);

                if(this.grid[y][x]==CELL_EMPTY) {
                    if(neighbours==3)
                        this.nextGrid[y][x] = CELL_ALIVE;
                    else
                        this.nextGrid[y][x] = CELL_EMPTY;
                } else {
                    if(neighbours<=1)
                        this.nextGrid[y][x] = CELL_EMPTY;
                    else if(neighbours<=3)
                        this.nextGrid[y][x] = CELL_ALIVE;
                    else
                        this.nextGrid[y][x] = CELL_EMPTY;
                }
            }
        }

        this.swapGrids();
    }
};

// setup periodic updates
setInterval(function() {
    gameOfLife.tick();
    gameOfLife.drawGrid();
}, UPDATE_RATE);

// setup mouse input
canvas.addEventListener('click', function(e) {
    if(!gameOfLife.isPaused) {
        return;
    }

    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    y = Math.floor(y/CELL_HEIGHT);
    x = Math.floor(x/CELL_WIDTH);

    if(gameOfLife.grid[y][x]==CELL_EMPTY)
        gameOfLife.grid[y][x] = CELL_ALIVE;
    else
        gameOfLife.grid[y][x] = CELL_EMPTY;
});

// spacebar for pause/unpause
window.addEventListener('keyup', function(e) {
    if(e.keyCode==KEY_SPACEBAR)
        gameOfLife.isPaused = !gameOfLife.isPaused;
});

// the play/pause button
document.getElementById("btnPlay").onclick = function() {
    gameOfLife.isPaused = !gameOfLife.isPaused;
};

// the randomize button
document.getElementById("btnRandom").onclick = function() {
    for(var y=0; y<GOL_HEIGHT; y++) {
        for(var x=0; x<GOL_WIDTH; x++) {
            // 25% chance of being alive
            gameOfLife.grid[y][x] = Math.random() < 0.25 ? CELL_ALIVE : CELL_EMPTY;
        }
    }
};
