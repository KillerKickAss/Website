var blockSize = 20;
var rows = 40;
var cols = 40;

var board;
var context;

var snakex;
var snakey;

var snakeBody = [];

var velocityx;
var velocityy;

var fruitx;
var fruity;

var gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.height=rows*blockSize;
    board.width=cols*blockSize;
    context = board.getContext("2d");

    document.addEventListener("keydown", handleKey);

    resetGame();
    update();
}

function resetGame(){
    velocityx = 0;
    velocityy = 0;
    gameOver = false;
    spawnFruit();
    spawnSnake();
}

function update(){
    for(let i = snakeBody.length -1; i > 0; i--){
        snakeBody[i] = snakeBody[i -1];
    }

    if(snakeBody.length)snakeBody[0] =[snakex, snakey];

    snakex += velocityx * blockSize;
    snakey += velocityy * blockSize;

    if(snakex == fruitx && snakey == fruity){
        snakeBody.push([snakex, snakey]);
        spawnFruit();
    }

    draw();
}

function draw(){
    //board
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);

    //fruit
    context.fillStyle = "red";
    context.fillRect(fruitx, fruity, blockSize, blockSize);

    //snake
    context.fillStyle = "lime";
    context.fillRect(snakex, snakey, blockSize, blockSize);

    //snake body
    for(let i = 0; i < snakeBody.length; i++){
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize)
    }
}

function spawnFruit(){
    fruitx = Math.floor(Math.random()*cols)*blockSize;
    fruity = Math.floor(Math.random()*rows)*blockSize;
    for(const seg of snakeBody){
        if (seg[0]==foodx&&seg[1]==foody){
            spawnFruit();
            return;
        }
    }
}

function spawnSnake(){
    do{
    snakex = Math.floor(Math.random()*cols)*blockSize;
    snakey = Math.floor(Math.random()*rows)*blockSize;
    }while(snakex == fruitx || snakey == fruity);
}

function handleKey(e){
    if(e.code == "ArrowUp" && velocityy != 1){
        velocityx = 0;
        velocityy = -1;
    }else if(e.code == "ArrowDown" && velocityy != -1){
        velocityx = 0;
        velocityy = 1;
    }else if(e.code == "ArrowLeft" && velocityx != 1){
        velocityx = -1;
        velocityy = 0;
    }else if(e.code == "ArrowRight"&& velocityx != -1){
        velocityx = 1;
        velocityy = 0;
    }
    update();
}