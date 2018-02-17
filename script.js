
var canvas = document.getElementById("canvas");

window.onresize = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
window.onresize();
canvas.style.borderBottom = "10px solid #0F0";
canvas.style.background = "#AEF";

function Game(ctx) {
	this.ctx = ctx;
	this.keys = new Set();
	this.objects = [];
	this.player = null;
	this.x = 0;
	this.y = 0;
	var self = this;
	document.body.addEventListener("keydown", function(e) {
		self.keys.add(e.keyCode); });
	document.body.addEventListener("keyup", function(e) {
		self.keys.delete(e.keyCode); });
}
Game.prototype.add = function(thing) {
	this.objects.push(thing);
	thing.game = this;
}
Game.prototype.set_player = function(thing) {
	if(this.objects.indexOf(thing) === -1) {
		this.objects.push(thing);
	}
	thing.game = this;
	this.player = thing;
}
Game.prototype.draw = function(thing) {
	this.ctx.clearRect(0,0, canvas.width, canvas.height)
	this.objects.forEach(function(thing) { thing.draw(); });
}
Game.prototype.update = function() {
	var self = this;
	this.objects.forEach(function(thing) {
		if(typeof thing.update === "function") {
			thing.update(self.keys);
		}
	});
}
Game.prototype.mainloop = function() {
	try {
		this.update();
		this.draw();
	} catch(err) {
		console.error(err);
	}

	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || null;

	var self = this;
	var fn = function() {
		self.mainloop();
	}

	if(requestAnimationFrame !== null) {
		requestAnimationFrame(fn);
	} else {
		setTimeout(fn, 100);
	}
}

function Thing(x, y, w, h, bg, game) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.bg = bg;
	if(!game instanceof Game) throw new TypeError("game is not a Game");
	this.game = game;
}

Thing.prototype.draw = function(ctx) {
	if(typeof this.ondraw === "function") {
		this.ondraw(this.x, this.y);
	}
}

Thing.prototype.ondraw = function(x, y) {
	this.game.ctx.fillStyle = this.bg || "#000";
	this.game.ctx.fillRect(x, y, this.w, this.h);
}

function MovableThing(x, y, w, h, bg, game, speed) {
	Thing.call(this, x, y, w, h, bg, game);
	this.vel_x = 0;
	this.vel_y = 0;
	this.speed = speed || 5;
	this.jumping = false;
}
MovableThing.prototype = Object.create(Thing.prototype);
MovableThing.prototype.x = 0;
MovableThing.prototype.y = 0;
MovableThing.prototype.update = function(keys) {
	if(keys.has(38)) {
		if(!this.jumping && this.grounded) {
			this.jumping = true;
			this.grounded = false;
			this.vel_y = -Math.abs(this.speed) * 2;
		}
	} else {
		this.jumping = false;
	}
	if(keys.has(39)) {
		if(this.vel_x < this.speed) {
			this.vel_x++;
		}
	} else if(keys.has(37)) {
		if(this.vel_x > -this.speed) {
			this.vel_x--;
		}
	}

	this.vel_x *= 0.8;
	this.vel_y += 0.2;
	if(this.grounded) {
		this.vel_y = Math.min(this.vel_y, 0);
	}
	this.x += this.vel_x;
	this.y += this.vel_y;
	this.touch_check();
}
Object.defineProperty(MovableThing.prototype, "is_player", {
	get: function() {
		return this === this.game.player;
	}
});

MovableThing.prototype.touch_check = function() {
	var self = this;
	var dir;
	this.game.objects.forEach(function(obj) {
		if(obj === self) return;
		dir = dir || self.col_check(obj);
	});
	self.grounded = false;
	if (dir === "l" || dir === "r") {
		self.vel_x = 0;
		self.jumping = false;
	} else if (dir === "b") {
		self.grounded = true;
		self.jumping = false;
	} else if (dir === "t") {
		self.vel_y *= -1;
	}

}

MovableThing.prototype.col_check = function(obj) {
	var b = obj.y + obj.h,
		r = obj.x + obj.w;

	if(this.y + this.h > obj.y &&
		this.y < obj.y + obj.h &&
		this.x < obj.x + obj.w &&
		this.x + this.w > obj.x) {
		this.y = obj.y - this.h;
		console.log(this.y + " r " +  r);
		return "b";
	}
}

var game = new Game(canvas.getContext("2d"));
game.add(new Thing(10, canvas.height - 60, 50, 50));
game.add(new Thing(90, canvas.height - 100, 50, 50));

var player = new MovableThing(50, 50, 20, 20, "#228");
game.set_player(player);
player.ondraw = function(x, y) {
	this.constructor.prototype.ondraw.call(this, x, y);
	this.game.ctx.fillStyle = "#FFF";
	this.game.ctx.font = "14px monospace";
	this.game.ctx.fillText("i", x + 8, y + 5 + this.h / 2);
};

game.mainloop();



