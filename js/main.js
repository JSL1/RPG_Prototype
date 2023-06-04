//768 x 432
var game;
var gameConfig;
var cursors;
var player;
/*
Retro RPG prototype
one player character
random encounters
2 different enemies
one treasure chest
one NPC with one line of dialog
*/
window.onload=function() {
  gameConfig = {
    type: Phaser.AUTO,
    width: 384,
    height: 216,
    parent: "gameBoard",
    scene: [ Main, Battle, Dialog ],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: 0,
        debug: false,
      },
    },
    pixelArt: true,
  }
  game = new Phaser.Game(gameConfig);
  window.focus();
}

var gameOptions = {
  playerStartPosition: [ 1, 3 ], //x, y
  playerMoveSpeed: 80,
  encounterRate: 240,
}

const randomTrueFalse = (weight) => {
  return ((Math.random() * 10) < weight);
}

class Main extends Phaser.Scene {
  constructor() {
    super("Main");
  }
  
  preload() {
    this.load.image('dungeon_tileset', 'img/dungeon-tileset.png');
    this.load.image('player', 'img/hero1.png');
    this.load.image('snek', 'img/snek.png');
    this.load.image('battlebackground', 'img/battleback.png');
    this.load.image('finger', 'img/finger.png');
    this.load.image('girl', 'img/1.png');
    this.load.image('chest-open', 'img/chest-opened.png');
    this.load.image('chest-closed', 'img/chest-closed.png');
  }
  
