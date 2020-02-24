import Phaser from "phaser";
import logoImg from "./assets/logo.png";
import skyImg from "./assets/sky.png"
import groundImg from "./assets/platform.png";
import starImg from "./assets/star.png";
import bombImg from "./assets/bomb.png";
import dudeImg from "./assets/dude.png";

class LevelOne extends Phaser.Scene {
  constructor(props) {
    super(props);
    this.player;
    this.stars;
    this.bombs;
    this.platforms;
    this.arrow;
    this.score = 0;
    this.gameOver = false;
    this.scoreText;
  }

  preload() {
    const { load } = this;
    load.image("logo", logoImg);
    load.image("sky", skyImg);
    load.image("ground", groundImg);
    load.image("star", starImg);
    load.image("bomb", bombImg);
    load.spritesheet("dude", dudeImg, {
      frameWidth: 32,
      frameHeight: 48
    });
  }

  create() {
    const { physics, anims, input } = this;
    this.add.image(400, 300, "sky");

    this.platforms = physics.add.staticGroup();
    this.platforms
      .create(400, 568, "ground")
      .setScale(2)
      .refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    this.player = physics.add.sprite(100, 450, "dude");
    this.player
      .setBounce(0.2)
      .setCollideWorldBounds(true);

    anims.create({
      key: "left",
      frames: anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20
    });

    anims.create({
      key: "right",
      frames: anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.arrow = input.keyboard.createCursorKeys();

    this.stars = physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.stars.children.iterate(function(child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.bombs = physics.add.group();

    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      fill: "#000"
    });

    physics.add.collider(this.player, this.platforms);
    physics.add.collider(this.stars, this.platforms);
    physics.add.collider(this.bombs, this.platforms);

    physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

  }
  update() {
    if (this.arrow.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play("left", true);
    } else if (this.arrow.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);

      this.player.anims.play("turn");
    }

    if (this.arrow.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  collectStar(player, star) {
    star.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate(function(child) {
        child.enableBody(true, child.x, 0, true, true);
      });
      const x = player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);
      const bomb = this.bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.allowGravity = false;
    }

  }
  hitBomb(player) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play("turn");
    this.gameOver = true;
  }

}

class Game extends Phaser.Game {
  constructor(props) {
    super(props);
  }
}

new Game({
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: LevelOne
});
