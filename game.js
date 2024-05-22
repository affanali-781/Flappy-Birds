// game display
let display;
let d_width = 960;
let d_height = 720;
let context; // to draw images on the display

// Flappy bird
let b_width = 50; // ratio 1:1
let b_height = 50;
let bird_x = d_width / 8;
let bird_y = d_height / 2;

let bird = {
	// bird object
	x: bird_x,
	y: bird_y,
	width: b_width,
	height: b_height,
	velocity_y: 0, // Initial velocity set to 0
};

// pipes
let pipe_array = [];
let p_width = 64; // ratio 1:8
let p_height = 512;
let pipe_x = d_width; // initialize from top right corner
let pipe_y = 0;

// pipe images
let pipe_up_img;
let pipe_down_img;

// physics
let velocity_x = -2; // for pipe movement
let velocity_y = 0; // for bird jumps
let gravity = 0.4;

// Game senametics
let game_over = false;
let game_started;
let points = 0;

// Prompt display
let promptDuration = 3000; // 3 seconds
let promptStartTime;

window.onload = function () {
	// load display
	display = document.getElementById("display");
	display.height = d_height;
	display.width = d_width;
	context = display.getContext("2d");

	// load Flappy Bird
	b_img = new Image();
	b_img.src = "./flappybird.png";
	b_img.onload = function () {
		context.drawImage(b_img, bird.x, bird.y, bird.width, bird.height);
	};

	// load pipes
	pipe_up_img = new Image();
	pipe_up_img.src = "./toppipe.png";

	pipe_down_img = new Image();
	pipe_down_img.src = "./bottompipe.png";

	// Record the start time for the prompt
	promptStartTime = Date.now();

	// Draw "Press space to jump" message for the first 10 seconds
	if (Date.now() - promptStartTime < promptDuration) {
		context.fillStyle = "red";
		context.font = "50px Helvetica";
		context.fillText("Press space to jump", 200, 360);
	}

	requestAnimationFrame(update);
	setInterval(placepipes, 2000);
	document.addEventListener("keydown", moveBIRD);
};

// update the frame
function update() {
	requestAnimationFrame(update);
	if (!game_started) {
		return;
	}

	if (game_over) {
		return;
	}

	context.clearRect(0, 0, d_width, d_height);

	// flappy bird
	velocity_y += gravity;
	bird.y = Math.max(bird.y + velocity_y, 0);
	context.drawImage(b_img, bird.x, bird.y, bird.width, bird.height);

	if (bird.y > d_height) {
		game_over = true;
	}
	// pipes
	for (let i = 0; i < pipe_array.length; i++) {
		let pipe = pipe_array[i];
		pipe.x += velocity_x;
		context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

		if (!pipe.passed && bird.x > pipe.x + pipe.width) {
			points += 0.5;
			pipe.passed = true;
		}

		// game over when there is collision
		if (Collision(bird, pipe)) {
			game_over = true;
		}
	}

	// clear pipes for memory management
	while (pipe_array.length > 0 && pipe_array[0] < 0) {
		pipe_array.shift(); // removes all the first pipes that leave the screen
	}

	// point system
	context.fillStyle = "white";
	context.font = "60px Times New Roman";
	context.fillText(points, 10, 80);

	// Draw game over image if game is over
	if (game_over) {
		context.fillStyle = "red";
		context.font = "70px Helvetica";
		context.fillText("GAME OVER", 300, 360);

		// Retrieve player's name from local storage
		let playerName = localStorage.getItem("playerName");
		if (playerName) {
			// Display the player's name
			context.fillStyle = "white";
			context.font = "40px Helvetica";
			context.fillText(playerName + " : ", 360, 420);
		}

		// Display the score
		context.fillStyle = "white";
		context.font = "40px Helvetica";
		context.fillText(points, 480, 420);
	}
}

// render pipes
function placepipes() {
	// no new pipes when game is over
	if (game_over) {
		return;
	}

	// for upper pipe randomness
	random_Pipe_y = pipe_y - p_height / 4 - Math.random() * (p_height / 2); // 0 - (512/4 = 128) - (0,1) * (256) ===> (-128,-384)
	let space_open = d_height / 4; // 1/4 of display = 180

	// top pipe object
	let pipe_up = {
		img: pipe_up_img,
		x: pipe_x,
		y: random_Pipe_y,
		width: p_width,
		height: p_height,
		passed: false,
	};

	pipe_array.push(pipe_up);

	// bottom pipe object
	let pipe_down = {
		img: pipe_down_img,
		x: pipe_x,
		y: random_Pipe_y + p_height + space_open, // (-128,-384) + 512 + 180 ===> (564,308) for lower pipe
		width: p_width,
		height: p_height,
		passed: false,
	};

	pipe_array.push(pipe_down);
}

// jumps of the bird
function moveBIRD(a) {
	if (a.code == "Space" || a.code == "ArrowUp") {
		// jump
		velocity_y = -6;
		game_started = true;
	}

	// reset the game
	if (game_over) {
		bird.y = bird_y;
		pipe_array = [];
		points = 0;
		game_over = false;
	}
}

// Collision detection
function Collision(flappy, pipes) {
	// Check for collision with upper pipe
	if (
		flappy.x + flappy.width > pipes.x &&
		flappy.x < pipes.x + pipes.width &&
		flappy.y < pipes.y + pipes.height &&
		flappy.y + flappy.height > pipes.y
	) {
		return true;
	}

	// Check for collision with lower pipe
	if (
		flappy.x + flappy.width > pipes.x &&
		flappy.x < pipes.x + pipes.width &&
		flappy.y + flappy.height > pipes.y + pipes.height * 2 &&
		flappy.y < pipes.y + pipes.height * 3
	) {
		return true;
	}

	// Check for passing through open space
	if (
		flappy.x > pipes.x + pipes.width &&
		flappy.x + flappy.width < pipes.x + pipes.width + velocity_x
	) {
		return false;
	}

	return false;
}
