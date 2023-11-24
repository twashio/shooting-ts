import { setCookie, getCookie } from "./cookie.js";
var GameScene = /** @class */ (function () {
    function GameScene(canvas) {
        this.frameCount = 0;
        this.score = 0;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 1000;
        this.canvas.height = 600;
        this.width = this.canvas.width;
        this.heigtht = this.canvas.height;
        this.img_me = new Image();
        this.img_me.src = "img/war_sentouki_noman.png";
        this.me = new Me(this);
        this.img_enemy = new Image();
        this.img_enemy.src = "img/war_zerosen.png";
        this.enemies = new Array();
        for (var i = 0; i < 5; i++) {
            this.enemies.push(new Enemy(this));
        }
        this.shots = new Array();
        window.addEventListener("keydown", this.keyDown.bind(this));
        window.addEventListener("keyup", this.keyUp.bind(this));
    }
    Object.defineProperty(GameScene.prototype, "Context", {
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
    GameScene.prototype.keyDown = function (e) {
        var key = e.key;
        switch (key) {
            case "ArrowUp":
                this.me.upFlag = true;
                this.me.downFlag = false;
                break;
            case "ArrowDown":
                this.me.upFlag = false;
                this.me.downFlag = true;
                break;
            case "z":
            case "Z":
                // 連射できないようにする
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
            case "Shift":
                this.me.slowFlag = true;
            default:
                break;
        }
    };
    GameScene.prototype.keyUp = function (e) {
        var key = e.key;
        switch (key) {
            case "ArrowUp":
                this.me.upFlag = false;
                this.me.downFlag = false;
                break;
            case "ArrowDown":
                this.me.upFlag = false;
                this.me.downFlag = false;
                break;
            case "Shift":
                this.me.slowFlag = false;
            default:
                break;
        }
    };
    GameScene.prototype.Render = function () {
        this.frameCount++;
        if (this.me.alive) {
            // 敵機の移動
            for (var i = 0; i < this.enemies.length; i++) {
                this.enemies[i].Move(this);
            }
            // 自機の移動
            this.me.Move(this);
            // 自機の弾の移動
            for (var i = 0; i < this.shots.length; i++) {
                this.shots[i].Move(this);
            }
            // 敵機の当たり判定
            for (var i = 0; i < this.shots.length; i++) {
                for (var j = 0; j < this.enemies.length; j++) {
                    var isHit = this.enemies[j].IsHit(this.shots[i]);
                    if (isHit) {
                        this.enemies[j].alive = false;
                    }
                }
            }
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
            // 自機の当たり判定
            for (var i = 0; i < this.enemies.length; i++) {
                var isHit = this.me.IsHit(this.enemies[i]);
                if (isHit) {
                    this.me.alive = false;
                    break;
                }
            }
            // 一定時間間隔で敵機を生成
            if (this.frameCount % 300 == 0) {
                this.enemies.push(new Enemy(this));
            }
        }
        // 背景の描画
        this.ctx.fillStyle = "rgb(107, 195, 255)";
        var grd = this.ctx.createLinearGradient(0, 0, 0, this.heigtht);
        grd.addColorStop(0, "#0000A0"); // Earth Blue
        grd.addColorStop(1, "#C2DFFF"); // Sea Blue
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // 敵機の描画
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].Render(this);
        }
        // 自機の描画
        this.me.Render(this);
        // 自機の弾の描画
        for (var i = 0; i < this.shots.length; i++) {
            this.shots[i].Render(this);
        }
        // 文字の描画
        if (this.me.alive) {
            this.ctx.font = "bold 15px Verdana";
            var txtDesc = "↑:Up  ↓:Down  Z:Shoot  Shift:Reduce speed";
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
            // 終了画面
            this.ctx.font = "bold 80px Verdana";
            var txtGame = "Game Over";
            var tmGame = this.ctx.measureText(txtGame);
            this.ctx.strokeStyle = "rgb(0, 0, 0)";
            this.ctx.strokeText(txtGame, this.width / 2 - tmGame.width / 2, this.heigtht / 2);
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText(txtGame, this.width / 2 - tmGame.width / 2, this.heigtht / 2);
            // ベストスコアの更新
            var bestScore = 0;
            var pastBestScore = Number(getCookie("score"));
            if (pastBestScore == null) {
                bestScore = this.score;
            }
            else {
                bestScore =
                    pastBestScore > this.score ? pastBestScore : this.score;
            }
            setCookie("score", String(bestScore), 30);
            // スコアの表示
            this.ctx.font = "bold 40px Verdana";
            var txtScore = "Score: " + this.score + "  " + "Your Best: " + bestScore;
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            var tmScore = this.ctx.measureText(txtScore);
            this.ctx.fillText(txtScore, this.width / 2 - tmScore.width / 2, this.heigtht / 2 + 50);
            this.ctx.strokeStyle = "rgb(0, 0, 0)";
            this.ctx.strokeText(txtScore, this.width / 2 - tmScore.width / 2, this.heigtht / 2 + 50);
        }
        window.requestAnimationFrame(this.Render.bind(this));
    };
    return GameScene;
}());
var Rect = /** @class */ (function () {
    function Rect(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    Rect.prototype.IsContain = function (px, py) {
        if (this.x <= px &&
            px <= this.x + this.w &&
            this.y <= py &&
            py <= this.y + this.h) {
            return true;
        }
        return false;
    };
    Rect.prototype.IsIntersect = function (r) {
        var mx1 = this.x;
        var my1 = this.y;
        var mx2 = this.x + this.w;
        var my2 = this.y + this.h;
        var ex1 = r.x;
        var ey1 = r.y;
        var ex2 = r.x + r.w;
        var ey2 = r.y + r.h;
        return mx1 <= ex2 && ex1 <= mx2 && my1 <= ey2 && ey1 <= my2;
    };
    return Rect;
}());
var Enemy = /** @class */ (function () {
    function Enemy(scene) {
        this.alive = true;
        this.speed = 0;
        this.hSpeed = 0;
        this.aspect = 1.456;
        this.w = 100;
        this.h = this.w / this.aspect;
        this.x = scene.Width - this.w / 2;
        this.y = scene.Height / 2;
        this.SetStartPosition(scene);
    }
    Enemy.prototype.SetStartPosition = function (scene) {
        this.x = this.w / 2 + scene.Width + (Math.random() * scene.Width) / 2;
        this.y = this.h / 2 + Math.random() * (scene.Height - this.h);
        this.speed = Math.random() * 3 + 4;
        if (0.5 > Math.random()) {
            var dx = this.x - scene.Me.x + 300;
            var dy = this.y - scene.Me.y;
            this.hSpeed = this.speed * (dy / dx);
        }
        else {
            this.hSpeed = 0;
        }
    };
    Enemy.prototype.Move = function (scene) {
        this.x -= this.speed;
        this.y -= this.hSpeed;
        if (this.x + this.w / 2 < 0) {
            this.SetStartPosition(scene);
        }
    };
    Enemy.prototype.Render = function (scene) {
        scene.Context.drawImage(scene.Img_Enemy, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    };
    Enemy.prototype.GetHitRect = function () {
        return new Rect(this.x - this.w * 0.3, this.y - this.h * 0.3, this.w * 0.6, this.h * 0.6);
    };
    Enemy.prototype.IsHit = function (shot) {
        if (!shot.live) {
            return false;
        }
        var hitRect = this.GetHitRect();
        if (hitRect.IsContain(shot.x, shot.y)) {
            return true;
        }
        return false;
    };
    return Enemy;
}());
var Me = /** @class */ (function () {
    function Me(scene) {
        this.alive = true;
        this.aspect = 1.331;
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
    Me.prototype.Move = function (scene) {
        if (this.upFlag && this.y - this.h / 2 >= 0) {
            if (this.slowFlag)
                this.y -= this.slowSpeed;
            else
                this.y -= this.speed;
        }
        else if (this.downFlag && this.y + this.h / 2 <= scene.Height) {
            if (this.slowFlag)
                this.y += this.slowSpeed;
            else
                this.y += this.speed;
        }
    };
    Me.prototype.Render = function (scene) {
        scene.Context.drawImage(scene.Img_Me, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    };
    Me.prototype.GetHitRect = function () {
        return new Rect(this.x - this.w * 0.3, this.y - this.h * 0.3, this.w * 0.6, this.h * 0.6);
    };
    Me.prototype.IsHit = function (enemy) {
        var hitRect = enemy.GetHitRect();
        if (hitRect.IsIntersect(this.GetHitRect())) {
            return true;
        }
        return false;
    };
    return Me;
}());
var Shot = /** @class */ (function () {
    function Shot(scene) {
        this.live = true;
        this.w = 10;
        this.h = 10;
        this.x = 100;
        this.y = scene.Height / 2;
    }
    Shot.prototype.Move = function (scene) {
        this.x += 10;
        if (this.x > scene.Width + this.w) {
            this.live = false;
        }
    };
    Shot.prototype.Render = function (scene) {
        if (!this.live)
            return;
        var ctx = scene.Context;
        ctx.beginPath();
        var grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.w / 2);
        grd.addColorStop(0, "white");
        grd.addColorStop(1, "orange");
        ctx.fillStyle = grd;
        ctx.arc(this.x, this.y, this.w / 2, 0, Math.PI * 2, true);
        ctx.fill();
    };
    return Shot;
}());
window.onload = function () {
    var canvas = document.getElementById("canvas");
    var scene = new GameScene(canvas);
    scene.Render();
};
