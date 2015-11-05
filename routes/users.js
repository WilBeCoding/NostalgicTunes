var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/nostalgicTunes')
var bcrypt = require('bcrypt');
var PlaylistDB = require('../lib/playlistRoutes.js');
var User = require('../lib/usersRoutes.js');
var Recipient = require('../lib/recipientRoutes.js');
var SongsDB = require('../lib/songRoutes.js');


/* GET users listing. */
router.get('/user', function(req, res, next) {
  // req.session.user = req.body.user_email
  var user = req.session.user
  res.render('index', {user: user});
});

router.get('/register', function(req, res, next) {
  req.session.email = req.body.user_email
  res.render('users/register', {user: req.session.email})
})

router.post('/registration', function(req, res, next){
  req.session.email = req.body.user_email
  var errors = [];
  if(!req.body.user_email.trim()){
    errors.push("Email cannot be empty");
  }
  if(!req.body.user_email.match("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")) {
    errors.push("Email is invalid");
  }
  if(!req.body.user_password.trim()){
    errors.push("Password field cannot be empty");
  }
  if(req.body.user_password !== req.body.user_password_confirmation){
    errors.push("Passwords do not match");
  }
  User.findOne(req.body.user_email).then(function(user) {
    if(user) {
      errors.push("Email is already registered")
    }
    if(errors.length === 0) {
      var hash = bcrypt.hashSync(req.body.user_password, 11);
      User.insert(req.body.user_email, hash).then(function(user) {
        req.session.user = user
        user = req.session.user
      res.render('users/dashboard', {user:user})  
      })
    }else{
      res.render('users/register', {errors:errors})
    } 
  })
})

router.post('/login', function(req, res, next) {
  var errors = [];
  // req.session.user = req.body.user_email;
  if(!req.body.user_email.trim()){
    errors.push("Email cannot be empty");
  }
  if(!req.body.user_email.match("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")) {
    errors.push("Email is invalid");
  }
  if(!req.body.user_password.trim()){
    errors.push("Password field cannot be empty");
  }
  User.findOne(req.body.user_email).then(function(user) {
    var hash = bcrypt.hashSync(req.body.user_password, 11);
    if(!user) {
      errors.push("Email is not registered")
    }
    else if(!bcrypt.compareSync(req.body.user_password, hash)) {
      errors.push("Password is incorrect. Are you typing with your feet?")
    }
    if(errors.length === 0) {
      req.session.user = user
      user = req.session.user
      console.log(user, ' -----------------=-=-=-=-=- user in the login route');
      console.log(user._id, '------------- userID in the login route');
      res.render('users/dashboard', {user:user})
    }else{
      res.render('index', {errors:errors})
    }
  })
})

router.get('/logout', function(req,res,next) {
  req.session = null;
  res.redirect('index')
})

router.get('/dashboard', function(req,res,next) {
  console.log('dashboard get route is hitting');
  var user = req.session.user
  User.findOne(user.email).then(function(user){
  console.log(user, 'after the findOne method in the dashboard get route')
  res.render('users/dashboard', {user:user})    
  })
})

router.get('/playlistCreation', function(req, res, next) {
  var user = req.session.user
  console.log(user, ' ------- user in the playlist creation route')
  res.render('users/playlistCreation', {user:user})
})

router.post('/createPlaylist', function(req, res, next) {
  var user = req.session.user
  var userVariable;
  var playlistNameData;
  User.findOne(user.email)
    .then(function(currentUser) {
      // var userVariable = user
      console.log(req.body.playlist, ' req.body.playlist in the createplaylist post route')
      console.log(currentUser._id, '==========------ user after the user.findone in the createplaylist route')
      Recipient.insert(req.body.playlist_recipient, currentUser._id)
        .then(function(playlistRecipient){
          console.log(currentUser._id, ' ====== currentUser._id'); //Works properly
          console.log(req.body.playlist_name, 'playlist name'); //Works properly
          console.log(playlistRecipient._id, ' --------------- recip ID'); //Works properly
          PlaylistDB.insert(req.body.playlist_name, playlistRecipient._id, currentUser._id)
            .then(function(playlist){
            console.log(playlist, ' playlist under playlistDB.insert') //Doesn't hit
            console.log(playlistRecipient, '======= ---- playlistRecipient')
            console.log(currentUser, '------------ currentUser in the createPlaylist route')
            res.render('users/realaddasong', {user: currentUser, playlist:playlist,recipient:playlistRecipient})
        	})
      })
   })
})

