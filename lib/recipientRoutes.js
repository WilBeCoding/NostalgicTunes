var db = require('monk')('localhost/nostalgicTunes')
var Recipients = db.get('recipients')

var Recipient = {

	findOne: function(recipientId) {
        console.log(arguments, ' =====-=-=-=-=----- arguments in the recipient FINDOne function')
		return Recipients.findOne({_id: recipientId})
	},
	findAll: function() {
		return Recipients.find({})
	},
	insert: function(recipients, userId) {
		return Recipients.insert({ name: recipients, userId: userId})
	}
}

module.exports=Recipient;