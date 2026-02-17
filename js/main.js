console.log("Hello world");
let data_contraceptive, data_literacyrate;

// for the contraceptive histogram
const contraceptivePromise = d3.csv('data/contraceptiveprevalence.csv')
  .then(_data => {
  	console.log('Data loading of contraceptive prevalence complete. Work with dataset.');
  	data_contraceptive = _data;
    console.log(data_contraceptive);
	const latest = {};

    // //process the data - this is a forEach function.  You could also do a regular for loop.... 
    data_contraceptive.forEach(d => { //ARROW function - for each object in the array, pass it as a parameter to this function
		d.Prevalence = +d.Prevalence; // convert string 'prevalence' to number
		const year = +d.Year;
		if (!latest[d.Entity] || year > latest[d.Entity].Year) {
			latest[d.Entity] = {...d, Year: year};
		}
  	});
	const contraceptiveFilteredData = Object.values(latest);
	console.log(contraceptiveFilteredData);

  	// Create an instance (for example in main.js)
	histogramcontraceptives = new HistogramContraceptives({
		'parentElement': '#histogramcontraceptives',
		'containerHeight': 500,
		'containerWidth': 500
	}, contraceptiveFilteredData);

	return contraceptiveFilteredData;
})
.catch(error => {
    console.error('Error:');
    console.log(error);
});

// for the literacy rates histogram
const literacyPromise = d3.csv('data/literacyrates.csv')
  .then(_data => {
  	console.log('Data loading of literacy rates complete. Work with dataset.');
  	data_literacyrate = _data;
    console.log(data_literacyrate);
	const latest = {};

    // //process the data - this is a forEach function.  You could also do a regular for loop.... 
    data_literacyrate.forEach(d => { //ARROW function - for each object in the array, pass it as a parameter to this function
		d.LiteracyRate = +d.LiteracyRate; // convert string 'literacyrate' to number
		const year = +d.Year;
		if (!latest[d.Entity] || year > latest[d.Entity].Year) {
			latest[d.Entity] = {...d, Year: year};
		}
  	});
	const litrateFilteredData = Object.values(latest);
	console.log(litrateFilteredData);

  	// Create an instance (for example in main.js)
	histogramliteracyrates = new HistogramLiteracyRates({
		'parentElement': '#histogramliteracyrates',
		'containerHeight': 500,
		'containerWidth': 500
	}, litrateFilteredData);

	return litrateFilteredData;
})
.catch(error => {
    console.error('Error:');
    console.log(error);
});

// for the scatterplot
Promise.all([contraceptivePromise, literacyPromise])
  .then(([contraceptiveFilteredData, litrateFilteredData]) => {
    // Combine datasets for scatterplot
    const combinedData = contraceptiveFilteredData.map(d => {
      const literacyMatch = litrateFilteredData.find(lit => lit.Entity === d.Entity);
      if (literacyMatch) {
        return {
          Entity: d.Entity,
          contraceptiveX: d.Prevalence,
          litrateY: literacyMatch.LiteracyRate
        };
      }
    }).filter(d => d !== undefined);

    console.log('Combined data for scatterplot:', combinedData);

    scatterplot = new Scatterplot({
      'parentElement': '#scatterplot',
      'containerHeight': 500,
      'containerWidth': 500
    }, combinedData);

	return contraceptiveFilteredData, litrateFilteredData;
  })
  .catch(error => {
    console.error('Error combining datasets:', error);
  });

Promise.all([
	d3.json('data/world.geojson'),
	contraceptivePromise
]).then(data => {
	const geoData = data[0];
	const countryData = contraceptiveFilteredData;

	// Combine both datasets by adding the contraceptive data to the GeoJSON file
	geoData.objects.collection.geometries.forEach(d => {
    	for (let i = 0; i < countryData.length; i++) {
      		if (d.properties.id == countryData[i].Code) {
        		d.properties.contraceptiveprevalence = +countryData[i].Prevalence;
      		}
    	}
  	});

  	const contraceptiveChoroplethMap = new contraceptiveChoroplethMap({ 
    	parentElement: '#map'
  	}, geoData);
})
.catch(error => console.error('Error with contraceptive choropleth map:', error));

Promise.all([
	d3.json('data/world.geojson'),
	literacyPromise
]).then(data => {
	const geoData = data[0];
	const countryData = litrateFilteredData;

	// Combine both datasets by adding the population density to the TopoJSON file
	geoData.objects.collection.geometries.forEach(d => {
    	for (let i = 0; i < countryData.length; i++) {
      		if (d.properties.id == countryData[i].code) {
        		d.properties.literacyrate = +countryData[i].LiteracyRate;
      		}
    	}
  	});

  	const litrateChoroplethMap = new litrateChoroplethMap({ 
    	parentElement: '#map'
  	}, geoData);
})
.catch(error => console.error('Error with litrate choropleth map:', error));