  create() {
    const level = [
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [6, 8, 9, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 0],
      [6, 7, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14,14, 14, 14, 14, 14, 14, 0],
      [6, 7, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,14, 14, 14, 14, 14, 14, 0],
      [6, 7, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,14, 14, 14, 14, 14, 14, 0],
      [6, 7, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14,14, 14, 14, 14, 14, 14, 0],
      [6, 7, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,14, 14, 14, 14, 14, 14, 0],
      [6, 7, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14,14, 14, 14, 14, 14, 14, 0],
      [6, 7, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14,14, 14, 14, 14, 14, 14, 0],
      [6, 7, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,14, 14, 14, 14, 14, 14, 0],
      [6, 7, 14, 14, 14, 14, 14, 14, 14, 14, 20, 20, 21, 20, 20, 14, 14,14, 14, 14, 14, 14, 14, 0],
      [6, 7, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,14, 14, 14, 14, 14, 14, 0],
      [6, 7, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14,14, 14, 14, 14, 14, 14, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    
    
    const map = this.make.tilemap({ data: level, tileWidth: 16, tileHeight: 16});
    const tiles = map.addTilesetImage('dungeon_tileset');
    const layer = map.createLayer(0, tiles, 0, 0);
    //const wallLayer = map.createLayer(0, tiles, 0, 0);
  
    //this.physics.add.collider(player, wallLayer);
    //wallLayer.setCollisionBetween(0,6);
    
    //player character
    player = this.physics.add.sprite(gameOptions.playerStartPosition[0] * 16,
      gameOptions.playerStartPosition[1] * 16, 'player');
    player.setOrigin(0,0);
    
    player.level = 1;
    player.experience = 0;
    player.gold = 0;
    player.health = 10;
    player.strength = 5;
    player.magic = 0;
    player.defence = 3;
    player.speed = 2;
    
    //input events
    cursors = this.input.keyboard.createCursorKeys();
    console.log(player);
    
    //chest
    this.chest = this.physics.add.sprite(80, 192, 'chest-closed')
      .setOrigin(0,0)
      .setImmovable(true);
    this.chest.opened = false;
      
    //Npc
    this.npc = this.physics.add.sprite(96, 192, 'girl')
      .setOrigin(0,0)
      .setImmovable(true);
  
    this.playerInRangeofNPC = false;
    this.playerInRangeofChest = false;
    this.physics.add.collider(player, this.chest, () => {
      this.playerInRangeofChest = true;
    }, null, this);
    this.physics.add.collider(player, this.npc, () => {
      this.playerInRangeofNPC = true;
    }, null, this);
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    
    this.anims.create({
      key: 'openChest',
      frames: [
        { key: 'chest-open'},
        { key: 'chest-closed'}
      ],
      repeat: 0,
      frameRate: 10
    });
    
  }
  
  initiateBattle() {
    this.scene.pause("Main");
    this.scene.launch("Battle");
  }
  
  update() {
    //basic movement pattern
    if (cursors.left.isDown) {
      player.setVelocity(gameOptions.playerMoveSpeed * -1, 0);
      if (randomTrueFalse(0.1)) {
        console.log('random encounter');
        this.initiateBattle();
      }
    } else if (cursors.right.isDown) {
      player.setVelocity(gameOptions.playerMoveSpeed, 0);
      if (randomTrueFalse(0.1)) {
        console.log('random encounter');
        this.initiateBattle();
      }
    } else if (cursors.up.isDown) {
      player.setVelocity(0, gameOptions.playerMoveSpeed * -1);
    } else if (cursors.down.isDown) {
      player.setVelocity(0, gameOptions.playerMoveSpeed);
    } else {
      player.setVelocity(0,0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      if (this.playerInRangeofNPC) {
        console.log("Hi, Im an NPC");
        this.scene.pause("Main");
        this.scene.launch("Dialog", { text: "Hi, I'm an NPC!" });
      } else if (this.playerInRangeofChest) {
        if (!this.chest.opened) {
          console.log("chest opened!");
          //this.chest.play('openChest');
          this.chest.setTexture('chest-open', 0);
          this.time.delayedCall(200, () => {
            this.scene.pause("Main");
            this.scene.launch("Dialog", { text: "You got 33 Gold" });
            player.gold += 33;
          });
          this.chest.opened = true;
        }
      }
    }
    this.playerInRangeofChest = false;
    this.playerInRangeofNPC = false;
  }
  
}
class Dialog extends Phaser.Scene {
  constructor() {
    super("Dialog");
  }
  
  init(data) {
    this.text = data.text;
  }
  
  create() {
    this.textbackground = this.add.sprite(96, 128, 'battlebackground')
      .setOrigin(0,0)
    this.textbackground.displayWidth = 160;
    this.textbackground.displayHeight = 96;
    
    this.add.text(104, 136, this.text);
    
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  }
  
  update() {
    if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      this.scene.resume("Main");
      this.scene.stop("Dialog");
    }
  }
  
  
}
class Battle extends Phaser.Scene {
  constructor() {
    super("Battle");
  }
  
  preload() {}
  
  //Battle commands
  displayText(order, msg) {
    this.time.delayedCall(order * 500, () => this.consoleText.setText(msg), null, this);
  }
  
  playerAttack(enemy) {
    let damage = player.strength - this.snekEnemy.defence;
    this.snekEnemy.health -= damage;
    console.log('you hit for ' + damage + '!');
    this.consoleText.setText('you hit for ' + damage + '!');
    this.time.delayedCall(500, () => this.enemyAttack(this.snekEnemy, player), null, this);
  }
  
  enemyAttack(enemy, player) {
    if (enemy.health > 0) {
      let damage = enemy.strength - player.defence;
      player.health -= damage;
      console.log(enemy.name + ' hits for ' + damage + '!');
      this.consoleText.setText(enemy.name + ' hits for ' + damage + '!');
    } else {
      player.experience += 5;
      player.gold += 3;
      this.displayText(1, 'You won this battle.');
      this.displayText(2, 'you gained 5 xp');
      this.displayText(3, 'you gained 2 Gold');
      this.time.delayedCall(2000, () => {
        this.scene.stop("Battle");
        this.scene.resume("Main");
      }, null, this);
    }
  }
  
  run() {
    this.scene.resume("Main");
    this.scene.stop("Battle");
  }
  
  create() {
    
    this.snekEnemy = {
      sprite: 'snek',
      name: 'snek',
      health: 5,
      defence: 1,
      strength: 3,
      speed: 2
    }
    
    this.consoleBackground = this.add.sprite(96, 32, 'battlebackground');
    this.consoleBackground.setOrigin(0,0);
    this.consoleBackground.displayWidth = 160;
    this.consoleBackground.displayHeight = 20;
    
    this.consoleText = this.add.text(96, 32, 'a snek appears!');
    
    this.background = this.add.sprite(96, 54, 'battlebackground');
    this.background.setOrigin(0,0);
    this.enemySprite = this.add.sprite(120, 65, this.snekEnemy.sprite);
    this.enemySprite.setOrigin(0,0);
    
    this.playerDisplayBackground = this.add.sprite(256, 80, 'battlebackground').setOrigin(0,0);
    this.playerDisplayBackground.displayWidth = 64;
    this.playerDisplayBackground.displayHeight = 128;
    
    this.lvlDisplay = this.add.text(256, 80, 'LVL: ' + player.level);
    this.healthDisplay = this.add.text(256, 96, 'HP: ' + player.health);
    this.mpDisplay = this.add.text(256, 112, 'MP ' + player.magic);
    this.goldDisplay = this.add.text(256, 128, 'GOLD: ' + player.gold);
    this.experienceDisplay = this.add.text(256, 144, 'EXP: ' + player.experience);
    
    this.menuBackground = this.add.sprite(64, 128, 'battlebackground');
    this.menuBackground.setOrigin(0,0);
    this.menuBackground.displayWidth = 96;
    this.menuBackground.displayHeight = 96;
    this.finger = this.add.sprite(64, 132, 'finger')
      .setScale(0.5, 0.5)
      .setOrigin(0,0);
      
    this.buttons = [
      { name: 'Attack', selected: false, text: this.add.text(80, 128, 'Attack')},
      { name: 'Spell', selected: false, text: this.add.text(80, 144, 'Spell')},
      { name: 'Run', selected: false, text: this.add.text(80, 156, 'Run')},
      { name: 'Item', selected: false, text: this.add.text(80, 172, 'Item')},
    ];
    
    this.selectedButton = this.buttons[0];
    //keys for the menu
    
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
  }
  
  moveCursor(dir) {
    if (dir == 'up') {
      if(this.buttons.indexOf(this.selectedButton) > 0) {
        this.selectedButton = this.buttons[this.buttons.indexOf(this.selectedButton) - 1];
      }
    } else if (dir == 'down') {
      if(this.buttons.indexOf(this.selectedButton) < this.buttons.length - 1) {
        this.selectedButton = this.buttons[this.buttons.indexOf(this.selectedButton) + 1];
      }
    }
    console.log(this.selectedButton);
  }
  
  processCommand(button) {
    if (button == 'Attack') {
      this.playerAttack(this.snekEnemy);
    } else if (button == 'Run') {
      this.run();
    } else if (button == 'Item') {
      console.log('no items yet');
      this.consoleText.setText('you have no items!');
    } else if (button == 'Spell') {
      console.log('no spells yet');
      this.consoleText.setText("you don't know any spells");
    }
  }
  
  
  update(){
    //menu maneuvering
    if (Phaser.Input.Keyboard.JustDown(this.upKey)) {
      this.moveCursor('up');
    }
    if (Phaser.Input.Keyboard.JustDown(this.downKey)) {
      this.moveCursor('down');
    }
    this.finger.y = this.selectedButton.text.y + 4;
    
    if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      this.processCommand(this.selectedButton.name);
    }
    
    //keeping the display values accurate
   this.lvlDisplay.setText('LVL: ' + player.level);
   this.goldDisplay.setText('GOLD: ' + player.gold);
   this.mpDisplay.setText('MP: ' + player.magic);
   this.experienceDisplay.setText('EXP: ' + player.experience);
   this.healthDisplay.setText('HP: ' + player.health);
  }
  
  
  
  
}