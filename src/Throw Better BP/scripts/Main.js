import { world, system, Vector, ItemStack, ItemTypes } from '@minecraft/server';
import { throwables } from "./throwables";

for (const item in throwables) {
	if (!throwables.hasOwnProperty(item)) continue;
	const ammo = throwables[item].ammo;
	if (!ammo) continue;
	const scoreboard = ammo.scoreboard;
	if (!scoreboard) continue;
	try {
		world.scoreboard.addObjective(scoreboard.name, scoreboard.name);
	} catch { }
	scoreboard.id = world.scoreboard.getObjective(scoreboard.name);
}

const playersThrowing = {};
const lastShot = {};

world.events.itemStartCharge.subscribe((eventData) => {
	const item = eventData.itemStack.typeId;
	if (!throwables[item]) return;
	if (system.currentTick - lastShot?.[`${eventData.source.id}${item}`] < throwables[item].fireRate) return;
	const player = eventData.source;
	if (throwables[item].singleFire) {
		fire(player, item);
		return;
	}
	const throwLoop = system.runInterval(() => {
		if (!playersThrowing[player.id]) {
			system.clearRun(throwLoop);
			return;
		}
		fire(player, item, throwLoop);
	}, throwables[item].fireRate);
	playersThrowing[player.id] = throwLoop;
	fire(player, item, throwLoop);
})

world.events.itemStopCharge.subscribe(eventData => {
	delete playersThrowing[eventData.source.id];
})

async function fire(player, item, scheduleId = 0) {
	if (playersThrowing[player.id] !== scheduleId && scheduleId) {
		system.clearRun(scheduleId);
		return;
	}
	const ammoObj = throwables[item].ammo;
	if (ammoObj) {
		if (ammoObj.item) {
			const hasItem = await player.runCommandAsync(`testfor @s[hasitem={item=${ammoObj.item}}]`);
			if (hasItem.successCount !== 1) return;
			player.runCommandAsync(`clear @s ${ammoObj.item} 0 ${ammoObj.consume ?? 1}`);
		} else if (ammoObj.scoreboard) {
			var ammo;
			try {
				ammo = player.scoreboard.getScore(ammoObj.scoreboard.id);
			} catch {
				await player.runCommandAsync(`scoreboard players add @s ${ammoObj.scoreboard.name} ${ammoObj.scoreboard.max}`);
				ammo = player.scoreboard.getScore(ammoObj.scoreboard.id);
			}
			if (ammo <= 0) {
				player.getComponent("minecraft:inventory").container.getSlot(player.selectedSlot).setItem(new ItemStack(ItemTypes.get(ammoObj.emptyItem)));
			} else {
				player.runCommandAsync(`scoreboard players set @s ${ammoObj.scoreboard.name} ${ammo - 1}`);
				player.scoreboard.setScore(ammoObj.scoreboard.id, ammo);

			}
		}
	}
	let viewVector = player.getViewDirection();
	const playerRotation = player.getRotation()
	if (playerRotation.x > 30) {
		viewVector.x *= 2.1;
		viewVector.y *= 2.1;
		viewVector.z *= 2.1;
	}
	const { x, y, z } = Vector.add(player.getHeadLocation(), viewVector);
	const projectile = player.dimension.spawnEntity(throwables[item].projectile, { "x": x, "y": y, "z": z });
	projectile.setRotation(-playerRotation.x, -playerRotation.y);
	projectile.applyImpulse(new Vector(viewVector.x * throwables[item].projectileVelo, viewVector.y * throwables[item].projectileVelo, viewVector.z * throwables[item].projectileVelo));
	lastShot[`${player.id}${item}`] = system.currentTick;
}
