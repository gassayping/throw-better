# Throw Better

A Minecraft Bedrock script for throwable items WITHOUT using player.json! With a json structure for defining throwable items, you can easily configure settings per item, in a familiar format even if you don't understand the Minecraft scripting API. Settings include what to throw and how often to throw it.

## Features:

- No player.json
- Easy to add items
- Reloadable items
 - Customizable options:
	- Fire rate
	- Projectile speed
	- Ammo
		- Scoreboard or item
		- Consume amount
- Single fire option
- Reloading
	- Reload time
	- Ammo

## Usage

This requires pre-existing item that can be used in your BP
1. Open the scripts/throwables.js file
2. Add your items as json objects
3. Define the `fireRate`, `projectile`, and `projectileVelo`
4. Optionally define the `ammo` object

## Documentation

### Throwables.js

<table>
<thead>
<tr>
<th><strong>Name</strong></th>
<th><strong>Description</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td>fireRate</td>
<td>Delay in ticks between each time the item is thrown (20 ticks/second). <em>Required</em></td>
</tr>
<tr>
<td>projectile</td>
<td>The projectile that will be thrown. <em>Required</em></td>
</tr>
<tr>
<td>projectileVelo</td>
<td>The speed that the projectile will be thrown at. <em>Required</em></td>
</tr>
<tr>
<td>ammo</td>
<td>Object that defines the item’s requirements for ammo. <em>Optional</em><table>
<tbody>
  <tr>
    <td>item</td>
    <td>The item that the throwable will consume. This can be the same as the throwable item, but will not allow for fast custom throw speeds. <em>Required if scoreboard undefined</em></td>
  </tr>
  <tr>
    <td>scoreboard</td>
    <td>The object of the scoreboard to track ammo <em>Required if item undefined</em><table>
<tbody>
  <tr>
    <td>name</td>
    <td>The name of the scoreboard item <em>Required</em></td>
  </tr>
  <tr>
    <td>max</td>
    <td>The number of ammo for the throwable item <em>Required</em></td>
  </tr>
  <tr>
    <td>emptyItem</td>
    <td>The item that the player will get once they are out of ammo <em>Optional</em></td>
  </tr>  
</tbody>
</table> </td>
  </tr>
    <tr>
    <td>consume</td>
    <td>The amount of items to consume from the player’s inventory <em>Required</em>, but will default to one if undefined</td>
  </tr>
  </tr>
    <tr>
    <td>singleFire</td>
    <td>Whether the item will fire once per button press or not. <em>Optional</em> - Defaults to false</td>
  </tr>
</tbody>
</table> </td>
</tr>
</tbody>
</table>

### Reloadables.js

<table>
<thead>
  <tr>
    <th>Name</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>reloadTime</td>
    <td>Time in ticks before player gets the reloaded item back. <em>Required</em></td>
  </tr>
  <tr>
    <td>reloadedItem</td>
    <td>Item that will be given to the player when they reload. <em>Required</em></td>
  </tr>
  <tr>
    <td>ammo</td>
    <td>Object defining the item’s ammo requirements. <em>Required</em><table>
<thead>
  <tr>
    <td>item</td>
    <td>Item that will be consumed by reloading. <em>Required</em></td>
  </tr>
</thead>
<tbody>
  <tr>
    <td>amount</td>
    <td>Amount of the item required for reloading. <em>Required</em></td>
  </tr>
</tbody>
</table></td>
  </tr>
  <tr>
    <td>scoreboard</td>
    <td>Object defining the scoreboard for the item. <em>Optional</em>
  <table>
  <tr>
    <td>name</td>
    <td>Name of the scoreboard to add ammo to. Should be the same as the scoreboard of the throwable. <em>Required</em>, but will default to the scoreboard of the reloadedItem’s scoreboard in throwables.</td>
  </tr>
<tbody>
  <tr>
    <td>max</td>
    <td>Number of ammo to add to the scoreboard when reloading. <em>Required</em></td>
  </tr>
</tbody>
</table></td>
  </tr>
</tbody>
</table>