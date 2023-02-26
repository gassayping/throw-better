import { world, system, Vector, Location, ItemStack, ItemTypes } from '@minecraft/server';
import { throwables } from "throwables.js";

for (const item in throwables) {
	if (!throwables.hasOwnProperty(item)) continue;
	const ammo = throwables[item].ammo;
	if (!ammo) continue;
	ammo.consume ??= 1;
	const scoreboard = ammo.scoreboard;
	if (!scoreboard) continue;
	try {
		world.scoreboard.addObjective(scoreboard.name, scoreboard.name);
	} catch { }
	scoreboard.id = world.scoreboard.getObjective(scoreboard.name);
}

const playersThrowing = new Map();
const lastShot = new Map();

world.events.itemStartCharge.subscribe((eventData) => {
	const item = eventData.itemStack.typeId;
	if (!throwables[item]) return;
	const player = eventData.source;
	if (system.currentTick - lastShot.get(`${player.id}${item}`) < throwables[item].fireRate) return;
	if (throwables[item].singleFire) {
		fire(player, item);
		return;
	}
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

async function fire(player, item, scheduleId = 0) {
	if (playersThrowing.get(player.id) !== scheduleId && scheduleId) {
		system.clearRunSchedule(scheduleId);
		return;
	}

	const viewVector = player.viewDirection;
	const { x, y, z } = Vector.add(player.headLocation, viewVector);
	const projectile = player.dimension.spawnEntity(throwables[item].projectile, new Location(x, y, z));
	projectile.setVelocity(new Vector(viewVector.x * throwables[item].projectileVelo, viewVector.y * throwables[item].projectileVelo, viewVector.z * throwables[item].projectileVelo));
	lastShot.set(`${player.id}${item}`, system.currentTick);

	const ammoObj = throwables[item].ammo;
	if (!ammoObj) return;
	if (ammoObj.item) {
		await player.runCommandAsync(`clear @s ${ammoObj.item} 0 ${ammoObj.consume}`);
	} else if (ammoObj.scoreboard) {
		var ammo;
		try {
			ammo = player.scoreboard.getScore(ammoObj.scoreboard.id) - 1;
		} catch {
			await player.runCommandAsync(`scoreboard players add @s ${ammoObj.scoreboard.name} ${ammoObj.scoreboard.max}`);
			ammo = player.scoreboard.getScore(ammoObj.scoreboard.id) - 1;
		}
		if (ammo <= 0) {
			player.getComponent("minecraft:inventory").container.getSlot(player.selectedSlot).setItem(new ItemStack(ItemTypes.get(ammoObj.emptyItem)));
		} else {
			player.runCommandAsync(`scoreboard players set @s ${ammoObj.scoreboard.name} ${ammo}`);
		}
	}
}
