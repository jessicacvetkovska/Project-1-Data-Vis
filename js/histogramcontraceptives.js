class HistogramContraceptives {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 400,
            containerHeight: _config.containerHeight || 100,
            margin: {top: 40, right: 50, bottom: 20, left: 50},
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

        // Initialize linear and ordinal scales (input domain and output range)
        vis.xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, vis.width]);
        
        const histogram = d3.histogram()
            .value(d => d.Prevalence)
            .domain(vis.xScale.domain())
            .thresholds(vis.xScale.ticks(10));
        
        const bins = histogram(vis.data);

        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length)])
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);


        // Draw the axis
        vis.xAxisGroup = vis.chart.append('g')
            .attr("transform", `translate(0, ${vis.height})`) 
            .call(vis.xAxis);

        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .call(vis.yAxis);
        
        vis.rect = vis.chart.selectAll('rect')
            .data(bins)
            .join("rect")
                .attr("x", d => vis.xScale(d.x0))
                .attr("y", d => vis.yScale(d.length))
                .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0))
                .attr("height", d => vis.height - vis.yScale(d.length))
                .style("fill", "#69b3a2");

        vis.updateVis(); //call updateVis() at the end - we aren't using this yet. 
    }


    updateVis() {
        let vis = this;

        // vis.rect
        //     .on('mouseover', (event,d) => {
        //         console.log("mouse over! ");
        //         console.log(event);
        //         console.log(d);
          
        //     d3.select('#tooltip')
        //         .style('display', 'block')
        //         .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
        //         .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        //         .html(`
        //             <div class="tooltip-title">List of Countries and Years</div>
        //             <ul>
        //                 <li>Countries: ${d.Entity}</li>
        //                 <li>Year: ${d.Year}</li>
        //             </ul>
        //         `);
        // })
        // .on('mouseleave', () => {
        //     d3.select('#tooltip').style('display', 'none');
        // });
    }

    renderVis() { 

    }
}