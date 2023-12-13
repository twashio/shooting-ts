// Class of game scene
// This class controls all instances of objects
var GameScene = /** @class */ (function () {
    // Constrctor
    function GameScene(canvas) {
        this.frameCount = 0;
        this.score = 0;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.width = this.canvas.width;
        this.heigtht = this.canvas.height;
        this.img_me = new Image();
        this.img_me.src = "img/fighter.png";
        this.me = new Me(this);
        this.img_enemy = new Image();
        this.img_enemy.src = "img/missile.png";
        this.enemies = new Array();
        for (var i = 0; i < 5; i++) {
            this.enemies.push(new Enemy(this));
        }
        this.shots = new Array();
        this.particles = new Array();
        window.addEventListener("keydown", this.keyDown.bind(this));
        window.addEventListener("keyup", this.keyUp.bind(this));
    }
    Object.defineProperty(GameScene.prototype, "Context", {
        // Properties
        get: function () {
            return this.ctx;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameScene.prototype, "Width", {
        get: function () {
            return this.canvas.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameScene.prototype, "Height", {
        get: function () {
            return this.canvas.height;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameScene.prototype, "Me", {
        get: function () {
            return this.me;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameScene.prototype, "Img_Me", {
        get: function () {
            return this.img_me;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameScene.prototype, "Enemy", {
        get: function () {
            return this.Enemy;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameScene.prototype, "Img_Enemy", {
        get: function () {
            return this.img_enemy;
        },
        enumerable: false,
        configurable: true
    });
    // Methods
    // Callback function binded to keydown
    GameScene.prototype.keyDown = function (e) {
        var key = e.key;
        switch (key) {
            // Direction of moving
            case "ArrowUp":
                this.me.upFlag = true;
                this.me.downFlag = false;
                this.me.forwardFlag = false;
                this.me.backFlag = false;
                break;
                break;
            case "ArrowDown":
                this.me.upFlag = false;
                this.me.downFlag = true;
                this.me.forwardFlag = false;
                this.me.backFlag = false;
                break;
            case "ArrowRight":
                this.me.upFlag = false;
                this.me.downFlag = false;
                this.me.forwardFlag = true;
                this.me.backFlag = false;
                break;
            case "ArrowLeft":
                this.me.upFlag = false;
                this.me.downFlag = false;
                this.me.forwardFlag = false;
                this.me.backFlag = true;
                break;
            // Fire
            case "z":
            case "Z":
                // Prohibit rapid fire
                if (e.repeat) {
                    break;
                }
                var shot = new Shot(this);
                shot.x = this.me.x + this.me.Width * 0.45;
                shot.y = this.me.y;
                var pushed = false;
                for (var i = 0; i < this.shots.length; i++) {
                    if (!this.shots[i].live) {
                        this.shots[i] = shot;
                        pushed = true;
                        break;
                    }
                }
                if (!pushed) {
                    this.shots.push(shot);
                }
                break;
            // Slow down
            case "Shift":
                this.me.slowFlag = true;
            default:
                break;
        }
    };
    // Callback function binded to keyup
    GameScene.prototype.keyUp = function (e) {
        var key = e.key;
        switch (key) {
            // Stop moving
            case "ArrowUp":
                this.me.upFlag = false;
                break;
            case "ArrowDown":
                this.me.downFlag = false;
                break;
            case "ArrowRight":
                this.me.forwardFlag = false;
                break;
            case "ArrowLeft":
                this.me.backFlag = false;
                break;
            case "Shift":
                this.me.slowFlag = false;
            default:
                break;
        }
    };
    // Render game scene
    GameScene.prototype.Render = function () {
        // ----------- Update the screen ----------
        // Increment frame counter
        this.frameCount++;
        // Move objects only if the player is alive
        if (this.me.alive) {
            // Move enemies
            for (var i = 0; i < this.enemies.length; i++) {
                this.enemies[i].Move(this);
            }
            // Move player's aircraft
            this.me.Move(this);
            // Move player's shots
            for (var i = 0; i < this.shots.length; i++) {
                this.shots[i].Move(this);
            }
            // Enemy collision detection
            for (var i = 0; i < this.shots.length; i++) {
                for (var j = 0; j < this.enemies.length; j++) {
                    var isHit = this.enemies[j].IsHit(this.shots[i]);
                    if (isHit) {
                        // Remove the collided enemy
                        this.enemies[j].alive = false;
                        // Set particles
                        for (var k = 0; k < 50; k++) {
                            this.particles.push(new Particle(this.enemies[j].x, this.enemies[j].y));
                        }
                    }
                }
            }
            // If the bullet is off the screen, set a new bullet
            for (var i = 0; i < this.enemies.length; i++) {
                for (var k = 0; k < this.shots.length; k++) {
                    if (this.shots[k].live) {
                        if (this.enemies[i].IsHit(this.shots[k])) {
                            this.shots[k].live = false;
                            this.enemies[i].SetStartPosition(this);
                            this.score += 100;
                        }
                    }
                }
            }
            // Player collision detection
            for (var i = 0; i < this.enemies.length; i++) {
                var isHit = this.me.IsHit(this.enemies[i]);
                if (isHit) {
                    this.me.alive = false;
                    // Set particles
                    for (var j = 0; j < 50; j++) {
                        this.particles.push(new Particle(this.me.x, this.me.y));
                    }
                    // Remove the enemy player collides with
                    this.enemies.splice(i, 1);
                    break;
                }
            }
            // Generate a enemy every 300 frames
            if (this.frameCount % 300 == 0) {
                this.enemies.push(new Enemy(this));
            }
        }
        // Particles are moved regardless of whether the player is dead or alive
        for (var i = this.particles.length - 1; i >= 0; i--) {
            var p = this.particles[i];
            p.Move();
            if (p.age >= p.maxAge) {
                this.particles.splice(i, 1);
            }
        }
        // ----------- Render the screen ----------
        // Render background
        this.ctx.fillStyle = "rgb(107, 195, 255)";
        var grd = this.ctx.createLinearGradient(0, 0, 0, this.heigtht);
        grd.addColorStop(0, "#0000A0"); // Earth Blue
        grd.addColorStop(1, "#C2DFFF"); // Sea Blue
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Render enemies
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].Render(this);
        }
        // Render player
        if (this.me.alive) {
            this.me.Render(this);
        }
        // Render particles
        for (var i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].Render(this);
        }
        // Render player's shots
        for (var i = 0; i < this.shots.length; i++) {
            this.shots[i].Render(this);
        }
        // Render letters
        if (this.me.alive) {
            this.ctx.font = "bold 15px Verdana";
            var txtDesc = "↑:Up  ↓:Down  →:Forward ←:Back Z:Shoot  Shift:Reduce speed";
            this.ctx.strokeStyle = "rgb(0, 0, 0)";
            this.ctx.strokeText(txtDesc, 5, 25);
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText(txtDesc, 5, 25);
            var tmScore = this.ctx.measureText(txtDesc);
            var txtScore = "Score : " + this.score;
            this.ctx.strokeStyle = "rgb(0, 0, 0)";
            this.ctx.strokeText(txtScore, tmScore.width + 30, 25);
            this.ctx.fillText(txtScore, tmScore.width + 30, 25);
        }
        else {
            // End screen
            this.ctx.font = "bold 80px Verdana";
            var txtGame = "Game Over";
            var tmGame = this.ctx.measureText(txtGame);
            this.ctx.strokeStyle = "rgb(0, 0, 0)";
            this.ctx.strokeText(txtGame, this.width / 2 - tmGame.width / 2, this.heigtht / 2);
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText(txtGame, this.width / 2 - tmGame.width / 2, this.heigtht / 2);
            // Render score
            this.ctx.font = "bold 40px Verdana";
            var txtScore = "Score: " + this.score;
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            var tmScore = this.ctx.measureText(txtScore);
            this.ctx.fillText(txtScore, this.width / 2 - tmScore.width / 2, this.heigtht / 2 + 50);
            this.ctx.strokeStyle = "rgb(0, 0, 0)";
            this.ctx.strokeText(txtScore, this.width / 2 - tmScore.width / 2, this.heigtht / 2 + 50);
        }
        // Request frame
        window.requestAnimationFrame(this.Render.bind(this));
    };
    return GameScene;
}());
// Class of 2D Vector
var Vector2 = /** @class */ (function () {
    // Constructor
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    // Methods
    // Inner product
    Vector2.Dot = function (a, b) {
        return a.x * b.x + a.y * b.y;
    };
    // Normal vector
    Vector2.Normal = function (a) {
        return new Vector2(a.y, a.x * -1);
    };
    // Vector substraction
    Vector2.Minus = function (a, b) {
        return new Vector2(a.x - b.x, a.y - b.y);
    };
    return Vector2;
}());
// Class of Polygon
// It is used to collision detection
var Polygon = /** @class */ (function () {
    // Constructor
    function Polygon(vertices) {
        this.vertices = vertices;
    }
    // Methods
    // Create a list of normal vectors for each edge
    Polygon.getAxes = function (a, b) {
        var axes = new Array();
        for (var i = 0; i < a.vertices.length; i++) {
            var p1 = a.vertices[i];
            var p2 = i == a.vertices.length - 1 ? a.vertices[0] : a.vertices[i + 1];
            axes.push(Vector2.Normal(Vector2.Minus(p2, p1)));
        }
        for (var i = 0; i < b.vertices.length; i++) {
            var p1 = b.vertices[i];
            var p2 = i == b.vertices.length - 1 ? b.vertices[0] : b.vertices[i + 1];
            axes.push(Vector2.Normal(Vector2.Minus(p2, p1)));
        }
        return axes;
    };
    // Calculate the projection of a polygon to a straight line
    Polygon.prototype.Projection = function (axis) {
        var min = Vector2.Dot(axis, this.vertices[0]);
        var max = min;
        for (var i = 0; i < this.vertices.length; i++) {
            var p = Vector2.Dot(axis, this.vertices[i]);
            if (p < min) {
                min = p;
            }
            else if (p > max) {
                max = p;
            }
        }
        return [min, max];
    };
    // Returns whether two polygons collide
    Polygon.Collide = function (a, b) {
        // List of axes
        var axes = this.getAxes(a, b);
        for (var i = 0; i < axes.length; i++) {
            var ap = a.Projection(axes[i]);
            var bp = b.Projection(axes[i]);
            if (!(
            // If the projections do not overlap, it is not a hit.
            ((ap[0] <= bp[0] && bp[0] <= ap[1]) ||
                (bp[0] <= ap[0] && ap[0] <= bp[1])))) {
                return false;
            }
        }
        return true;
    };
    return Polygon;
}());
// Class of enemy aircraft
var Enemy = /** @class */ (function () {
    // Constructor
    function Enemy(scene) {
        this.alive = true;
        this.speed = 0;
        this.hSpeed = 0;
        this.aspect = 3.036;
        this.w = 100;
        this.h = this.w / this.aspect;
        this.x = scene.Width - this.w / 2;
        this.y = scene.Height / 2;
        this.angle = 0;
        this.SetStartPosition(scene);
    }
    // Methods
    // Set start position of enemy aricraft
    Enemy.prototype.SetStartPosition = function (scene) {
        this.x = this.w / 2 + scene.Width + (Math.random() * scene.Width) / 2;
        this.y = this.h / 2 + Math.random() * (scene.Height - this.h);
        this.speed = Math.random() * 3 + 4;
        if (0.5 > Math.random()) {
            var dx = this.x - scene.Me.x + 300;
            var dy = this.y - scene.Me.y;
            this.angle = Math.atan2(dy, dx);
            this.hSpeed = this.speed * (dy / dx);
        }
        else {
            this.hSpeed = 0;
        }
    };
    // Move enemy aircraft
    Enemy.prototype.Move = function (scene) {
        this.x -= this.speed;
        this.y -= this.hSpeed;
        if (this.x + this.w / 2 < 0) {
            this.SetStartPosition(scene);
        }
    };
    // Render enemy aircraft
    Enemy.prototype.Render = function (scene) {
        // Rotate and draw
        scene.Context.save();
        scene.Context.translate(this.x, this.y);
        scene.Context.rotate(this.angle);
        scene.Context.drawImage(scene.Img_Enemy, -this.w / 2, -this.h / 2, this.w, this.h);
        scene.Context.restore();
    };
    // Get apolygon of enemy aircraft
    Enemy.prototype.GetPolygon = function () {
        var _this = this;
        var vertices = [
            new Vector2(this.x - this.w * 0.5, this.y - this.h * 0.5),
            new Vector2(this.x + this.w * 0.5, this.y - this.h * 0.5),
            new Vector2(this.x + this.w * 0.5, this.y + this.h * 0.5),
            new Vector2(this.x - this.w * 0.5, this.y + this.h * 0.5),
        ];
        var vertices_roteted = [];
        vertices.forEach(function (vector) {
            // Convert coordinates to center on (0, 0)
            var x0 = vector.x - _this.x;
            var y0 = vector.y - _this.y;
            // Rotate
            var x1 = x0 * Math.cos(_this.angle) - y0 * Math.sin(_this.angle);
            var y1 = x0 * Math.sin(_this.angle) + y0 * Math.cos(_this.angle);
            // Restore potision
            var x2 = x1 + _this.x;
            var y2 = y1 + _this.y;
            vertices_roteted.push(new Vector2(x2, y2));
        });
        return new Polygon(vertices_roteted);
    };
    // Collision detection
    Enemy.prototype.IsHit = function (shot) {
        // If the shot is not alive, return false
        if (!shot.live) {
            return false;
        }
        // Get a vector of bullet
        var vertices = [new Vector2(shot.x, shot.y)];
        // Collision detection
        if (Polygon.Collide(this.GetPolygon(), new Polygon(vertices))) {
            return true;
        }
        return false;
    };
    return Enemy;
}());
// Class of player's aircraft
var Me = /** @class */ (function () {
    // Constructor
    function Me(scene) {
        this.alive = true;
        this.aspect = 2.048;
        this.w = 100;
        this.h = this.w / this.aspect;
        this.x = this.w / 2;
        this.y = scene.Height / 2;
        this.upFlag = false;
        this.downFlag = false;
        this.speed = 5;
        this.slowSpeed = 3;
        this.slowFlag = false;
    }
    Object.defineProperty(Me.prototype, "Width", {
        // Properties
        get: function () {
            return this.w;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Me.prototype, "Height", {
        get: function () {
            return this.h;
        },
        enumerable: false,
        configurable: true
    });
    // Methods
    // Move player's aircraft
    Me.prototype.Move = function (scene) {
        if (this.upFlag && this.y - this.h / 2 >= 0) {
            if (this.slowFlag) {
                this.y -= this.slowSpeed;
            }
            else {
                this.y -= this.speed;
            }
        }
        else if (this.downFlag && this.y + this.h / 2 <= scene.Height) {
            if (this.slowFlag) {
                this.y += this.slowSpeed;
            }
            else {
                this.y += this.speed;
            }
        }
        else if (this.forwardFlag && this.x + this.w / 2 <= scene.Width) {
            if (this.slowFlag) {
                this.x += this.slowSpeed;
            }
            else {
                this.x += this.speed;
            }
        }
        else if (this.backFlag && this.x - this.w / 2 >= 0) {
            if (this.slowFlag) {
                this.x -= this.slowSpeed;
            }
            else {
                this.x -= this.speed;
            }
        }
    };
    // Render player's aircraft
    Me.prototype.Render = function (scene) {
        scene.Context.drawImage(scene.Img_Me, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    };
    // Get apolygon of player's aircraft
    Me.prototype.GetPolygon = function () {
        // Make the hitbox size smaller than the image size
        var vertices = [
            new Vector2(this.x - this.w * 0.3, this.y - this.h * 0.3),
            new Vector2(this.x + this.w * 0.3, this.y - this.h * 0.3),
            new Vector2(this.x + this.w * 0.3, this.y + this.h * 0.3),
            new Vector2(this.x - this.w * 0.3, this.y + this.h * 0.3),
        ];
        return new Polygon(vertices);
    };
    // Collision detection
    Me.prototype.IsHit = function (enemy) {
        if (Polygon.Collide(this.GetPolygon(), enemy.GetPolygon())) {
            return true;
        }
        return false;
    };
    return Me;
}());
// Class of shots of player's aircraft
var Shot = /** @class */ (function () {
    // Constructor
    function Shot(scene) {
        this.live = true;
        this.w = 10;
        this.h = 10;
        this.x = 100;
        this.y = scene.Height / 2;
    }
    // Methods
    // Move bullets
    Shot.prototype.Move = function (scene) {
        this.x += 10;
        if (this.x > scene.Width + this.w) {
            this.live = false;
        }
    };
    // Render bullets
    Shot.prototype.Render = function (scene) {
        if (!this.live)
            return;
        // Get context
        var ctx = scene.Context;
        // Begin a new path
        ctx.beginPath();
        // Set gradation
        var grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.w / 2);
        grd.addColorStop(0, "white");
        grd.addColorStop(1, "orange");
        ctx.fillStyle = grd;
        // Draw the bullet
        ctx.arc(this.x, this.y, this.w / 2, 0, Math.PI * 2, true);
        ctx.fill();
    };
    return Shot;
}());
// Class of particle of explosion
var Particle = /** @class */ (function () {
    // Constructor
    function Particle(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.age = 0;
        this.maxAge = 100;
    }
    // Methods
    Particle.prototype.Render = function (scene) {
        scene.Context.beginPath();
        scene.Context.arc(this.x, this.y, 3, 0, 2 * Math.PI);
        scene.Context.fillStyle =
            "rgba(255, 150, 0, " + (1 - this.age / this.maxAge) + ")";
        scene.Context.fill();
    };
    Particle.prototype.Move = function () {
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
    };
    return Particle;
}());
window.onload = function () {
    // Get canvas element
    var canvas = document.getElementById("canvas");
    // Create a game class instance
    var scene = new GameScene(canvas);
    // Render screen
    scene.Render();
};
