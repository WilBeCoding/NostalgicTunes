var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/nostalgicTunes')
var bcrypt = require('bcrypt');
var PlaylistDB = require('../lib/playlistRoutes.js');
var User = require('../lib/usersRoutes.js');
var Recipient = require('../lib/recipientRoutes.js');
var SongsDB = require('../lib/songRoutes.js');
var testPlaylist = db.get('playlist');

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
  console.log('The route hits');
  // req.session.email = req.body.user_email
  req.session.user = req.body.user_email;
  user = req.session.user;
  var errors = [];
  if(!req.body.user_email.trim()){
    errors.push("Email cannot be empty");
    console.log('hits first if statement')
  }
  if(!req.body.user_email.match("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")) {
    errors.push("Email is invalid");
        console.log('hits second if statement')

  }
  if(!req.body.user_password.trim()){
    errors.push("Password field cannot be empty");
    console.log('hits third if statement')

  }
  if(req.body.user_password !== req.body.user_password_confirmation){
    errors.push("Passwords do not match");
    console.log('hits fourth if statement')

  }
  User.findOne(req.body.user_email).then(function(user) {
    if(user) {
      errors.push("Email is already registered")
      console.log('hits fifth if statement')
    }
    if(errors.length === 0) {
      console.log('hits length of errors === 0 if statement')

      var hash = bcrypt.hashSync(req.body.user_password, 11);
      User.insert(req.body.user_email, hash).then(function(user) {
        req.session.user = user
        user = req.session.user
      res.render('users/dashboard', {user:user})  
      })
    }else{
      console.log('Hits else statement')
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
      console.log('No errors detected', ' ================== ')
      req.session.user = user
      user = req.session.user
      res.render('users/dashboard', {user:user})
    }else{
      res.render('index', {errors:errors , title: 'Nostalgic Tunes'})
    }
  })
})

router.get('/logout', function(req,res,next) {
  req.session = null;
  res.redirect('index')
})

router.get('/dashboard', function(req,res,next) {
  var user = req.session.user
  User.findOne(user.email).then(function(user){
  res.render('users/dashboard', {user:user})    
  })
})

router.get('/playlistCreation', function(req, res, next) {
  var user = req.session.user
  res.render('users/playlistCreation', {user:user})
})

router.post('/createPlaylist', function(req, res, next) {
  var user = req.session.user
  var userVariable;
  var playlistNameData;
  // console.log(user.email, ' 0000')
  User.findOne(user.email)
    .then(function(currentUser) {
      Recipient.insert(req.body.playlist_recipient, currentUser._id)
        .then(function(playlistRecipient){
          PlaylistDB.insert(req.body.playlist_name, playlistRecipient._id, currentUser._id)
            .then(function(playlist){
            res.render('users/realaddasong', {user: currentUser, playlist:playlist,recipient:playlistRecipient})
        	})
      })
   })
})

router.get('/playlists/:id', function(req,res,next) {
  var user = req.session.user;  
  PlaylistDB.findForUser(user._id).then(function(userPlaylists){
    res.render('users/viewplaylists', {user:user, userPlaylists:userPlaylists})
  })
})

router.get('/playlist/:id', function(req, res,next) {
  var user = req.session.user;
  PlaylistDB.findOne(req.params.id).then(function(playlist){
  	SongsDB.findAllForPlaylist(playlist).then(function(songs){
      Recipient.findOne(playlist.recipientId).then(function(recipient){
        res.render('users/playlistEdit', {playlist: playlist, user:user, songs: songs, recipient: recipient})
      })
    })
  })
})

router.post('/addasong/:id', function(req, res, next){
	var user = req.session.user;
	PlaylistDB.findOne(req.params.id).then(function(playlist){
		SongsDB.insert(req.body.song_name, req.body.artist_name).then(function(song){
      console.log(song, ' song in playlist')
			PlaylistDB.insertSong(playlist._id, song._id).then(function(playlistForInsertSong){
				SongsDB.findAllForPlaylist(playlist).then(function(songs){
          Recipient.findOne(playlist.recipientId).then(function(recipient){
            console.log(songs, ' songs in the add a song route')
  				  res.render('users/playlistEdit', {playlist:playlist, songs:songs, user:user, playlistForInsertSong: playlistForInsertSong, recipient:recipient, song:song})
          })
				})
			})
		})
	})
})

router.post('/editPlaylist', function(req,res,next){
  var user = req.session.user
  PlaylistDB.findOne(playlist).then(function(playlist){
    Recipient.findOne(recipient).then(function(recipient){
		    res.render('users/playlistEdit')
    })
  })
})

router.get('/realaddasong/:id', function(req, res, next) {
	var user = req.session.user
	PlaylistDB.findOne(req.params.id).then(function(playlist){
		Recipient.findOne(playlist.recipientId).then(function(recipient){
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
      res.render('users/show', {playlists: playlists, usersFound:usersFound, recipients:recipients})
      })
    })
  })
})

module.exports = router;
