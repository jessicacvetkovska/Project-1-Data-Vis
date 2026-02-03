class Scatterplot {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 400,
            containerHeight: _config.containerHeight || 100,
            margin: {top: 40, right: 50, bottom: 50, left: 50},
            tooltipPadding: _config.tooltipPadding || 15
        }
        this.data = _data; 
        this.initVis();
    }

    initVis() {
        //setting up the chart- things that won't need to update on user actions
        console.log("Let's draw a chart!!");

        let vis = this; 
    
        // Width and height as the inner dimensions of the chart area- as before
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define 'svg' as a child-element (g) from the drawing area and include spaces
        // Add <svg> element (drawing space)
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);
        
        vis.chart.append("text")
            .attr("x", (vis.width / 2)) // Position the text in the middle horizontally
            .attr("y", 0 - (vis.config.margin.top / 2)) // Position it above the top margin
            .attr("text-anchor", "middle") // Ensure the text is centered at the specified x,y
            .style("font-size", "16px") // Set styling as needed
            .style("text-decoration", "underline") // Add text decoration
            .text("Percent of Contraceptive Prevalence in Women vs Literacy Rate"); // Set the actual text of the title

        // Initialize linear and ordinal scales (input domain and output range)
        vis.xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(10);
        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(10);

        // Draw the axis
        vis.xAxisGroup = vis.chart.append('g')
            .attr("transform", `translate(0, ${vis.height})`) 
            .call(vis.xAxis);

        vis.yAxisGroup = vis.chart.append('g')
            .attr("transform", `translate(0, 0)`) 
            .call(vis.yAxis);
        
        // Add X axis label:
        vis.chart.append("text")
            .attr("text-anchor", "middle")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.config.margin.bottom / 2 + 15)
            .text("Frequency of Contraceptive Prevalence (%)");

        // Y axis label:
        vis.chart.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", -vis.config.margin.left + 15)
            .attr("x", -(vis.height / 2))
            .text("Literacy Rate (%)");
        
        vis.circles = vis.chart.selectAll('circle')
            .data(vis.data)
            .join("circle")
                .attr("cx", d => vis.xScale(d.contraceptiveX))
                .attr("cy", d => vis.yScale(d.litrateY))
                .attr("r", 5)
                .attr("height", 10)
                .style("fill", "#69b3a2");

        vis.updateVis(); //call updateVis() at the end - we aren't using this yet. 
    }


    updateVis() {
        let vis = this;

        vis.circles
            .on('mouseover', (event,d) => {
                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .html(`
                        <div class="tooltip-title">${d.Entity}</div>
                        <ul>
                            <li>Contraceptive Prevalence: ${d.contraceptiveX}%</li>
                            <li>Literacy Rate: ${d.litrateY}%</li>
                        </ul>
                    `);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });
    }

    renderVis() { 

    }
}