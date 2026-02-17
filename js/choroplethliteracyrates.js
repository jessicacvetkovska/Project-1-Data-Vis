class ChoroplethLiteracyRates {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 900,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || {top: 40, right: 10, bottom: 10, left: 10},
      tooltipPadding: 10,
      legendBottom: 20,
      legendLeft: 20,
      legendRectHeight: 12, 
      legendRectWidth: 150
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Title for the choropleth
    vis.chart.append("text")
      .attr("x", (vis.width / 2))
      .attr("y", 0 - (vis.config.margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("text-decoration", "underline")
      .text("Literacy Rates (Most Recent Year)");

    // Initialize projection and path generator
    vis.projection = d3.geoMercator();
    vis.geoPath = d3.geoPath().projection(vis.projection);

    vis.colorScale = d3.scaleLinear()
        .range(['#cfe2f2', '#0d306b'])
        .interpolate(d3.interpolateHcl);


    // Initialize gradient that we will later use for the legend
    vis.linearGradient = vis.svg.append('defs').append('linearGradient')
        .attr("id", "legend-gradient");

    // Append legend (bottom-left, slightly raised to avoid Antarctica overlap)
    vis.legend = vis.chart.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${vis.config.legendLeft},${vis.height - vis.config.legendBottom - 100})`);
    
    vis.legendRect = vis.legend.append('rect')
        .attr('width', vis.config.legendRectWidth)
        .attr('height', vis.config.legendRectHeight);

    vis.legendTitle = vis.legend.append('text')
        .attr('class', 'legend-title')
        .attr('dy', '.35em')
        .attr('y', -10)
        .text('Literacy Rate (%)')

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    const litrateDensityExtent = d3.extent(vis.data.features.filter(d => d.literacyrate != null), d => d.literacyrate);
    
    // Update color scale
    vis.colorScale.domain(litrateDensityExtent);

    // Define begin and end of the color gradient (legend)
    vis.legendStops = [
      { color: '#cfe2f2', value: litrateDensityExtent[0], offset: 0},
      { color: '#0d306b', value: litrateDensityExtent[1], offset: 100},
    ];

    vis.renderVis();
  }


  renderVis() {
    let vis = this;

    // Use GeoJSON directly (no TopoJSON conversion needed)
    const countries = vis.data;

    // Fit the projection to the entire world bounds
    vis.projection.fitSize([vis.width, vis.height], {
      type: "FeatureCollection",
      features: countries.features
    });

    // Append world map
    const countryPath = vis.chart.selectAll('.country')
        .data(countries.features)
      .join('path')
        .attr('class', 'country')
        .attr('d', vis.geoPath)
        .attr('fill', d => {
          if (d.literacyrate) {
            return vis.colorScale(d.literacyrate);
          } else {
            return '#e0e0e0';
          }
        });

    countryPath
        .on('mousemove', (event,d) => {
          const litRate = d.literacyrate ? `<strong>${d.literacyrate}%</strong> literacy rate` : 'No data available'; 
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-title">${d.properties.name}</div>
              <div>${litRate}</div>
              <div>Most Recent Year: ${d.literacyyear}</div>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });

    // Add legend labels
    vis.legend.selectAll('.legend-label')
        .data(vis.legendStops)
      .join('text')
        .attr('class', 'legend-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('y', 20)
        .attr('x', (d,index) => {
          return index == 0 ? 0 : vis.config.legendRectWidth;
        })
        .text(d => Math.round(d.value * 10 ) / 10);

    // Update gradient for legend
    vis.linearGradient.selectAll('stop')
        .data(vis.legendStops)
      .join('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);

    vis.legendRect.attr('fill', 'url(#legend-gradient)');
  }
}