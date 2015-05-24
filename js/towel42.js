/*
 * Created by Elad silberring on 28/03/2015.
 * and Ron Kalian 11/5/2015.
 */

var game = new Phaser.Game(800, 625, Phaser.AUTO, 'putgamehere', { preload: preload, create: create, update: update });
var isGameOver = false, isGameStarted = false, endTextExists = false;
var myFont = 'comfortaa';
var bold = 'bold';  // activate bold by changing this var

var endText;
var initialScore = 43, score, totalScore;
var manPrevAction = 'nothing';
var thisLine = 0;
var ANIM_FRAME_RATE = 20;
var debug = false, scoreDebug = false, beastAnimDebug = false, manSoundDebug = true, soundDebug = true;

var towelSizeX = 40, towelSizeY = 70;
var towelState = "noTowel";  // refers to 'towel in the wild' not towel on player's head
var playerSound = null;

function myLoadAudio(a,b) {
    var retVal = null;
    
    try {
        retVal = game.load.audio(a,b);
    }
    catch(err) {
        console.log('load audio ' + a + ' exception: ' + err);
    }
    if (retVal == null) {
        console.log('load audio ' + a + ' returned null');
    }
    return retVal;
}

function preload() {
    game.load.image('bg', 'assets2/background.png');
    game.load.image('splash_bg', 'assets2/splash_background.png');
    game.load.image('splash_btn', 'assets2/start_button.png');

    game.load.spritesheet('plat_small', 'assets2/platform_small.png',122,30);
    game.load.spritesheet('plat_mid', 'assets2/platform_mid.png',217, 30);
    game.load.spritesheet('plat_big', 'assets2/platform_big.png', 272, 30);
    game.load.spritesheet('sandwatch', 'assets2/sandwatch_all.png',90, 90);
    game.load.spritesheet('dude', 'assets2/man_all.png', 80, 100);
    game.load.spritesheet('beast', 'assets2/beast_basic.png', 140, 140);
    game.load.spritesheet('towel', 'assets2/towel.png', 70, 70);
    game.load.spritesheet('ground_bottom', 'assets2/platform_bottom.png', 365, 4);
    game.load.spritesheet('end_game', 'assets2/end_game.png', 800, 625);

    var res;
    res = myLoadAudio('manRun', ['sound/Survive_Man_Run.mp3', 'sound/Survive_Man_Run.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
    res = myLoadAudio('manJump', ['sound/Survive_Man_Jump.mp3', 'sound/Survive_Man_Jump.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
    res = myLoadAudio('manFall', ['sound/Survive_Man_Fall.mp3', 'sound/Survive_Man_Fall.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
    res = myLoadAudio('manLand', ['sound/Survive_Man_Land.mp3', 'sound/Survive_Man_Land.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
    res = myLoadAudio('grabClock', ['sound/Survive_Man_Grab_Clock.mp3', 'sound/Survive_Man_Grab_Clock.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
    res = myLoadAudio('grabTowel', ['sound/Survive_Man_Grab_Towel.mp3', 'sound/Survive_Man_Grab_Towel.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);

    res = myLoadAudio('monsterRun', ['sound/Survive_Monster_run.mp3', 'sound/Survive_Monster_run.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);

    res = myLoadAudio('monsterConfused', ['sound/Survive_Monster_Confused.mp3', 'sound/Survive_Monster_Confused.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
    res = myLoadAudio('monsterEat', ['sound/Survive_Monster_Eat.mp3', 'sound/Survive_Monster_Eat.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
    res = myLoadAudio('monsterFly', ['sound/Survive_Monster_Fly.mp3', 'sound/Survive_Monster_Fly.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
    res = myLoadAudio('monsterIdle', ['sound/Survive_Monster_Idle.mp3', 'sound/Survive_Monster_Idle.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);

    res = myLoadAudio('towelAppear', ['sound/Survive_Towel_Appear.mp3', 'sound/Survive_Towel_Appear.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
    res = myLoadAudio('towelVanish', ['sound/Survive_Towel_Vanish.mp3', 'sound/Survive_Towel_Vanish.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);

    // res = myLoadAudio('clockAppear', ['sound/Survive_Clock_Appear.mp3', 'sound/Survive_Clock_Appear.ogg']);
    res = myLoadAudio('gameOver', ['sound/Survive_Game_Over.mp3', 'sound/Survive_Game_Over.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
    res = myLoadAudio('gameTheme', ['sound/Survive_Game_Theme.mp3', 'sound/Survive_Game_Theme.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
    res = myLoadAudio('splash', ['sound/Survive_Splash.mp3', 'sound/Survive_Splash.ogg']);
    if (soundDebug) console.log('myLoadAudio : ' + res);
}

var gameOver, manFall, grabClock, grabTowel, manJump, manLand, manRun, monsterConfused, monsterEat, monsterRun, monsterFly, monsterIdle, towelAppear, towelVanish, /*clockAppear,*/ gameTheme, splash;

var player //, playerX, playerY;
var beast;
var beastCanMove = false;
var beastEatingPlayer = false;
var towel;
var platforms;
var cursors;
var sandwatches;
var scoreText;
// var debugText ;
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
    // rest :
    { ledge_x : 0  , ledge_y : 124, frame : 1, width : 119 , sprite : 'plat_small'},
    { ledge_x : 470, ledge_y : 100, frame : 0, width : 217 , sprite : 'plat_mid'},
    { ledge_x : 180, ledge_y : 160, frame : 1, width : 270 , sprite : 'plat_big'},
    { ledge_x : 679, ledge_y : 172, frame : 2, width : 121 , sprite : 'plat_small'},
    { ledge_x : 460, ledge_y : 210, frame : 3, width : 217 , sprite : 'plat_mid'},
    { ledge_x : 100, ledge_y : 250, frame : 0, width : 122 , sprite : 'plat_small'},
    { ledge_x : 230, ledge_y : 310, frame : 0, width : 270 , sprite : 'plat_big'},
    { ledge_x : 80, ledge_y : 400, frame : 1, width : 217 , sprite : 'plat_mid'},
    { ledge_x : 500, ledge_y : 400, frame : 2, width : 217 , sprite : 'plat_mid'},
    //ground :
    { ledge_x : 0  , ledge_y : 514, frame : 0, width : 365 , sprite : 'ground_bottom'},
    { ledge_x : 435, ledge_y : 514, frame : 1, width : 365 , sprite : 'ground_bottom'}
];

var sandwatchArr = [];

var playerTowelStatus = 'noTowel';

var player_arr = [
    {state : 'noTowel', action : 'idle', anim : 'idle', sound : null},
    {state : 'noTowel', action : 'walk', anim : 'walk', sound : manRun},
    {state : 'noTowel', action : 'jump', anim : 'jump', sound : manJump},
    {state : 'towel', action : 'idle', anim : 'idle_towel', sound : null},
    {state : 'towel', action : 'walk', anim : 'walk_towel', sound : manRun},
    {state : 'towel', action : 'jump', anim : 'jump_towel', sound : manJump},
    {state : 'EOTowel', action : 'idle', anim : 'idle_EOTowel', sound : null},
    {state : 'EOTowel', action : 'walk', anim : 'walk_EOTowel', sound : manRun},
    {state : 'EOTowel', action : 'jump', anim : 'jump_EOTowel', sound : manJump}
    // ,
    // {state : 'noTowel', action : 'killed', anim : 'empty', sound : ''}
];

var sounds, soundsReady = false;
var text;

function create() {

//  We're going to be using physics, so enable the Arcade Physics system
    game.add.sprite(0, 0, 'bg');

    timer = game.time.create(false);

    splash = myAddAudio('splash');
    /* ADDED THIS */

    splash_bg = this.add.sprite(0, 0, 'splash_bg');
    end_game_bg = game.add.sprite(0, 0, 'end_game');
    end_game_bg.visible = false;
    var anim_seq = [], i;
    for (i = 0; i <= 19; ++i) anim_seq.push(i);

    anim = end_game_bg.animations.add('end', anim_seq, ANIM_FRAME_RATE, false);
    //anim = end_game_bg.animations.add('endend', [19], ANIM_FRAME_RATE, false);
    anim.onComplete.add(endAnimationLooped, this);
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

    sounds = [splash];
    
    game.sound.setDecodedCallback(sounds, recreate, this);
    console.log('end of create()');
}

function myAddAudio(x) {
    var retVal = null;
    try {
        retVal = game.add.audio(x);
    }
    catch(err) {
        console.log('loading of ' + x + 'error:' + err);
    }
    if (retVal == null) {
        console.log('loading of ' + x + ' returned null');
    }
    return retVal;
}

function recreate() {
    splash.loopFull();

    manRun = myAddAudio('manRun');
    manFall = myAddAudio('manFall');
    manJump = myAddAudio('manJump');
    manLand = myAddAudio('manLand');
    gameOver = myAddAudio('gameOver');
    gameTheme = myAddAudio('gameTheme');
    grabClock = myAddAudio('grabClock');
    grabTowel = myAddAudio('grabTowel');    
    monsterConfused = myAddAudio('monsterConfused');
    monsterEat = myAddAudio('monsterEat');
    monsterRun = myAddAudio('monsterRun');
    monsterFly = myAddAudio('monsterFly');
    monsterIdle = myAddAudio('monsterIdle');
    towelAppear = myAddAudio('towelAppear');
    towelVanish = myAddAudio('towelVanish');
//    clockAppear= game.add.audio('clockAppear');

    sounds = [gameOver, manFall, grabClock, grabTowel, manJump, manLand, manRun, monsterConfused, monsterEat, monsterRun, monsterFly, monsterIdle, towelAppear, towelVanish, /*clockAppear,*/ gameTheme];
    
    game.sound.setDecodedCallback(sounds, create2, this);
    console.log('end of recreate()');
}

var create2firstRun = true;
function create2() {
    console.log('in create2()');
    if (create2firstRun) {
        timer.start();
        sounds.shift();
        create2firstRun = false;
        console.log('done firstrun');
    }

    if (isGameStarted) {
        console.log('isGameStarted == true');
        create3();
    }
    else {
        console.log('isGameStarted == false');
        timer.add(1000, create2, this, null);
    }
}

function create3() {
    console.log('create3 will run now');
    splash.stop();
    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    //  Now let's create ledges from top to bottom, and place time watches on them
    for(i=0;i<ledges.length;i++){
        var ledge =  platforms.create(ledges[i].ledge_x, ledges[i].ledge_y, ledges[i].sprite, ledges[i].frame);
        initLedge(ledge);
        ledge.body.setSize(ledges[i].width, 30);
    }

    scoreText = game.add.text(360, 520,'',{ font: 'normal 72px digital', fill: '#FFF' });
//    scoreText = 'Decoding ...';
    gameTheme.loopFull();
    if (scoreDebug) logScore('timer started');

    soundsReady = true;
//    scoreText = 'Decoding complete!';
    // create sandwatches
    sandwatches = game.add.group();
    sandwatches.enableBody = true;
    for (i = 0 ; i < ledges.length ; i++) {
        if (ledges[i].sprite == 'ground_bottom') {
            sandwatchArr.push({x : ledges[i].ledge_x + (ledges[i].width/2 - 100), y : ledges[i].ledge_y - 60, exists : false, taken : false, i : sandwatchArr.length});
            sandwatchArr.push({x : ledges[i].ledge_x + (ledges[i].width/2 + 100), y : ledges[i].ledge_y - 60, exists : false, taken : false, i : sandwatchArr.length});
        }
        else {
            sandwatchArr.push({x : ledges[i].ledge_x + (ledges[i].width/2 - 45), y : ledges[i].ledge_y - 60, exists : false, taken : false, i : sandwatchArr.length});
        }
    }
    sandwatchArr[0].exists = true;  // disable the first one
    for (i = 0 ; i < 6 ; i++) {
        var created = false;
        while (created == false) {
            x = Math.floor(Math.random() * (sandwatchArr.length));    
            if (sandwatchArr[x].exists == false) {
                createSandwatch(x);
                created = true;
            }
        }
    }

    player_arr = [
        {state : 'noTowel', action : 'idle', anim : 'idle', sound : null},
        {state : 'noTowel', action : 'walk', anim : 'walk', sound : manRun},
        {state : 'noTowel', action : 'jump', anim : 'jump', sound : manJump},
        {state : 'towel', action : 'idle', anim : 'idle_towel', sound : null},
        {state : 'towel', action : 'walk', anim : 'walk_towel', sound : manRun},
        {state : 'towel', action : 'jump', anim : 'jump_towel', sound : manJump},
        {state : 'EOTowel', action : 'idle', anim : 'idle_EOTowel', sound : null},
        {state : 'EOTowel', action : 'walk', anim : 'walk_EOTowel', sound : manRun},
        {state : 'EOTowel', action : 'jump', anim : 'jump_EOTowel', sound : manJump}
    ];    
    // more setup...
    beast = game.add.sprite(600, 514, 'beast');
    setupPlayer(32, 124);
    //  We need to enable physics on the beast
    game.physics.arcade.enable(beast);
    //  beast physics properties. Give the little guy a slight bounce.
    beast.body.setSize(80,80,0,0);
    beast.body.bounce.y = 0.2;
    beast.body.gravity.y = 1000;
    beast.body.collideWorldBounds = true;
    //  Our two animations, walking left and right.
    // row 0 idle
    // row 1 walk
    // row 2 jump
    // row 3 man has towel - it stands and confuseds
    
    var anim_seq = [], i;
    for (i = 0; i <= 9; ++i) anim_seq.push(i);
    beast.animations.add('idle', anim_seq, ANIM_FRAME_RATE, true);
    anim_seq = [];
    for (i = 10; i <= 19; ++i) anim_seq.push(i);
    beast.animations.add('walk', anim_seq, ANIM_FRAME_RATE, true);
    anim_seq = [];
    for (i = 20; i <= 29; ++i) anim_seq.push(i);
    beast.animations.add('jump', anim_seq, ANIM_FRAME_RATE, true);
    anim_seq = [];
    for (i = 30; i <= 39; ++i) anim_seq.push(i);
    beast.animations.add('confused', anim_seq, ANIM_FRAME_RATE, true);
    anim_seq = [];
    for (i = 40; i <= 89; ++i) anim_seq.push(i);
    beast.animations.add('eat_man', anim_seq, ANIM_FRAME_RATE, false);
    
    thisLine = new Error().lineNumber;
    if (beastAnimDebug) logAnim(beast, thisLine, 'idle');
    beast.animations.play('idle');
    beast.anchor.setTo(.5, 1); //so it flips around its middle
    beast.scale.x = -1;

    //  towel physics properties. Give the little guy a slight bounce.
    //towel.body.bounce.y = 0.2;
    // towel.body.immovable = true;

    cursors = game.input.keyboard.createCursorKeys();

    score = initialScore;
    totalScore = score;
    if (scoreDebug) logScore('initial');
    generateTowel(true);
    timer.loop(1000, updateScore, this);
    if (scoreDebug) logScore('timer loop started');
    //timer.start();
    
    // TEMP timer.add(3000, letBeastMove, this, null);
    //gameTheme.stop();
    timer.add(3000, letBeastMove, this, null);
}

function update() {
    // if (debug) console.log('update');
    if (soundsReady == false) {
        return;
    }
    if (endTextExists) {
        if (endText.y < 225) {
            rate = Math.floor((240 - endText.y) / 15);
            endText.y += rate;
        }
        else {
            endTextExists = false;
            soundsReady = false; // dirty hack to disable update()
            // endText.destroy();
            timer.add(500, showFinalScore, this, 1);
        }
        return;
    }
    if (isGameOver) {
        player.kill();
        return;
    }
    
    game.physics.arcade.collide(sandwatches, platforms);
    game.physics.arcade.collide(towel, platforms);
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(beast, platforms);
    if (towelState != 'noTowel') {
        towel.animations.play(towelState);
    }
    beast.body.velocity.x = 0;
    beast.body.velocity.y = 0;
    if (beastEatingPlayer) {
        beast.body.gravity.y = 10000;
        manAudio(null);
        monsterRun.stop();
        console.log('monsterRun stop');
        // monster.body.velocity.y = 300;
        //player.animations.destroy();
        thisLine = new Error().lineNumber;
        if (beastAnimDebug) logAnim(beast, thisLine, 'eat_man');
        beast.animations.play('eat_man');
    }
    else {
        if (playerTowelStatus == 'noTowel') {
            game.physics.arcade.overlap(beast, player, eatPlayer, null, this);
        }
        game.physics.arcade.overlap(player, sandwatches, collectSandwatch, null, this);
        // game.physics.arcade.overlap(beast, player, eatPlayer, null, this);
        game.physics.arcade.overlap(player, towel, getTowel, null, this);
        //  Reset the players velocity (movement)
        player.body.velocity.x = 0;
        if (cursors.left.isDown )
        {
            player.body.velocity.x = -250;
            if(player.body.touching.down) {
                playerNextAction(playerTowelStatus, 'walk');
            }
            else{
                playerNextAction(playerTowelStatus, 'jump');
            }
            player.scale.x = -1; //facing default direction
            //  Move to the left

        }
        else if (cursors.right.isDown)
        {
            //  Move to the right
            player.body.velocity.x = 250;
            if(player.body.touching.down) {
                playerNextAction(playerTowelStatus, 'walk');
            }
            else{
                playerNextAction(playerTowelStatus, 'jump');
            }
            player.scale.x = 1; //facing default direction
        }
        else
        {
            //  Stand still TODO: replace to onFloor()
            if(player.body.touching.down) {
                playerNextAction(playerTowelStatus, 'idle');
            }
            else{
                playerNextAction(playerTowelStatus, 'jump');
            }
        }

        //  Allow the player to jump if touching the ground.
        if ((cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) && player.body.touching.down)
        {
            playerNextAction(playerTowelStatus, 'jump');
            player.body.velocity.y = -300;
        }
        if (getSign(player.body.velocity.x) != 0) {
            player.scale.x = getSign(player.body.velocity.x);
        }

        var movementThreshold = 5;

        // Monster
        if ((beastCanMove) && (playerTowelStatus == 'noTowel')) {
            // now beast to do something useful
            if ((beast.body.velocity.y < 10) && (player.y - beast.y > 50)) {
                // player hiding under a ledge and beast 'stuck' on that ledge
                // make it go to the edges
                beast.body.velocity.x = (beast.x > game.width / 2) ? 150 : -150;
                // UNLESS if on top 2 ledges which go all the way to game edge, then
                // make beast go to centre of board
/*    { ledge_x : 0  , ledge_y : 124, frame : 1, width : 119 , sprite : 'plat_small'},
    { ledge_x : 679, ledge_y : 172, frame : 2, width : 121 , sprite : 'plat_small'},*/
                if ((beast.y == 124 || beast.y == 172) && ((beast.x > 679 - 80) || (beast.x < 124 + 80))) 
                    beast.body.velocity.x *= -1;
                beast.body.velocity.y = 150;
            }
            else {
                beast.body.velocity.y = getSign(player.y - beast.y) * 150;
                beast.body.velocity.x = getSign(player.x - beast.x) * 150;

                // then appropriate beast action
                if (playerTowelStatus != 'noTowel') {
                    thisLine = new Error().lineNumber;
                    if (beastAnimDebug) logAnim(beast, thisLine, 'confused');
                    beast.animations.play('confused');
                    beast.body.gravity.y = 10000;
                }
                else if (beast.body.velocity.y != 0) {
                    thisLine = new Error().lineNumber;
                    if (beastAnimDebug) logAnim(beast, thisLine, 'jump');
                    beast.animations.play('jump');
                    if (monsterFly.isPlaying == false) monsterFly.play();
                    
                    beast.body.gravity.y = 1000;
                }
                else if (beast.body.velocity.x != 0) {
                    thisLine = new Error().lineNumber;
                    if (beastAnimDebug) logAnim(beast, thisLine, 'walk');
                    beast.animations.play('walk');
                    if (monsterRun.isPlaying == false) monsterRun.play();
                    beast.body.gravity.y = 10000;

                }
                else {
                    thisLine = new Error().lineNumber;
                    if (beastAnimDebug) logAnim(beast, thisLine, 'idle');
                    beast.animations.play('idle');
                    if (monsterIdle.isPlaying == false) monsterIdle.play();
                    beast.body.gravity.y = 10000;
                }
            }
            if ((getSign(beast.body.velocity.x) != 0) && (Math.abs(player.x - beast.x) > 50)){
                beast.scale.x = getSign(beast.body.velocity.x);
            }
        } else {
            beast.body.gravity.y = 10000;  // keep it on the ground!
        }
    }
    screenWrap(player);
    if (isGameOver) {
        beast.body.velocity.y = 300;
        monsterRun.stop();
        monsterIdle.stop();
        monsterFly.stop();
        monsterConfused.stop();
        console.log('monsterRun stop');
        screenWrap(beast);
        if (towelState != 'noTowel')
            if (towel.body.velocity.y == 0) {
                towel.kill();
                towelState = 'noTowel';
            }
    }
}

/************************************
 * SANDWATCH
 ************************************/

function createSandwatch(index){
    
    if (isGameOver) return;
    pos_x = sandwatchArr[index].x;
    pos_y = sandwatchArr[index].y;
    var hoverFactor = 20;

    //  Create a sandwatch inside of the 'sandwatches' group
    var sandwatch = sandwatches.create(pos_x, pos_y - hoverFactor, 'sandwatch');

    var anim_seq = [], i;
    for (i = 0; i <= 9; ++i) anim_seq.push(i);
    sandwatch.animations.add('new', anim_seq, ANIM_FRAME_RATE, true);
    anim_seq = [];
    for (i = 10; i <= 19; ++i) anim_seq.push(i);
    sandwatch.animations.add('taken', anim_seq, ANIM_FRAME_RATE, true);
    anim_seq = [];
    for (i = 20; i <= 29; ++i) anim_seq.push(i);
    sandwatch.animations.add('static', anim_seq, ANIM_FRAME_RATE, true);
    
    sandwatch.animations.play('new');
    // clockAppear.play();
    
    //  Let gravity do its thing
    sandwatch.body.gravity.y = 0;
    sandwatch.body.setSize(45,24,20,30);
    //  This just gives each sandwatch a slightly random bounce value
    sandwatch.body.bounce.y = 10;
    // sandwatch.body.immovable = true;
    
    sandwatchArr[index].exists = true;
    timer.add(1000 / ANIM_FRAME_RATE * 10, sandwatchTransform, this, sandwatch);
}

function sandwatchTransform(sandwatch) {
    sandwatch.animations.play('static');
}

function collectSandwatch (player, sandwatch) {
    // Removes the sandwatch from the screen
    if (sandwatch.taken) {
        return;
    }
    sandwatch.taken = true;
    sandwatch.play('taken');
    timer.add(1000 / ANIM_FRAME_RATE * 10, sandwatchTransform2, this, sandwatch);
    grabClock.play();
    //  Add and update the score
    score += 1;
    totalScore += 1;
    if (scoreDebug) logScore('sandwatch');

    scoreText.text = (score < 10 ? '0' : '') + score;
}

function sandwatchTransform2(sandwatch) {
    var index = -1;
    
    for (var i = 0 ; i < sandwatchArr.length ; i++) {
        if ((Math.abs(sandwatch.x - sandwatchArr[i].x) < 50) && (Math.abs(sandwatch.y - sandwatchArr[i].y) < 50)) {
            index = i;
        }
    }
    sandwatch.kill();
    timer.add(1000, sandwatchTransform3, this, index);    
}
function sandwatchTransform3(index) {

    var created = false;
    while (created == false) {
        var x = Math.floor(Math.random() * (sandwatchArr.length));    
        if (sandwatchArr[x].exists == false) {
            createSandwatch(x);
            created = true;
        }
    }
    
    if (index != -1) {
        sandwatchArr[index].exists = false;
        sandwatchArr[index].taken = false;
    }
    else {
        if (debug) console.log('cant find sandwatch');
    }
//    sandwatchTaken = null;
}

/************************************
 * BEAST inc EATING PLAYER
 ************************************/

function eatPlayer(){
    if (beastCanMove) {
        var soundList = [manRun, manJump, manLand, monsterRun, monsterFly, monsterIdle, monsterConfused];
        for (var x in soundList) {
            soundList[x].stop();
        }
        beastEatingPlayer = true;
        player.kill();
        timer.add(4300 / ANIM_FRAME_RATE * 10, resurrectMan, this, null);
        monsterEat.play(); 
//        timer.add(4300 / ANIM_FRAME_RATE * 10 - monsterEat.durationMS, playLater, this, monsterEat); 
        // if (debug) console.log('end eatPlayer');
    }
}

function resurrectMan() {
    // if (debug) console.log('start resurrectMan');
    if (isGameOver == false) {
        beastEatingPlayer = false;
        beastCanMove = false;
        /*
        player.enableBody = true;
        beast.enableBody = true;
        */
        setupPlayer(beast.x + 60 * beast.scale.x, beast.y);
        playerNextAction('noTowel', 'idle');
        thisLine = new Error().lineNumber;
        if (beastAnimDebug) logAnim(beast, thisLine, 'idle');
        beast.animations.play('idle');
        timer.add(2000, letBeastMove, this, null);
    }
    // if (debug) console.log('end resurrectMan');
}

function letBeastMove() {
    thisLine = new Error().lineNumber;
    if (beastAnimDebug) logAnim(beast, thisLine, 'idle');
    if (beast.animations.name != 'confused') {
        beast.animations.play('idle');
    }
    // monsterConfused.stop();
    beastCanMove = true;
}

/************************************
 * LEDGES
 ************************************/

function initLedge(ledge){
    ledge.body.immovable = true;
    ledge.body.checkCollision.down = false;
    ledge.body.checkCollision.left = false;
    ledge.body.checkCollision.right = false;
}

/************************************
 * TOWEL
 ************************************/

function getTowel(){
    grabTowel.play();
    towelVanish.play();
    towel.kill();
    playerTowelStatus = 'towel';
    towelState = 'noTowel';
    thisLine = new Error().lineNumber;
    if (beastAnimDebug) logAnim(beast, thisLine, 'confused');
    beast.animations.play('confused');
    monsterConfused.loopFull();
    timer.add(6000, transformTowel, this, 'towelDisappearing');
}

function transformTowel(phase) {
    if ((phase == 'towelStabilising') && (towelState != 'noTowel')) {
        towelState = 'existing';
    }
    else if (phase == 'towelDisappearing') {
        playerTowelStatus = 'EOTowel';
        timer.add(1000 / ANIM_FRAME_RATE * 10, transformTowel, this, 'EOConfused');
    }
    else if (phase == 'EOConfused') {
        monsterConfused.stop();
        playerTowelStatus = 'noTowel';
        timer.add(3000, transformTowel, this, 'towelReappear');
    }
    else if (phase == 'towelReappear') {
        generateTowel(false);
    }
}

function generateTowel(firstTime) {
    // decide which ledge to put towel on ... not on 2 first ledges they are too easy
    var factor = firstTime?3:0;
    var towelLedge = Math.floor(Math.random() * (ledges.length-factor)) + factor;
    var towelPosX = Math.floor(Math.random() * (ledges[towelLedge].width - towelSizeX)) + ledges[towelLedge].ledge_x;
    
    towel = game.add.sprite(towelPosX, ledges[towelLedge].ledge_y - (towelSizeY + 20), 'towel');
     //  We need to enable physics on the towel
    game.physics.arcade.enable(towel);
    towel.body.setSize(towelSizeX, towelSizeY, 0, 0);

    playerTowelStatus = 'noTowel';
    towelState = 'new';
    game.physics.arcade.enable(towel);
    towel.body.gravity.y = 400;
    towel.body.collideWorldBounds = true;
    towel.animations.add('new', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], ANIM_FRAME_RATE, true);
    towel.animations.add('existing', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], ANIM_FRAME_RATE, true);
    timer.add(1000 / ANIM_FRAME_RATE * 10, transformTowel, this, 'towelStabilising');
    towelAppear.play();
}

/************************************
 * PLAYER
 ************************************/

function playerNextAction(t, a) {
    if (a == 'idle') {
        if ((manPrevAction != a) && (manPrevAction != 'walk')) {
            manAudio(null);
            manLand.play();
        }
    }
    manPrevAction = a;
    
    for (var i = 0 ; i < player_arr.length ; i++) {
        if ((player_arr[i].action == a) && (player_arr[i].state == t)) {
            var manAudioSound = null;
            if (player_arr[i].sound != null) {
                if ((player_arr[i].sound != manJump) || (player.body.velocity.y < 0))
                    
//                    if (player_arr[i].sound.isPlaying == false) {
                        // player_arr[i].sound.play();  
                        manAudioSound = player_arr[i].sound;  
//                    } 
            } 
            if (manSoundDebug) console.log(manAudioSound==null?'null':manAudioSound.name + '.play()');
            manAudio(manAudioSound);
            player.animations.play(player_arr[i].anim);
            // and do the music for it too

        }
    }
}

function setupPlayer(x,y) {
    player = game.add.sprite(x, y, 'dude');
    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    //sets the size different from the sprite size
    player.body.setSize(20, 70, 0, 0);

    //  Player physics properties. Give the little guy a slight bounce.
    //player.body.bounce.y = 0.2;
    player.body.gravity.y = 400;
    player.body.collideWorldBounds = true;
    //  Our two animations, walking left and right.
    // player.animations.add('left', [0, 1, 2, 3], 10, true);
    
    // var animation_arr = ['idle', 'walk', 'jump', 'idle_towel', 'walk_towel', 'jump_towel' ];
    
    for(i=0; i < player_arr.length; i++){
        player.animations.add(player_arr[i].anim, [0+(i*10), 1+(i*10), 2+(i*10), 3+(i*10), 4+(i*10), 5+(i*10), 6+(i*10), 7+(i*10), 8+(i*10), 9+(i*10)], ANIM_FRAME_RATE, true);
    }
    
    player.anchor.setTo(.5, 1); //so it flips around its middle
    player.scale.x = beast.scale.x;

}

/************************************
 * SCORE and GAMEOVER
 ************************************/

function updateScore(){
    score -= 1;
    scoreText.text = (score < 10 ? '0' : '') + score;
    if (scoreDebug) logScore('score updated');
    if(score == 0){
        if (scoreDebug) logScore('score is 0');
        //timer.stop();
        isGameOver = true;
        player.animations.stop();
        player.kill();
        beast.kill();
        if (towelState != 'noTowel')
            towel.kill();
        scoreText.destroy();
        /*
        beast.animations.play("jump");
        beast.body.velocity.x = 0;
        player.animations.play("jump");
        manFall.play();
        player.body.velocity.x = 0;
        */
        sandwatches.destroy();
        platforms.destroy();
        // gameOver.onStop.add(gameOverSoundStopped, this);
        gameTheme.stop();
        gameOver.play();
                /* ADDED THIS */
        end_game_bg.visible = true;
        anim.play();
        /* END ADDING */

    }
}


/************************************
 * MISC
 ************************************/

function screenWrap (sprite) {
     if (sprite.y > game.height -10) {
        if (isGameOver)
            sprite.kill();
        else 
            sprite.y = 0;
     }
     if ((sprite.y > 514) && (isGameOver == false)) {
        if (manFall.isPlaying == false) {
            console.log('manFall.play');
            manFall.play();
        }
     }
}

function logScore(s) {
    console.log(s + ' ' + score);
}

function manAudio(a) {
    if (a == null) {
        if (playerSound != null) {
            playerSound.stop();
            playerSound = null;
        }
    }
    else if (((a != playerSound) || (a != manJump)) && (a.isPlaying == false)) {
        a.play(/*forceRestart = false*/);
        if (manSoundDebug) console.log(a + '.play()');
        playerSound = a;
    }
}
/*
function manAudioMulti(a) {
    a.play();
    timer.add(manFreq - a.durationMS, manAudioMulti, this, a.slice(1, a.length));
}
*/
function getSign(x){return x>0?1:x<0?-1:x;}

function logAnim(what, lineNum, anim) {
    if (what.animations.name != anim) {
        console.log(lineNum + ': beast->' + anim);
    }
}

function playLater(x) {
    x.play();
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
    isGameStarted = true;
}

/************************************
 * END OF GAME
 ************************************/
function endAnimationLooped(sprite, animation){
    console.log('complete');
    animation.stop();
    var endText2 = game.add.text(0, 50,'X',{ font: bold+' 72px '+myFont, fill: '#FFFFFF' });
    endText = game.add.text(170, 50,'GAME OVER',{ font: 'bold 72px '+myFont, fill: '#FFFFFF' });
    // endText.x = game.world.centerX - Math.round(endText.width * 0.5) ;
    endText.x = game.world.centerX - Math.round(endText.width * 0.5)
    endText2.destroy();
    endTextExists = true;
    // alert('game Over!\nyou survived ' + totalScore + ' seconds!');
}

var finalString = [];
var finalScoreText = [];
var len0, len1;
function showFinalScore(i) {
    if (i == 1) {
        endText.destroy();
        finalString.push('You have delayed the end of the world by');
        finalString.push((totalScore - initialScore) + ' seconds');
        var sizeOfText = [];
        for (var ii = 0 ; ii < 2 ; ii++) {
            var throwMe = game.add.text(120, 250,finalString[ii],{ font: bold+' 28px '+myFont, fill: '#FFFFFF' });
            sizeOfText.push(throwMe.width);
            throwMe.destroy();
        }
        len0 = finalString[0].length;
        len1 = finalString[1].length;
        
        var x = game.add.text(game.world.centerX - Math.round(sizeOfText[0] * 0.5), 
                                250,'',{ font: bold+' 28px '+myFont, fill: '#FFFFFF' });
        x.x = game.world.centerX - Math.round(sizeOfText[0] * 0.5)
        //x.align = 'center';
        //x.x = game.world.centerX - Math.round(sizeOf0 * 0.5) ;
        finalScoreText.push(x);
        var x2 = game.add.text(game.world.centerX - Math.round(sizeOfText[1] * 0.5), 
                                300,'',{ font: bold+' 28px '+myFont, fill: '#FFFFFF' });
        x2.x = game.world.centerX - Math.round(sizeOfText[1] * 0.5)
        finalScoreText.push(x2);
    }
    finalScoreText[0].text = finalString[0].slice(0,Math.min(len0 + 1, i));
    if (i > len0) {
        finalScoreText[1].text = finalString[1];
        game.sound.stopAll();
        timer.add(2500, happyTowelDay, this, 1);        
    }
    else {
        timer.add(57, showFinalScore, this, i+1);
    }
}
/* END ADDING */

var HTD = 'HAPPY TOWEL DAY!';
var HTDText;
function happyTowelDay(i) {
    if (i == 1) {
        finalScoreText[0].destroy();
        finalScoreText[1].destroy();
        var deleteMe = game.add.text(60,230,HTD,{ font: 'bold 72px '+myFont, fill: '#FFFFFF' });
        var mySize = deleteMe.width;
        deleteMe.destroy();
        HTDText = game.add.text(60, 230,'H',{ font: 'bold 72px '+myFont, fill: '#FFFFFF' });
        HTDText.x = game.world.centerX - Math.round(mySize * 0.5)
    }
    HTDText.text = HTD.slice(0, i);
    if (i <= HTD.length) {
        timer.add(75, happyTowelDay, this, i+1);
    }
    else {
        timer.add(3000, reBoot, this, null);
    }
}

function reBoot() {
    anim.stop();
    player.kill();
    end_game_bg.visible = false;

    HTDText.destroy();
    splash_bg = this.add.sprite(0, 0, 'splash_bg');
    splash_btn = this.startButton = this.game.add.button(300, 400, 'splash_btn', startGame);
     isGameOver = false;
    
    isGameStarted = false;
    
    endTextExists = false;
    playerSound = null;
    beastCanMove = false;
    beastEatingPlayer = false;
    i = 0;
    create2firstRun = true;
    soundsReady = false; // a fudge to allow restart
    manPrevAction = 'nothing';
    playerTowelStatus = 'noTowel';
    towelState = 'noTowel';
    finalString = [];
    finalScoreText = [];
    sandwatchArr = [];

    sounds.shift();
    splash.loopFull();
   timer.stop();
   timer.destroy();
   timer = game.time.create(false);
  recreate();
}