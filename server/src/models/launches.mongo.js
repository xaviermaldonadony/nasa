const mongoose = require('mongoose');

const launchesSchema = new mongoose.Schema({
	flightNumber: {
		type: Number,
		required: true,
	},

	launchDate: {
		type: Date,
		required: true,
	},

	mission: {
		type: String,
		require: true,
	},

	rocket: {
		type: String,
		required: true,
	},

	target: {
		type: String,
	},

	customers: [String],

	upcoming: {
		type: Boolean,
		require: true,
	},

	success: {
		type: Boolean,
		require: true,
		default: true,
	},
});

module.exports = mongoose.model('Launche', launchesSchema);
