var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var UserSchema = new Schema({
	firstName: String,
	lastName: String,
	username: {
		type: String,
		trim: true,
		unique: true,
		required: true
	},
	password: {
		type: String,
		validate: {
			validator: function(password) {
		        return password.length >= 2;
		    },
		    message: 'Password must be at least 2 characters'
		}
	},
	email: {
		type: String,
		index: true,
		match: /.+\@.+\..+/
	},
	role: {
		type: String,
		enum: ['Admin', 'Owner', 'User']
	},
	website: {
		type: String,
		get: function(url) { // should there be a 'set' here too?
			if (!url) {
				return url;
			} else {
				if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
					url = 'http://' + url;
				}
				return url;
			}
		}
	},
	created: {
		type: Date,
		default: Date.now
	}
});

UserSchema.virtual('fullName').get(function() {
	return this.firstName + ' ' + this.lastName;
});

UserSchema.set('toJSON', { getters: true });

mongoose.model('User', UserSchema);