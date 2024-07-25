let backgroundMusic; // So the song won't overlap itself

class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {}

    create() {
        // Main page texts
        this.titleText = this.add.text(512, 200, 'Improve your aim', { fontSize: '48px', fill: '#ffffff' });
        this.titleText.setOrigin(0.5);

        this.clickHere = this.add.text(512, 400, 'Click here to start', { fontSize: '38px', fill: '#ffffff' });
        this.clickHere.setOrigin(0.5);

        // Initialize try counter
        if (!MainMenu.tryCounter) {
            MainMenu.tryCounter = 0;
        }

        // Start the game
        this.input.once('pointerdown', this.startGame, this);
    }

    startGame() {
        MainMenu.tryCounter += 1;
        this.scene.start('GameScene', { tryNumber: MainMenu.tryCounter });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        // Initialize leaderboard
        if (!GameScene.leaderboardEntries) {
            GameScene.leaderboardEntries = [];
        }
    }

    // Preload the assets
    preload() {
        this.load.image('dot', 'alien.png');

        this.load.audio('backgroundMusic', 'ufo.mp3');

        this.load.audio('clickSound', 'laser-shot.mp3'); 
    }

    create(data) {
        // Play the background music if not already playing
        if (!backgroundMusic) {
            backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
            backgroundMusic.play();
        }

        // Add the click sound
        this.clickSound = this.sound.add('clickSound');

        // Transform dot into a alien sprite
        this.dot = this.add.sprite(512, 384, 'dot');
        this.dot.setScale(0.1);

        // Make it interactive
        this.dot.setInteractive();

        // Text area background
        this.add.rectangle(0, 0, 1024, 60, 0x333333).setOrigin(0, 0);

        // Leaderboard background
        this.add.rectangle(850, 60, 174, 708, 0x444444).setOrigin(0, 0);

        // Initialize the score
        this.score = 0;

        // Display the score
        this.scoreText = this.add.text(768, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });

        // Initialize the time counter
        this.timeLeft = 10;

        // Display time left
        this.timeText = this.add.text(16, 16, 'Time: 10', { fontSize: '32px', fill: '#ffffff' });

        // Time out text
        this.timeoutText = this.add.text(512, 384, 'Time Out', { fontSize: '64px', fill: '#ff0000' });
        this.timeoutText.setOrigin(0.5);
        this.timeoutText.setVisible(false);

        // Restart button
        this.restartButton = this.add.text(512, 464, 'Restart', { fontSize: '32px', fill: '#ffffff' });
        this.restartButton.setOrigin(0.5);
        this.restartButton.setInteractive();
        this.restartButton.setVisible(false);

        this.restartButton.on('pointerdown', () => {
            this.scene.restart({ tryNumber: data.tryNumber });
        });

        // Leaderboard text
        this.leaderboardTitle = this.add.text(854, 80, 'Leaderboard', { fontSize: '24px', fill: '#ffffff' });
        this.leaderboardTexts = [];

        // Succesfull shot
        this.dot.on('pointerdown', function (pointer) {
            if (this.timeLeft > 0) {

                this.clickSound.play();

                this.dot.x = Phaser.Math.Between(0, this.scale.width - 200);
                this.dot.y = Phaser.Math.Between(100, this.scale.height);

                this.score += 10;

                this.scoreText.setText('Score: ' + this.score);
            }
        }, this);

        // Missed shot
        this.input.on('pointerdown', function (pointer) {
            if (pointer.y > 60 && (pointer.x < this.dot.x - 5 || pointer.x > this.dot.x + 5 || pointer.y < this.dot.y - 5 || pointer.y > this.dot.y + 5)) {
                if (this.timeLeft > 0) {
                    this.score -= 5;
                    this.scoreText.setText('Score: ' + this.score);
                }
            }
        }, this);

        // Timer countdown
        this.time.addEvent({
            delay: 1000,                
            callback: function () {
                if (this.timeLeft > 0) {
                    this.score -= 1;        
                    this.scoreText.setText('Score: ' + this.score); 

                    this.timeLeft -= 1;
                    this.timeText.setText('Time: ' + this.timeLeft); 

                    if (this.timeLeft === 0) {
                        this.timeoutText.setVisible(true); 
                        this.dot.setInteractive(false); 
                        this.updateLeaderboard(data.tryNumber, this.score); 
                        this.restartButton.setVisible(true); 
                    }
                }
            },
            callbackScope: this,
            loop: true
        });

        this.displayLeaderboard();
    }

    updateLeaderboard(tryNumber, score) {
        GameScene.leaderboardEntries.push({ tryNumber: tryNumber, score: score });
        GameScene.leaderboardEntries.sort((a, b) => b.score - a.score);
        this.displayLeaderboard();
    }

    displayLeaderboard() {
        this.leaderboardTexts.forEach(text => text.destroy());

        this.leaderboardTexts = [];
        for (let i = 0; i < GameScene.leaderboardEntries.length; i++) {
            let entry = GameScene.leaderboardEntries[i];
            let entryText = this.add.text(854, 120 + i * 40, `Try ${entry.tryNumber}: ${entry.score}`, { fontSize: '24px', fill: '#ffffff' });
            this.leaderboardTexts.push(entryText);
        }
    }

    update() {}
}

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#000000',
    scene: [MainMenu, GameScene]
};

const game = new Phaser.Game(config);
