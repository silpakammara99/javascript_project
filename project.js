        // Game configuration
        const boardWidth = 600;
        const boardHeight = 500;
        const ballRadius = 15;
        const paddleWidth = 110;
        const paddleHeight = 20;
        const blockWidth = 62;
        const blockHeight = 20;
        const blockRows = 5;
        const blockColumns = 8;
        const ballSpeedX = 3;
        const ballSpeedY = 2;
        let board;
        let context;
        let ball;
        let paddle;
        let blocks;
        let ballVelocityX;
        let ballVelocityY;
        let score = 0;
        let totalScore = 0;
        let chances = 2;
        let playerName = '';
        let countdown = 3;
        let countdownIntervalId;
        let animationFrameId;

        function initializeGame() {
            ball = { x: boardWidth / 2, y: boardHeight / 2 };
            paddle = { x: boardWidth / 2 - paddleWidth / 2, y: boardHeight - paddleHeight - 1 };
            blocks = [];
            createBlocks();
            ballVelocityX = ballSpeedX;
            ballVelocityY = ballSpeedY;
            drawGameElements();
        }

        function createBlocks() {
            blocks = [];
            for (let c = 0; c < blockColumns; c++) {
                for (let r = 0; r < blockRows; r++) {
                    blocks.push({ x: c * (blockWidth + 10) + 15, y: r * (blockHeight + 10) + 30 });
                }
            }
        }

        function drawGameElements() {
            context.clearRect(0, 0, boardWidth, boardHeight);
            context.fillStyle = "brown";
            blocks.forEach(block => {
                context.fillRect(block.x, block.y, blockWidth, blockHeight);
            });
            context.fillStyle = "black";
            context.fillRect(paddle.x, paddle.y, paddleWidth, paddleHeight);
            context.fillStyle = "orange";
            context.beginPath();
            context.arc(ball.x, ball.y, ballRadius, 0, 15);
            context.fill();
            context.closePath();
            context.fillStyle = "black";
            context.font = "16px Arial";
            context.textAlign = "left";
            context.fillText(`Player: ${playerName}`, 10, 20);
            context.textAlign = "right";
            context.fillText(`Score: ${score}`, boardWidth - 10, 20);
        }

        function gameLoop() {
            drawGameElements();
            ball.x += ballVelocityX;
            ball.y += ballVelocityY;
            if (ball.x + ballRadius > boardWidth || ball.x - ballRadius < 0) {
                ballVelocityX = -ballVelocityX;
            }
            if (ball.y - ballRadius < 0) {
                ballVelocityY = -ballVelocityY;
            }
            if (ball.y + ballRadius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddleWidth) {
                ballVelocityY = -ballVelocityY;
            }
            blocks = blocks.filter(block => {
                if (ball.x > block.x && ball.x < block.x + blockWidth && ball.y - ballRadius < block.y + blockHeight && ball.y + ballRadius > block.y) {
                    ballVelocityY = -ballVelocityY;
                    score += 10;
                    return false;
                }
                return true;
            });
            if (blocks.length === 0) {
                showAlert(`Congratulations ${playerName}! You cleared all blocks! Your score: ${totalScore + score}`);
                return;
            }
            if (ball.y + ballRadius >= boardHeight) {
                cancelAnimationFrame(animationFrameId);
                stopMusic();
                totalScore += score;
                if (chances > 0) {
                    showAlert(`Game Over! Your score this round: ${score}. You have ${chances} chances left.`);
                } else {
                    showAlert(`Game Over! Your total score: ${totalScore}`);
                }
                return;
            }
            animationFrameId = requestAnimationFrame(gameLoop);
        }

        function showAlert(message) {
            document.getElementById('alertMessage').innerText = message;
            document.getElementById('alertOverlay').style.display = 'flex';
        }

        function hideAlert() {
            document.getElementById('alertOverlay').style.display = 'none';
        }

        function startGame() {
            initializeGame();
            playMusic();
            countdown = 3;
            document.getElementById('countdownTimer').innerText = `Game starts in: ${countdown}`;
            document.getElementById('countdownTimer').style.display = 'block';
            countdownIntervalId = setInterval(() => {
                countdown--;
                if (countdown <= 0) {
                    clearInterval(countdownIntervalId);
                    document.getElementById('countdownTimer').innerText = '';
                    gameLoop();
                } else {
                    document.getElementById('countdownTimer').innerText = `Game starts in: ${countdown}`;
                }
            }, 1000);
        }

        function playMusic() {
            const music = document.getElementById('backgroundMusic');
            // Ensure the audio plays on user interaction
            music.play().catch(e => console.error("Music playback failed:", e));
        }

        function stopMusic() {
            const music = document.getElementById('backgroundMusic');
            music.pause();
            music.currentTime = 0;
        }

        function storePlayerData(name, score) {
            let playerData = JSON.parse(localStorage.getItem('playerData')) || [];
            playerData = playerData.filter(player => player.name !== name);
            playerData.push({ name, score });
            playerData.sort((a, b) => b.score - a.score);
            localStorage.setItem('playerData', JSON.stringify(playerData));
        }

        function displayScores() {
            const scoreList = document.getElementById('scoreList');
            const playerData = JSON.parse(localStorage.getItem('playerData')) || [];
            scoreList.innerHTML = '';
            if (playerData.length === 0) {
                scoreList.innerHTML = '<li>No scores available</li>';
            } else {
                playerData.forEach(player => {
                    const li = document.createElement('li');
                    li.textContent = `${player.name}: ${player.score}`;
                    scoreList.appendChild(li);
                });
            }
            document.getElementById('scoreboard').style.display = 'block';
        }

        document.getElementById('alertBtn').addEventListener('click', () => {
            hideAlert();
            if (chances > 0) {
                chances--;
                score = 0;
                startGame();
            } else {
                storePlayerData(playerName, totalScore);
                document.querySelector('form').style.display = 'block';
                document.getElementById('gameInfo').style.display = 'none';
                displayScores();
            }
        });

        document.getElementById('startBtn').addEventListener('click', () => {
            playerName = document.getElementById('name').value.trim();
            if (playerName) {
                document.querySelector('form').style.display = 'none';
                document.getElementById('gameInfo').style.display = 'block';
                startGame();
            } else {
                alert('Please enter your name to start the game.');
            }
        });

        window.onload = () => {
            board = document.getElementById('board');
            context = board.getContext('2d');
            board.width = boardWidth;
            board.height = boardHeight;
        };

        document.addEventListener('mousemove', (event) => {
            if (document.getElementById('gameInfo').style.display === 'block') {
                const box = board.getBoundingClientRect();
                const mouseX = event.clientX - box.left;
                paddle.x = mouseX - paddleWidth / 2;
                if (paddle.x < 0) paddle.x = 0;
                if (paddle.x + paddleWidth > boardWidth) paddle.x = boardWidth - paddleWidth;
            }
        });