// router.get('/playlist/:id', function(req, res, next) {
//   req.session.user = req.body.user_email;
//   user = req.session.user;
//   console.log(user + "  ---------------- user email in the /playlist/:id route");
//   var userData;
//   var playlistData;
//   User.findOne(userEmail)
//     .then(function(user){
//       userData = user;
//       return Playlists.findOne({_id: playlist.creatorId})
//     })
//     .then(function(playlist) {
//       console.log(arguments + " ------------ argument for playlist in the playlist/:id route")
//       var playlistData = playlist;
//       res.render('users/playlistShow', {user: userData, playlist: playlistData})
//    })
// })

router.get('/playlists/:id', function(req,res,next) {
  var user = req.session.user;
  console.log(user, '  -------- user above findOne in playlists/:id route');
  PlaylistDB.findForUser(user._id).then(function(userPlaylists){
    console.log(userPlaylists, '----=-=-=- UserPlaylists under playlistDB')
    res.render('users/viewplaylists', {user:user, userPlaylists:userPlaylists})
  })
})

router.get('/playlist/:id', function(req, res,next) {
  var user = req.session.user;
  console.log(user, ' ----- user within the playlist id get route');
  console.log(req.params.id, '--0-0-0-0-0-0===== req.params.id in the playlistID route')
  PlaylistDB.findOne(req.params.id).then(function(playlist){
	    console.log(playlist._id, ' -----=-=-=-=-=-=-=- playlistId in the playlist/:id route')
  	SongsDB.findAllForPlaylist(playlist).then(function(songs){
  		console.log(songs, '++++++++++++++ songs in the playlist id get route')
	    res.render('users/playlistEdit', {playlist: playlist, user:user, songs: songs})
  	})
  })
})

router.post('/addasong/:id', function(req, res, next){
	var user = req.session.user;
	// console.log('The add a song post route is hitting')
	PlaylistDB.findOne(req.params.id).then(function(playlist){
    // console.log(playlist, 'playlist after PlaylistDB.findOne in the addasong route')
		SongsDB.insert(req.body.song_name, req.body.artist_name).then(function(song){
      console.log(playlist, ' playlist under the SongsDB.insert method')
			console.log(song, '-----=-=-=-=--=-=- song after SongsDB.insert')
			PlaylistDB.insertSong(playlist._id, song._id).then(function(playlistForInsertSong){
        // console.log(playlist, ' ============= playlist after insertSong in this fucking addasong route')
        // console.log(req.params.id, '------- req.params.id in the addasong post route just above the findAllForPlaylist function')
        console.log(playlistForInsertSong, ' ------------- playlistForInsertSong after playlistDB.insertsong')
				SongsDB.findAllForPlaylist(playlist).then(function(songs){
        console.log(songs, '------- songs after the findAllforplaylist in the addasong post route')
				console.log(playlist, '--------------- playlist after SongsDB.findAllForPlaylist')
        // console.log(playlistTwo, '--------------- playlistIdVariable in the addlasong post route')
				res.render('users/playlistEdit', {playlist:playlist, songs:songs, user:user, playlistForInsertSong: playlistForInsertSong})
				})
			})
		})
	})
})

router.post('/editPlaylist', function(req,res,next){
  var user = req.session.user
  PlaylistDB.findOne(playlist).then(function(playlist){
    Recipients.findOne(recipient).then(function(recipient){
		    res.render('users/playlistEdit')
    })
  })
})

router.get('/realaddasong/:id', function(req, res, next) {
	var user = req.session.user
	console.log(user, '======================= user in the realaddasongroute');
  // console.log(playlist, '----------- playlist atop the realaddasong get route')
	console.log(req.params.id, ' -----=-=-=-=-= req.params.id in the realaddasong geet route')
	PlaylistDB.findOne(req.params.id).then(function(playlist){
		// console.log("this hits")
		console.log(playlist.recipientId, '------ Playlist.recipientId in the realaddsong route');
		Recipient.findOne(playlist.recipientId).then(function(recipient){
			console.log(recipient, ' ----- recipient in the realaddsong get route')
			res.render('users/realaddasong', {playlist:playlist, recipient:recipient, user:user})
		})
	})
})

router.get('/:id/delete', function(req, res, next) {
  PlaylistDB.remove({_id: req.params.id}, function(err, data) {
    res.redirect('/');
  })
})

router.get('/show', function(req,res,next){
  var playlist;
  PlaylistDB.findAll().then(function(playlists) {
    User.findAll().then(function(usersFound){
      Recipient.findAll().then(function(recipients){
      // console.log(usersFound, ' --------------- users within the recip.findall route');
      // console.log(user, ' ----------^-^_^_^_----- user in the recipients.findAll bullshit');
      // console.log(playlists, ' ----=-=-=-=-=---- Playlist within the recip.finall in the show route')
      console.log(recipients, ' ----------^-^_^_^_----- recipients in the recipients.findAll bullshit');
      res.render('users/show', {playlists: playlists, usersFound:usersFound, recipients:recipients})
      })
    })
  })
})

module.exports = router;
