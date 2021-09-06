const axios = require('axios');

const launchesDB = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
	console.log('Downloading launch data...');

	const response = await axios.post(SPACEX_API_URL, {
		query: {},
		options: {
			pagination: false,
			populate: [
				{
					path: 'rocket',
					select: {
						name: 1,
					},
				},
				{
					path: 'payloads',
					select: {
						customers: 1,
					},
				},
			],
		},
	});

	if (response.status !== 200) {
		console.log('Problem donwloading launch data');
		throw new Error('Launch Data donwnload failed!');
	}

	const launchDocs = response.data.docs;
	for (const launchDoc of launchDocs) {
		const payloads = launchDoc['payloads'];
		const customers = payloads.flatMap((payload) => {
			return payload['customers'];
		});

		const launch = {
			flightNumber: launchDoc['flight_number'],
			mission: launchDoc['name'],
			rocket: launchDoc['rocket']['name'],
			launchDate: launchDoc['date_local'],
			upcoming: launchDoc['upcoming'],
			success: launchDoc['success'],
			customers,
		};

		console.log(`${launch.flightNumber} ${launch.mission} ${launch.customers}`);
		await saveLaunch(launch);
	}
}

// Check if DB is populated with this launch
async function loadLaunchData() {
	const firstLaunch = await findLaunch({
		flightNumber: 1,
		rocket: 'Falcon 1',
		mission: 'FalconSat',
	});

	if (firstLaunch) {
		console.log('launch data already loaded');
	} else {
		await populateLaunches();
	}
}

async function findLaunch(filter) {
	return await launchesDB.findOne(filter);
}

async function existsLaunchWithId(launchId) {
	return await findLaunch({
		flightNumber: launchId,
	});
}

async function getLatestFlightNumber() {
	const latestLaunch = await launchesDB.findOne().sort('-flightNumber');

	return !latestLaunch ? DEFAULT_FLIGHT_NUMBER : latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
	return await launchesDB
		.find({}, { __v: 0, _id: 0 })
		.sort({ flightNumber: 1 })
		.skip(skip)
		.limit(limit);
}

async function saveLaunch(launch) {
	// if flightNumber exist update else, insert
	await launchesDB.findOneAndUpdate(
		{
			flightNumber: launch.flightNumber,
		},
		launch,
		{
			upsert: true,
		}
	);
}

async function scheduleNewLaunch(launch) {
	const planet = await planets.findOne({
		keplerName: launch.target,
	});

	if (!planet) {
		throw new Error('No matching planet found.');
	}

	const newFlightNumber = (await getLatestFlightNumber()) + 1;

	const newLaunch = Object.assign(launch, {
		success: true,
		upcoming: true,
		customers: ['Zero To Mastery', 'NASA'],
		flightNumber: newFlightNumber,
	});

	await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
	const aborted = await launchesDB.updateOne(
		{
			flightNumber: launchId,
		},
		{
			upcoming: false,
			success: false,
		}
	);

	return aborted.acknowledged && aborted.modifiedCount === 1;
}

module.exports = {
	loadLaunchData,
	existsLaunchWithId,
	getAllLaunches,
	scheduleNewLaunch,
	abortLaunchById,
};

// using ths model files to act as the data acess layer that controls how data
// is read and updated will hding the the mongoose implementation details
// What is in our mongo.js file. If we ever switch DB we will swap the implementation
// of the model to use a  different data structure or db because our controllers only
// work witht the functions exported from this file. Our controllers or any other code
// or any of the code above this data access layer will have to change of how we set
// this up.
