import { world, system, Vector, Location, ItemStack, ItemTypes} from '@minecraft/server';
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
}

let playersThrowing = new Map();
let lastShot = new Map();

world.events.itemStartCharge.subscribe(eventData => {
	const item = eventData.itemStack.typeId;
	if (!throwables[item]) return;
	if (system.currentTick-lastShot.get(`${eventData.source.id}${item}`) < throwables[item].fireRate) return;
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

async function fire(player, item, scheduleId) {
	if (!playersThrowing.has(player.id) || playersThrowing.get(player.id) !== scheduleId) {
		system.clearRunSchedule(playersThrowing.get(player.id));
		return;
	}
	
	let viewVector = player.viewDirection;
	if(viewVector.y < -0.5){
		viewVector.y *= 1.75;
	}
	const { x, y, z } = Vector.add(player.headLocation, viewVector);
	const projectile = player.dimension.spawnEntity(throwables[item].projectile, new Location(x, y, z));
	projectile.setVelocity(new Vector(viewVector.x * throwables[item].projectileVelo, viewVector.y * throwables[item].projectileVelo, viewVector.z * throwables[item].projectileVelo));
	lastShot.set(`${player.id}${item}`, system.currentTick);
	const ammoObj = throwables[item].ammo;
	if (!ammoObj) return;
	ammoObj.consume ??= 1;
	if (ammoObj.item) {
		player.runCommandAsync(`clear @s ${item} 0 ${ammoObj.consume}`);
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
		}
			player.runCommandAsync(`scoreboard players set @s ${ammoObj.scoreboard.name} ${ammo}`);
	}
}
