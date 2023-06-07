import { world, system, Vector, ItemStack } from '@minecraft/server';
import { reloadables } from './reloadables.js';
import { throwables } from './throwables.js';
for (const throwItem in throwables) {
	if (!throwables.hasOwnProperty(throwItem))
		continue;
	const scoreboard = throwables[throwItem].ammo?.scoreboard;
	if (!scoreboard)
		continue;
	try {
		world.scoreboard.addObjective(scoreboard.name, scoreboard.name);
	}
	catch { }
	scoreboard.id = world.scoreboard.getObjective(scoreboard.name);
}
for (const reloadItem in reloadables) {
	if (!reloadables.hasOwnProperty(reloadItem))
		continue;
	const scoreboard = reloadables[reloadItem].scoreboard;
	const throwObj = throwables[reloadables[reloadItem].reloadedItem];
	if (!scoreboard || !throwObj?.ammo.scoreboard)
		continue;
	scoreboard.id = throwObj.ammo.scoreboard.id;
	scoreboard.max ??= throwObj.ammo.scoreboard.max;
}
const playersThrowing = new Map();
const playersReloading = new Map();
const lastShot = {};
world.afterEvents.itemStartCharge.subscribe((eventData) => {
	const item = eventData.itemStack.typeId;
	if (!throwables[item] && !reloadables[item])
		return;
	if (system.currentTick - lastShot?.[`${eventData.source.id}${item}`] < throwables[item]?.fireRate)
		return;
	const player = eventData.source;
	if (reloadables[item]) {
		startReload(player, item);
		return;
	}
	if (throwables[item].singleFire) {
		fire(player, item);
		return;
	}
	const throwLoop = system.runInterval(() => {
		if (!playersThrowing.has(player.id)) {
			system.clearRun(throwLoop);
			return;
		}
		fire(player, item, throwLoop);
	}, throwables[item].fireRate);
	playersThrowing.set(player.id, throwLoop);
	fire(player, item, throwLoop);
});
world.afterEvents.itemStopCharge.subscribe(eventData => {
	const playerId = eventData.source.id;
	playersThrowing.delete(playerId);
	if (playersReloading.has(playerId)) {
		system.clearRun(playersReloading.get(playerId));
		playersReloading.delete(playerId);
	}
});
async function fire(player, item, scheduleId = 0) {
	if (playersThrowing.get(player.id) !== scheduleId && scheduleId) {
		system.clearRun(scheduleId);
		return;
	}
	const ammoObj = throwables[item].ammo;
	if (ammoObj) {
		if (ammoObj.item) {
			const hasItem = player.runCommand(`testfor @s[hasitem={item=${ammoObj.item}}]`);
			if (hasItem.successCount !== 1)
				return;
			player.runCommand(`clear @s ${ammoObj.item} 0 ${ammoObj.consume ?? 1}`);
		}
		else if (ammoObj.scoreboard) {
			let ammo;
			try {
				ammo = player.scoreboardIdentity.getScore(ammoObj.scoreboard.id);
			}
			catch {
				player.runCommand(`scoreboard players add @s ${ammoObj.scoreboard.name} ${ammoObj.scoreboard.max}`);
				ammo = player.scoreboardIdentity.getScore(ammoObj.scoreboard.id);
			}
			if (ammo === 0) {
				//@ts-ignore
				player.getComponent('minecraft:inventory')?.container.getSlot(player.selectedSlot).setItem(new ItemStack(ammoObj.scoreboard.emptyItem));
			}
			else {
				player.scoreboardIdentity.setScore(ammoObj.scoreboard.id, --ammo);
			}
		}
	}
	let viewVector = player.getViewDirection();
	const playerRotation = player.getRotation();
	if (playerRotation.x > 30)
		viewVector = Vector.multiply(viewVector, 2.1);
	const spawnLoc = Vector.add(player.getHeadLocation(), viewVector);
	const projectile = player.dimension.spawnEntity(throwables[item].projectile, spawnLoc);
	projectile.setRotation({ 'x': -playerRotation.x, 'y': -playerRotation.y });
	projectile.applyImpulse(Vector.multiply(viewVector, throwables[item].projectileVelo));
	lastShot[`${player.id}${item}`] = system.currentTick;
}
async function startReload(player, item) {
	const reloadItem = reloadables[item];
	const reloadAmmo = reloadItem.ammo;
	const hasItem = player.runCommand(`testfor @s[hasitem={item=${reloadAmmo.item},quantity=${reloadAmmo.amount}..}]`);
	if (hasItem.successCount !== 1)
		return;
	const reloadTimer = system.runTimeout(() => {
		player.runCommand(`clear @s ${reloadAmmo.item} 0 ${reloadAmmo.amount}`);
		//@ts-ignore
		const inv = player.getComponent('minecraft:inventory').container;
		const slot = inv.getSlot(player.selectedSlot);
		lastShot[`${player.id}${reloadItem.reloadedItem}`] = system.currentTick;
		slot.setItem(new ItemStack(reloadItem.reloadedItem));
		if (!reloadItem.scoreboard)
			return;
		try {
			player.scoreboardIdentity.setScore(reloadItem.scoreboard.id, reloadItem.scoreboard.max);
		}
		catch {
			player.runCommand(`scoreboard players set @s ${reloadItem.scoreboard.name} ${reloadItem.scoreboard.max}`);
		}
	}, reloadItem.reloadTime);
	playersReloading.set(player.id, reloadTimer);
}
