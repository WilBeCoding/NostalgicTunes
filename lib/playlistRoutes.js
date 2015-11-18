var db = require('./connection')
var PlaylistDB = db.get('playlist')
var ObjectId = require('mongodb').ObjectId

var Playlist = {
	findOne: function(playlistId){
		//console.log(arguments, '============= arguments in the Playlist findOne function');
		return PlaylistDB.findOne({_id: playlistId})
	},
	findAll: function(){
		return PlaylistDB.find({})
	},
	insert: function(playlist, recipientId, userId){
		//console.log(arguments); //This hits but is weird as hell
		return PlaylistDB.insert({playlist:playlist, recipientId: recipientId, userId: userId})
	},
	findForUser: function(userIdNum){
		var objectIdCreated = PlaylistDB.id(userIdNum)
		// var thisIsGoingToWork = new ObjectId(userIdNum);
		// console.log(userIdNum, 'the parameter of the findForUser function')
		return PlaylistDB.find({userId: objectIdCreated})
	},
	update: function(playlist, recipient){
		//console.log(arguments, ' ------=-=-=-=-=-=-=-======= arguments in the update function of the playlist lib file')
		return PlaylistDB.update({})
	},
	remove: function(playlistId){
		//console.log(arguments, '-----=-=-=-=-=-=-=-=-=--- arguments in the playlistRemove in lib file')
		return PlaylistDB.remove({playlistId: playlistId})
	},
	insertSong: function(playlistId, songId){
		//console.log(arguments, ' ========= arguments in the insertSong function in song lib file')
		return PlaylistDB.update({_id: playlistId},{$addToSet: {songIds:songId}})
	}
}

module.exports=Playlist;