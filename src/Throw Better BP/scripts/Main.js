import { world, system, Vector, Location } from '@minecraft/server';
import { throwables } from "throwables.js";

for (const item in throwables) {
	const ammo = throwables[item].ammo;
	if (!ammo) continue;
	const scoreboard = ammo.scoreboard;
	if (!scoreboard) continue;
	try {
		world.scoreboard.addObjective(scoreboard.name, scoreboard.name);
	} catch { }
	scoreboard.id = world.scoreboard.getObjective(scoreboard.name);
	console.warn(scoreboard.id);
}

let playersThrowing = new Map();

world.events.itemStartCharge.subscribe(eventData => {
	const item = eventData.itemStack.typeId;
	if (!throwables[item]) return;
	const player = eventData.source;
	const throwLoop = system.runSchedule(() => {
		if (!playersThrowing.has(player.id)) {
			system.clearRunSchedule(throwLoop);
			return;
		}
		fire(player, item, throwLoop);
	}, throwables[item].fireRate)
	playersThrowing.set(player.id, throwLoop);
	fire(player, item, throwLoop);
})

world.events.itemStopCharge.subscribe(eventData => {
	playersThrowing.delete(eventData.source.id);
})

function fire(player, item, scheduleId) {
	if (!playersThrowing.has(player.id) || playersThrowing.get(player.id) !== scheduleId) {
		system.clearRunSchedule(playersThrowing.get(player.id));
		return;
	}
	const { x, y, z } = Vector.add(player.headLocation, player.viewDirection);
	player.dimension.spawnEntity(throwables[item].projectile, new Location(x, y, z)).setVelocity(new Vector(player.viewDirection.x * throwables[item].projectileVelo, player.viewDirection.y * throwables[item].projectileVelo, player.viewDirection.z * throwables[item].projectileVelo));
	const ammoObj = throwables[item].ammo;
	if (!ammoObj) return;
	ammoObj.consume ??= 1;
	if (ammoObj.item) {
		player.runCommandAsync(`clear @s ${item} 0 ${ammoObj.consume}`);
	} else if (ammoObj.scoreboard) {
		ammoObj.scoreboard.id = world.scoreboard.getObjective(ammoObj.scoreboard.name);
		ammoObj.scoreboard.id.setScore(player.scoreboard, ammoObj.scoreboard.max);
		const ammo = player.scoreboard.getScore(ammoObj.scoreboard.id) - 1;
		if (ammo <= 0) {
			player.getComponent("minecraft:inventory").container.getSlot(player.currentSlot).clearItem();
		} else {
			ammoObj.scoreboard.id.setScore(player.scoreboard, ammo);
		}
	}
}
