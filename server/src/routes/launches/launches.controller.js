const {
	getAllLaunches,
	scheduleNewLaunch,
	existsLaunchWithId,
	abortLaunchById,
} = require('../../models/launches.model');

const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
	const { skip, limit } = getPagination(req.query);
	const launches = await getAllLaunches(skip, limit);

	return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
	console.log('httpAddNewLaunch');
	const launch = req.body;

	if (
		!launch.mission ||
		!launch.rocket ||
		!launch.launchDate ||
		!launch.target
	) {
		return res.status(400).json({
			error: 'Missing required launch property',
		});
	}

	launch.launchDate = new Date(launch.launchDate);

	// if(isNan(launch.launchDate))
	if (launch.launchDate.toString() === 'Invalid Date') {
		return res.status(400).json({
			error: 'Invalid launch date',
		});
	}

	await scheduleNewLaunch(launch);
	return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
	const launchId = Number(req.params.id);
	const existsLaunch = await existsLaunchWithId(launchId);

	// if launch does not exist
	if (!existsLaunch) {
		return res.status(404).json({
			error: 'Launch not found',
		});
	}

	const aborted = await abortLaunchById(launchId);

	return !aborted
		? res.status(400).json({
				error: 'Launch not aborted',
		  })
		: res.status(200).json({
				ok: true,
		  });
	// if launch does exist
	// return res.status(200).json();
}

module.exports = {
	httpGetAllLaunches,
	httpAddNewLaunch,
	httpAbortLaunch,
};
