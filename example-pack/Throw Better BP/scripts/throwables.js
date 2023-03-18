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
			"item": "example:rock",
			"consume": 1
		},
		"singleFire": true
	},
	"example:snow_gun": {
		"fireRate": 3,
		"projectile": "snowball",
		"projectileVelo": 3,
		"ammo": {
			"scoreboard": {
				"name": "snow_gun",
				"max": 16,
				"emptyItem": "example:empty_snow_gun"
			}
		}
	}
}
