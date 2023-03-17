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
	},
	"example:snow_gun": {
		"fireRate": 1,
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