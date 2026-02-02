console.log("Hello world");
let data_contraceptive, data_literacyrate;

d3.csv('data/contraceptiveprevalence.csv')
  .then(_data => {
  	console.log('Data loading of contraceptive prevalence complete. Work with dataset.');
  	data_contraceptive = _data;
    console.log(data_contraceptive);

    // //process the data - this is a forEach function.  You could also do a regular for loop.... 
    data_contraceptive.forEach(d => { //ARROW function - for each object in the array, pass it as a parameter to this function
      	d.prevalence = +d.prevalence; // convert string 'prevalence' to number
    //   	d.daysFromYrStart = computeDays(d.start); //note- I just created this field in each object in the array on the fly

	// 			let tokens = d.start.split("-");
  	// 		d.year = +tokens[0];

  	});

  	// // Create an instance (for example in main.js)
	// 	timelineCircles = new TimelineCircles({
	// 		'parentElement': '#timeline',
	// 		'containerHeight': 1100,
	// 		'containerWidth': 1000
	// 	}, data);
})
.catch(error => {
    console.error('Error:');
    console.log(error);
});

d3.csv('data/literacyrates.csv')
  .then(_data => {
  	console.log('Data loading of literacy rates complete. Work with dataset.');
  	data_literacyrate = _data;
    console.log(data_literacyrate);

    // //process the data - this is a forEach function.  You could also do a regular for loop.... 
    data_literacyrate.forEach(d => { //ARROW function - for each object in the array, pass it as a parameter to this function
      	d.literacyrate = +d.literacyrate; // convert string 'literacyrate' to number
    //   	d.daysFromYrStart = computeDays(d.start); //note- I just created this field in each object in the array on the fly

	// 			let tokens = d.start.split("-");
  	// 		d.year = +tokens[0];

  	});

  	// // Create an instance (for example in main.js)
	// 	timelineCircles = new TimelineCircles({
	// 		'parentElement': '#timeline',
	// 		'containerHeight': 1100,
	// 		'containerWidth': 1000
	// 	}, data);
})
.catch(error => {
    console.error('Error:');
    console.log(error);
});