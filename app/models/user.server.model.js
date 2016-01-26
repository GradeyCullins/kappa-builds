var mongoose = require('mongoose'),
	crypto = require('crypto'),
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
		match: [/.+\@.+\..+/, "Please enter a valid email address"]
	},
	role: {
		type: String,
		enum: ['Admin', 'Owner', 'User']
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerId: String,
	providerData: {},
	created: {
		type: Date,
		default: Date.now
	}
});

UserSchema.virtual('fullName').get(function() {
	return this.firstName + ' ' + this.lastName;
});

UserSchema.pre('save', function(next) {
	if (this.password) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}
	next();
});

UserSchema.methods.hashPassword = function(password) {
	return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');
	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

UserSchema.set('toJSON', { getters: true });

mongoose.model('User', UserSchema);