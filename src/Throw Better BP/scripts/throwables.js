export var throwables =
{
	"example:blow_gun": {
		"fireRate": 20,
		"projectile": "arrow",
		"projectileVelo": 40,
		"ammo": {
			"item": "arrow",
			"consume": 1
		},
		"singleFire": true
	},
	"example:rock": {
		"fireRate": 1,
		"projectile": "snowball",
		"projectileVelo": 1,
		"ammo": {
			"scoreboard": {
				"name": "rock",
				"max": 30,
				"emptyItem": "example:rock"
			}
		}
	}
}