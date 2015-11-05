var db = require('monk')('localhost/nostalgicTunes')
var Users = db.get('users')

var User = {
	findOne: function(email) {
		console.log(email,' -=-=-=-=-=-=-=-=-=- user within the findOne function in the findOne on lib')
		return Users.findOne({email: email})
	},
	findAll: function() {
		return Users.find({})
	},
	insert: function(userEmail, hashedPassword) {
		return Users.insert({ email:userEmail, password: hashedPassword })
	}	
}

module.exports=User;