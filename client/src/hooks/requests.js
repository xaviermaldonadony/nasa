const API_URL = 'v1';

// Load planets and return as JSON.
async function httpGetPlanets() {
	// TODO: Once API is ready.
	const response = await fetch(`${API_URL}/planets`);
	// json also returns a promise
	return await response.json();
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
	const response = await fetch(`${API_URL}/launches`);
	const fetchedLaunches = await response.json();
	return fetchedLaunches.sort((a, b) => {
		// if b is greater than a = negative result
		// ascending by flight number
		return a.flightNumber - b.flightNumber;
	});
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
	try {
		return await fetch(`${API_URL}/launches`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(launch),
		});
	} catch (err) {
		return {
			ok: false,
		};
	}
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
	try {
		return await fetch(`${API_URL}/launches/${id}`, {
			method: 'DELETE',
		});
	} catch (err) {
		return {
			ok: false,
		};
	}
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
