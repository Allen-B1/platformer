
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
		if(!(thing instanceof MovableThing) && this.player !== null) {
			var dir = MovableThing.colCheck(this.player, thing);
			this.player.ontouch(dir);
		}
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
		this.vel_y = 0;
	}
	this.x += this.vel_x;
	this.y += this.vel_y;
}
Object.defineProperty(MovableThing.prototype, "is_player", {
	get: function() {
		return this === this.game.player;
	}
});

MovableThing.prototype.ontouch = function(dir) {
	if (dir === "l" || dir === "r") {
		this.vel_x = 0;
		this.jumping = false;
	} else if (dir === "b") {
		this.grounded = true;
		this.jumping = false;
	} else if (dir === "t") {
		player.vel_y *= -1;
	}
}

/* Thanks Loktar! http://www.somethinghitme.com/2013/04/16/creating-a-canvas-platformer-tutorial-part-tw/ */
MovableThing.colCheck = function(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.w / 2)) - (shapeB.x + (shapeB.w / 2)),
        vY = (shapeA.y + (shapeA.h / 2)) - (shapeB.y + (shapeB.h / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.w / 2) + (shapeB.w / 2),
        hHeights = (shapeA.h / 2) + (shapeB.h / 2),
        colDir = null;
 
    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {         // figures out on which side we are colliding (top, bottom, left, or right)        
		console.log("Touching!");
	var oX = hWidths - Math.abs(vX),
		oY = hHeights - Math.abs(vY);
		if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                shapeA.y += oY;
            } else {
                colDir = "b";
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                shapeA.x += oX;
            } else {
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
    return colDir;
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



