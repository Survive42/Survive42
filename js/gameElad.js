/**
 * Created by Elad silberring on 28/03/2015.
 */
var game = new Phaser.Game(800, 625, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('bg', 'assets2/background.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.spritesheet('plat_small', 'assets2/platform_small.png',122,30);
    game.load.spritesheet('plat_mid', 'assets2/platform_mid.png',217, 30);
    game.load.spritesheet('plat_big', 'assets2/platform_big.png', 272, 30);
    //game.load.image('sandwatch', 'assets2/sandwatch1.png');
    game.load.spritesheet('sandwatch', 'assets2/sandwatch_all.png',90, 90);
    game.load.spritesheet('dude', 'assets2/man_all.png', 80, 100);
    game.load.spritesheet('end_game', 'assets2/end_game.png', 800, 630);
    game.load.spritesheet('beast', 'assets2/beast_basic.png', 140, 140);
    game.load.spritesheet('ground_bottom', 'assets2/platform_bottom.png', 370, 30);
	//game.load.spritesheet('dude', '../assets2/man_run.png', 80, 100);
	//game.load.spritesheet('dude', '../assets2/man_run_towel.png', 80, 100);
	//game.load.spritesheet('dude', '../assets2/man_jump.png', 80, 100);
	//game.load.spritesheet('dude', '../assets2/man_jump_towel.png', 80, 100);
    game.load.image('splash_bg', 'assets2/splash_background.png');
    game.load.image('splash_btn', 'assets2/start_button.png');
}

var player;
var beast;
var platforms;
var cursors;
var sandwatchs;
var score = 1;
var scoreText;
/* ADDED THIS */

var splash_bg;
var anim;
var end_game_bg;
var splash_btn;
var author_arr = [];
var authors = [
    {
        title:'Design: Eran Mendel',
        left: 50,
        link: 'www.eranmendel.com'
    },
    {
        title:'Animation: Oren Mashkovski',
        left: 200,
        link: 'www.mashko.com'
    },
    {
        title:'Developers: Elad Silver',
        left: 380,
        link: 'www.linkedin.com/pub/elad-silver/67/a28/b71'
    },
    {
        title:'& Ron Kalian',
        left: 500,
        link: 'www.kalian.co.uk'
    },
    {
        title:'Sound Design: Uri Kalian',
        left: 610,
        link: 'www.sweetsound.co.il'
    }
];

/* END ADDING */
var timer;
var i=0;
var ledges = [
    { ledge_x : 180, ledge_y : 160, frame : 1, width : 270 , sprite : 'plat_big'},
    { ledge_x : 470, ledge_y : 100, frame : 0, width : 217 , sprite : 'plat_mid'},
    { ledge_x : 460, ledge_y : 210, frame : 3, width : 217 , sprite : 'plat_mid'},
    { ledge_x : 100, ledge_y : 250, frame : 0, width : 122 , sprite : 'plat_small'},
    { ledge_x : 230, ledge_y : 310, frame : 0, width : 270 , sprite : 'plat_big'},
    { ledge_x : 80, ledge_y : 400, frame : 1, width : 217 , sprite : 'plat_mid'},
    { ledge_x : 500, ledge_y : 400, frame : 2, width : 217 , sprite : 'plat_mid'},
    //ground :
    { ledge_x : 0  , ledge_y : 514, frame : 0, sprite : 'ground_bottom'},
    { ledge_x : 420, ledge_y : 514, frame : 1, sprite : 'ground_bottom'},
    { ledge_x : 0  , ledge_y : 124, frame : 1, sprite : 'plat_small'},
    { ledge_x : 696, ledge_y : 172, frame : 2, sprite : 'plat_small'}
];

function create() {
//  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.add.sprite(0, 0, 'bg');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    //  Now let's create ledges from top to bottom, and place time watches on them
    sandwatchs = game.add.group();
    sandwatchs.enableBody = true;
    for(i=0;i<ledges.length;i++){
        var ledge =  platforms.create(ledges[i].ledge_x, ledges[i].ledge_y, ledges[i].sprite, ledges[i].frame);
        initLedge(ledge);
        // if not ground
        if(!(i > 6))
            createSandwatch( ledges[i].ledge_x + (ledges[i].width/2 - 45),  ledges[i].ledge_y - 60);
    }

    player = game.add.sprite(32, 124, 'dude');
    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    //sets the size different from the sprite size
    player.body.setSize(25, 90, 0, 0);

    //  Player physics properties. Give the little guy a slight bounce.
    //player.body.bounce.y = 0.2;
    player.body.gravity.y = 400;
    player.body.collideWorldBounds = true;
    //  Our two animations, walking left and right.
    // player.animations.add('left', [0, 1, 2, 3], 10, true);
    var animation_arr = ['idle', 'walk', 'jump', 'idle_towel', 'walk_towel', 'jump_towel' ];
    for(i=0; i < animation_arr.length; i++){
        player.animations.add(animation_arr[i], [0+(i*10), 1+(i*10), 2+(i*10), 3+(i*10), 4+(i*10), 5+(i*10), 6+(i*10), 7+(i*10), 8+(i*10), 9+(i*10)], 10, true);
    }
    player.anchor.setTo(.5, 1); //so it flips around its middle


    beast = game.add.sprite(600, 514, 'beast');
    //  We need to enable physics on the beast
    game.physics.arcade.enable(beast);
    //  beast physics properties. Give the little guy a slight bounce.
    beast.body.bounce.y = 0.2;
    beast.body.gravity.y = 400;
    beast.body.collideWorldBounds = true;
    //  Our two animations, walking left and right.
    // beast.animations.add('left', [0, 1, 2, 3], 10, true);
    beast.animations.add('idle', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true);
    //beast.animations.add('walk', [10, 11, 12, 13, 14, 15, 16, 17], 10, true);
    //beast.animations.add('jump', [30, 31, 32, 33, 34, 35], 10, true);
    //beast.animations.add('run_towel', [20, 21, 22, 23, 24, 25, 26, 27], 10, true);
    //beast.animations.add('jump_towel', [40, 41, 42, 43, 44, 45], 10, true);
    beast.anchor.setTo(.5, 1); //so it flips around its middle
    beast.scale.x = -1;


    cursors = game.input.keyboard.createCursorKeys();

    scoreText = game.add.text(382, 500,'',{ font: 'normal 38px digital', fill: '#FFF' });
    //scoreText.text = ''
    timer = game.time.create(false);
    timer.loop(1000, updateScore, this);

    /* ADDED THIS */

    splash_bg = this.add.sprite(0, 0, 'splash_bg');
    end_game_bg = game.add.sprite(0, 0, 'end_game');
    end_game_bg.visible = false;
    anim = end_game_bg.animations.add('end');
    anim.onLoop.add(endAnimationLooped, this);
    // Docs http://phaser.io/docs/Phaser.Button.html/Phaser.Button.html

    splash_btn = this.startButton = this.game.add.button(300, 400, 'splash_btn', startGame);
    s_arr = []
    for(var i=0;i<authors.length;i++){
        var author = game.add.text(authors[i].left, 10, authors[i].title,{ font: 'normal 11px Open Sans', fill: '#FFF' });
        author.inputEnabled = true;
        author.link = authors[i].link;
        author.events.onInputDown.add(linkTo, this);
        author_arr.push(author);
        s_arr.push(author);
    }

    /* END ADDING */

}

function update() {
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(beast, platforms);
    game.physics.arcade.collide(sandwatchs, platforms);
    game.physics.arcade.overlap(player, sandwatchs, collectSandwatch, null, this);
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    beast.animations.play('idle');
    if (cursors.left.isDown )
    {
        player.body.velocity.x = -250;
        if(player.body.touching.down)
            player.animations.play('walk');
        player.scale.x = -1; //facing default direction
        //  Move to the left


    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 250;
        if(player.body.touching.down)
            player.animations.play('walk');
        player.scale.x = 1; //facing default direction
    }
    else
    {
        //  Stand still TODO: replace to onFloor()
        if(player.body.touching.down)
            player.animations.play('idle');
        else{
            player.animations.play('jump');
        }
    }

    //  Allow the player to jump if touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.animations.play('jump');
        player.body.velocity.y = -250;
    }

    screenWrap(player)
}

