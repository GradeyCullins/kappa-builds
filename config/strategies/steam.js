var passport = require('passport'),
	SteamStrategy = require('passport-steam').Strategy,
	config = require('../config'),
	users = require('../../app/controllers/users.server.controller');	

module.exports = function() {
	passport.use(new SteamStrategy({
			returnURL: config.steam.callbackURL,
		    realm: config.steam.realm,
		    apiKey: config.steam.clientSecret,
		    passReqToCallback: true
		}, 
		function(req, refreshToken, profile, done) {
			var providerData = profile._json;
			providerData.refreshToken = refreshToken;
			console.log(providerData);
			var names = providerData.realname.split(" ");
			var providerUserProfile = {
				firstName: names[0],
				lastName: names[1] ? names[1] : ' ',
				fullName: names[0], // not correct
				email: '',
				username: providerData.personaname,
				provider: 'steam',
				providerId: profile.id,
				providerData: {}
			};
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));
};