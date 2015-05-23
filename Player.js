var retreatThreshold = 9;
var retreatThresholdInBattle = 5;
var restThreshold = 12;

class Player {
    playTurn(warrior) {
        if (!this.beforeTurn(warrior)) {
            if (warrior.feel().isCaptive()) {
                warrior.rescue();
            } else if (this.captiveInSight('backward')) {
                warrior.pivot();
            } else if (warrior.feel().isEmpty()) {
                if (this.health < this.prevHealth) { // !taking damage!
                    if (this.health < retreatThreshold) {
                        if (this.enemyInSight() && this.enemyInSight('backward')) {
                            warrior.walk(this.whereIsSafer());
                        } else if (this.enemyInSight()) {
                            if (!warrior.feel('backward').isWall()) {
                                warrior.walk('backward');
                            } else {
                                warrior.walk();
                            }
                        } else if (this.enemyInSight('backward')) {
                            if (!warrior.feel().isWall()) {
                                warrior.walk();
                            } else {
                                warrior.walk('backward');
                            }
                        }
                    } else {
                        warrior.walk();
                    }
                } else if (this.enemyInSight() && !this.captiveInSight()) {
                    warrior.shoot();
                } else if (this.health < restThreshold) {
                    if (!this.enemyInSight() && this.stairsInSight()) {
                        warrior.walk();
                    } else {
                        warrior.rest();
                    }
                } else {
                    warrior.walk();
                }
            } else if (warrior.feel().isEnemy()) {
                if (this.health < retreatThresholdInBattle && !warrior.feel('backward').isWall()) {
                    warrior.walk('backward');
                } else {
                    warrior.attack();
                }
            }
        }

        this.afterTurn();
    }

    beforeTurn(warrior) {
        this.warrior = warrior;
        this.health = warrior.health();

        if (this.initialHealth === null) {
            this.initialHealth = this.health;
            this.prevHealth = this.health;
        }

        if (!this.wallReached) {
            if (warrior.feel('backward').isWall()) {
                this.wallReached = true;
            } else if (!this.enemyInSight() && !this.captiveInSight() && !this.stairsInSight() && this.wallInSight()) {
                this.wallReached = true;
                warrior.pivot();
                return true;
            }
        }

    }

    afterTurn() {
        this.prevHealth = this.health;
    }

    enemyInSight(direction) {
        return this.warrior.look(direction).some(i => i.isEnemy());
    }

    captiveInSight(direction) {
        return this.warrior.look(direction).some(i => i.isCaptive());
    }

    stairsInSight(direction) {
        return this.warrior.look(direction).some(i => i.isStairs());
    }

    wallInSight(direction) {
        return this.warrior.look(direction).some(i => i.isWall());
    }

    allClear(direction) {
        return this.warrior.look(direction).every(i => i.isEmpty());
    }

    whereIsSafer() {
        var fw = Infinity, bw = Infinity;

        this.warrior.look('forward').forEach((s, i) => s.isEnemy() && !Number.isFinite(fw) && (fw = i));
        this.warrior.look('backward').forEach((s, i) => s.isEnemy() && !Number.isFinite(bw) && (bw = i));

        return fw > bw ? 'forward' : 'backward';
    }
}

Player.prototype.initialHealth = null;
Player.prototype.prevHealth = null;
Player.prototype.health = null;
Player.prototype.wallReached = false;

global.Player = Player;
