var newArray = []
var PlaylistsongIds = playlist.songIds

function mongoFunction(array){
  var fantasticNewArray = array
  for(var i = 0; i < 6; i++){
    fantasticNewArray.push({_id: array[i]})
  }
  return fantasticNewArray
};

console.log(mongoFunction(playlistSongIds));
