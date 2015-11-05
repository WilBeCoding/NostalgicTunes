var db = require('monk')('localhost/nostalgicTunes');
var SongsDB = db.get('songs');
var ObjectId = require('mongodb').ObjectId

var Songs = {
	findOne: function(song){
		return SongsDB.findOne({song: song})
	},
	findAll: function(song){
		return SongsDB.find({song:song})
	},
	insert: function(song, artist){
		console.log(arguments, '-------- SongsDB.insert argument'); //This hits but is weird as hell
		return SongsDB.insert({name:song, artist:artist})
	},
	findAllForPlaylist: function(playlist){
		function mongoFunction(array){
			var newArray = [];
		  for(var i = 0; i < array.length; i++){
		    newArray.push({_id: array[i]})
		  }
		  return newArray
		};
		// var playlistIdVariable = new ObjectId(playlistId);
		console.log(arguments,' =========== arguments in the FindAllForPlaylist song lib route')
		return SongsDB.find({$or: mongoFunction(playlist.songIds)})
	}
}

module.exports=Songs;