function createSandwatch(pos_x, pos_y ,watch_group){

    //  Create a sandwatch inside of the 'sandwatchs' group
    var sandwatch = sandwatchs.create(pos_x, pos_y, 'sandwatch', 9);

    //  Let gravity do its thing
    sandwatch.body.gravity.y = 30;
    sandwatch.body.setSize(45,24,20,30);
    //  This just gives each sandwatch a slightly random bounce value
    sandwatch.body.bounce.y = 1;
}

// TODO: just move the sandwatch instead of destroying it with: obj.reset(x, y)
function collectSandwatch (player, sandwatch) {
    // Removes the sandwatch from the screen
    sandwatch.kill();
    //  Add and update the score
    score += 2;
    scoreText.text = score;
}

function updateScore(){
    score -= 1;
    scoreText.text = score;
    if(score == 0){
        timer.stop();
        /* ADDED THIS */
        end_game_bg.visible = true;
        anim.play(12, true);
        /* END ADDING */
        //alert('game over!');
    }
}

function initLedge(ledge){
    ledge.body.immovable = true;
    ledge.body.checkCollision.down = false;
    ledge.body.checkCollision.left = false;
    ledge.body.checkCollision.right = false;
}

function screenWrap (sprite) {
     if (sprite.y > game.height -10)
        sprite.y = 0;
}

/* ADDED THIS */
function linkTo(item){
    window.location.href = 'http://' + item.link;
}

function startGame (){
    console.log('starting game');
    for(var i=0;i<author_arr.length;i++)
        author_arr[i].kill();
    splash_bg.kill();
    splash_btn.kill();
    timer.start();

}

function endAnimationLooped(sprite, animation){
    console.log('complete');
    animation.stop();
    sprite.currentFrame=19;
}
/* END ADDING */