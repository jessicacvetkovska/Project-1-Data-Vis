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

    //process the data - this is a forEach function.  You could also do a regular for loop.... 
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

// contraceptive choropleth map
Promise.all([
	d3.json('data/world.geojson'),
	contraceptivePromise
]).then(data => {
	console.log('Contra choro data loaded!')
	const geoData = data[0];
	let countryData = data[1];
	countryData = countryData.filter(d => d.Code !== '' && d.Entity !== 'World').sort((a, b) => a.Code.localeCompare(b.Code)); // filter out entries without country code and world data, then sort by code
	console.log('CountryData: ', countryData);
	const latest = {};

	//process the data - this is a forEach function.  You could also do a regular for loop.... 
    countryData.forEach(d => { //ARROW function - for each object in the array, pass it as a parameter to this function
		d.Prevalence = +d.Prevalence; // convert string 'prevalence' to number
		const year = +d.Year;
		if (!latest[d.Entity] || year > latest[d.Entity].Year) {
			latest[d.Entity] = {...d, Year: year};
		}
  	});

	// Combine both datasets by adding the contraceptive data to the GeoJSON file
	geoData.features.forEach(feature => {
    	const countryMatch = countryData.find(d => d.Code === feature.id);
    	if (countryMatch) {
      		feature.contraceptiveprevalence = +countryMatch.Prevalence;
			feature.contraceptiveyear = +countryMatch.Year;
    	}
  	});

  	choroplethcontraceptives = new ChoroplethContraceptives({ 
    	parentElement: '#choroplethcontraceptives',
		containerHeight: 600,
		containerWidth: 900
  	}, geoData);
})
.catch(error => console.error('Error with contraceptive choropleth map:', error));


// litrate choropleth map
Promise.all([
	d3.json('data/world.geojson'),
	literacyPromise
]).then(data => {
	const geoData = data[0];
	let countryData = data[1];
	countryData = countryData.filter(d => d.Code !== '' && !d.Code.startsWith('OWID')).sort((a, b) => a.Code.localeCompare(b.Code)); // filter out entries without country code, world data, and OWID codes, then sort by code
	const latest = {};

	//process the data - this is a forEach function.  You could also do a regular for loop.... 
    countryData.forEach(d => { //ARROW function - for each object in the array, pass it as a parameter to this function
		d.LiteracyRate = +d.LiteracyRate; // convert string 'literacyrate' to number
		const year = +d.Year;
		if (!latest[d.Entity] || year > latest[d.Entity].Year) {
			latest[d.Entity] = {...d, Year: year};
		}
  	});

	// Combine both datasets by adding the contraceptive data to the GeoJSON file
	geoData.features.forEach(feature => {
    	const countryMatch = countryData.find(d => d.Code === feature.id);
    	if (countryMatch) {
      		feature.literacyrate = +countryMatch.LiteracyRate;
			feature.literacyyear = +countryMatch.Year;
    	}
  	});

  	choroplethliteracyrates = new ChoroplethLiteracyRates({ 
    	parentElement: '#choroplethliteracyrates',
		containerHeight: 600,
		containerWidth: 900
  	}, geoData);
})
.catch(error => console.error('Error with litrate choropleth map:', error));