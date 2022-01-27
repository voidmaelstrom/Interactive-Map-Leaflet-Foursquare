// Define map and components used
const myMap = {
	businesses: [],
	coordinates: [],
	map: {},
	markers: {},

	buildMap() {
		this.map = L.map('map', {
		center: this.coordinates,
		zoom: 1,
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		minZoom: '15',
		}).addTo(this.map)

		const marker = L.marker(this.coordinates)
		marker
		.addTo(this.map)
		.bindPopup('<p1><b>You are here</b><br></p1>')
		.openPopup()
	},

	setMarkers(markerIcon) {
		for (let i = 0; i < this.businesses.length; i++) {
		this.markers = L.marker([
			this.businesses[i].lat,
			this.businesses[i].long,
		], {icon: markerIcon})
			.bindPopup(`<p1>${this.businesses[i].name}</p1>`)
			.addTo(this.map)
		}
	},
}

window.onload = async () => {
	const coordinates = await returnCoordinates()
	myMap.coordinates = coordinates
	myMap.buildMap()
}

// Return user coordinates for home location
async function returnCoordinates(){
	const position = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject)
	});
	return [position.coords.latitude, position.coords.longitude]
}

// Get businesses and locations mapped
function returnBusinesses(fourSquareReturn) {
	let businesses = fourSquareReturn.map((element) => {
		let location = {
			name: element.name,
			lat: element.geocodes.main.latitude,
			long: element.geocodes.main.longitude
		};
		return location
	})
	return businesses
}

// Send request to FourSquare for business type
async function fourSquareGet(business) {
	const request = {
		method: 'GET',
		headers: {
		Accept: 'application/json',
		Authorization: 'fsq3p60ekPc56wWrUPsLY6IljEiEMfJx/MbI2iBfILGDGcQ='
		}
	}
	let numBusinesses = 5
	let lat = myMap.coordinates[0]
	let lon = myMap.coordinates[1]
	let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${numBusinesses}&ll=${lat}%2C${lon}`, request)
	let data = await response.text()
	let parsedData = JSON.parse(data)
	let businesses = parsedData.results
	return businesses
}

// Set marker by color based on which place of business is selected
document.getElementById('submit').addEventListener('click', async (e) => {
	e.preventDefault()
	let marker = {}
	let placeOfbusiness = document.getElementById('business').value
	let fourSquareReturn = await fourSquareGet(placeOfbusiness)
	myMap.businesses = returnBusinesses(fourSquareReturn)
	switch(placeOfbusiness) {
		case 'coffee':
			marker = L.AwesomeMarkers.icon({
				markerColor: 'orange'
			});
			myMap.setMarkers(marker);
			break;
		case 'hotel':
			marker = L.AwesomeMarkers.icon({
				markerColor: 'red'
			});
			myMap.setMarkers(marker);
			break;
		case 'market':
			marker = L.AwesomeMarkers.icon({
				markerColor: 'blue'
			});
			myMap.setMarkers(marker);
			break;
		case 'restaurant':
			marker = L.AwesomeMarkers.icon({
				markerColor: 'green'
			});
			myMap.setMarkers(marker);
			break;
		default:
	}
})