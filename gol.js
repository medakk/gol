"use strict";

// gol.js
// Conway's Game of Life Implementation

// Version 0.3
// Uses a sparse matrix

// canvas size
const WIDTH = 800;
const HEIGHT = 400;

// to determine framerate
// update very UPDATE_RATE ms
const UPDATE_RATE = 0;

// GOL size
const GOL_DIV = 4;
const GOL_WIDTH = Math.floor(WIDTH/GOL_DIV);
const GOL_HEIGHT = Math.floor(HEIGHT/GOL_DIV);

// for drawing
const CELL_WIDTH = WIDTH/GOL_WIDTH;
const CELL_HEIGHT = HEIGHT/GOL_HEIGHT;
const GAP = 1; // gap between cells in pixels

// colors
const COLOR_EMPTY = '#DDDDDD';
const COLOR_ALIVE = '#33DD33';
const COLOR_PAUSE = '#111111';

// cell states
const CELL_EMPTY = 0;
const CELL_ALIVE = 1;

// for input
const KEY_SPACEBAR = 32;
const KEY_LEFT     = 37;
const KEY_UP       = 38;
const KEY_RIGHT    = 39;
const KEY_DOWN     = 40;

// obtain canvas and context from the DOM
var canvas = document.getElementById('canvasGol');
canvas.width = WIDTH;
canvas.height = HEIGHT;
var ctx = canvas.getContext('2d');

var gameOfLife = {
    grid:     SparseMatrix(CELL_EMPTY),
    nextGrid: SparseMatrix(CELL_EMPTY),

    iterCount: 0,
    startTime: 0,
    elapsedTime: 0,

    //used for panning
    xOffset: 0,
    yOffset: 0,

    isPaused: true,

    // draws the given grid onto the canvas
    drawGrid: function() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        for(var y=0; y<GOL_HEIGHT; y++) {
            for(var x=0; x<GOL_WIDTH; x++) {
                if(this.grid.get(y+this.yOffset, x+this.xOffset)==CELL_EMPTY)
                    ctx.fillStyle = COLOR_EMPTY;
                else
                    ctx.fillStyle = COLOR_ALIVE;

                ctx.fillRect(x*CELL_WIDTH+GAP/2,
                             y*CELL_HEIGHT+GAP/2,
                             CELL_WIDTH-GAP/2,
                             CELL_HEIGHT-GAP/2);
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

        if(this.grid.get(y-1, x-1) == CELL_ALIVE)
            count++;
        if(this.grid.get(y-1, x) == CELL_ALIVE)
            count++;
        if(this.grid.get(y-1, x+1) == CELL_ALIVE)
            count++;

        if(this.grid.get(y, x-1) == CELL_ALIVE)
            count++;
        if(this.grid.get(y, x+1) == CELL_ALIVE)
            count++;
            
        if(this.grid.get(y+1, x-1) == CELL_ALIVE)
            count++;
        if(this.grid.get(y+1, x))
            count++;
        if(this.grid.get(y+1, x+1) == CELL_ALIVE)
            count++;

        return count;
    },

    // swaps grid and nextGrid
    swapGrids: function() {
        var tmp = this.grid;
        this.grid = this.nextGrid;
        this.nextGrid = tmp;
    },

    // evaluates a cell
    evalCell: function(y, x, visited) {
        if(visited.get(y,x)) {
            return;
        }
        visited.set(y,x,true);

        var neighbours = this.neighbourCount(y, x);

        if(this.grid.get(y, x)==CELL_EMPTY) {
            if(neighbours==3)
                this.nextGrid.set(y, x, CELL_ALIVE);
            else
                this.nextGrid.set(y, x, CELL_EMPTY);
        } else {
            if(neighbours<=1)
                this.nextGrid.set(y, x, CELL_EMPTY);
            else if(neighbours<=3)
                this.nextGrid.set(y, x, CELL_ALIVE);
            else
                this.nextGrid.set(y, x, CELL_EMPTY);
        }
    },

    // goes through the grid and stores the
    // next state in nextGrid. Finally, swaps
    // the grid and newGrid
    tick: function() {
        if(this.isPaused)
            return;
        this.iterCount++;

        var visited = SparseMatrix(false);
        this.nextGrid = SparseMatrix(CELL_EMPTY);
        for(var y in this.grid.data) {
            for(var x in this.grid.data[y]) {
                // stupid stupid stupid
                y = Number(y);
                x = Number(x);

                this.evalCell(y-1, x-1, visited);
                this.evalCell(y-1, x  , visited);
                this.evalCell(y-1, x+1, visited);
                this.evalCell(y  , x-1, visited);
                this.evalCell(y  , x  , visited);
                this.evalCell(y  , x+1, visited);
                this.evalCell(y+1, x-1, visited);
                this.evalCell(y+1, x  , visited);
                this.evalCell(y+1, x+1, visited);
            }
        }

        //this.swapGrids();
        this.grid = this.nextGrid;

        if(this.iterCount%10==0)
            this.updateStats();

        if(this.isStep) {
            this.isStep = false;
            this.togglePause();
        }
    },

    updateStats: function() {
        var currTime = performance.now()
        this.elapsedTime += (currTime - this.startTime)/1000;
        this.startTime = currTime;
        document.getElementById('txtStats').innerHTML = 
            'Iterations: ' + this.iterCount + ' | Time elapsed: ' + this.elapsedTime.toFixed(2) + 's';
    },

    togglePause: function() {
        gameOfLife.isPaused = !gameOfLife.isPaused;
        if(gameOfLife.isPaused) {
            this.updateStats();
            document.getElementById('btnStep').disabled = false;
        } else {
            this.startTime = performance.now();
            document.getElementById('btnStep').disabled = true;
        }
    },

    step: function() {
        if(!this.isPaused)
            return;
        this.isStep = true;
        this.togglePause();
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

    y = Math.floor(y/CELL_HEIGHT) + gameOfLife.yOffset;
    x = Math.floor(x/CELL_WIDTH)  + gameOfLife.xOffset;

    if(gameOfLife.grid.get(y, x)==CELL_EMPTY)
        gameOfLife.grid.set(y, x, CELL_ALIVE);
    else
        gameOfLife.grid.set(y, x, CELL_EMPTY);
});

// spacebar for pause/unpause
window.addEventListener('keydown', function(e) {
    switch(e.keyCode) {
    case KEY_SPACEBAR:
        gameOfLife.togglePause();
        break;
    case KEY_LEFT:
        gameOfLife.xOffset--;
        break;
    case KEY_RIGHT:
        gameOfLife.xOffset++;
        break;
    case KEY_UP:
        gameOfLife.yOffset--;
        break;
    case KEY_DOWN:
        gameOfLife.yOffset++;
        break;
    default:
        break;
    }
});

// the play/pause button
document.getElementById('btnPlay').onclick = function() {
    gameOfLife.togglePause();
}

// the step button
document.getElementById('btnStep').onclick = function() {
    gameOfLife.step();
}

// the randomize button
document.getElementById('btnRandom').onclick = function() {
    for(var y=0; y<GOL_HEIGHT; y++) {
        for(var x=0; x<GOL_WIDTH; x++) {
            // 25% chance of being alive
            gameOfLife.grid.set(y+gameOfLife.yOffset, x+gameOfLife.xOffset,
                                Math.random() < 0.25 ? CELL_ALIVE : CELL_EMPTY);
        }
    }
};
