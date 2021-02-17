/**
 * Constructor for the Year Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function YearChart(electoralVoteChart, tileChart, votePercentageChart, electionWinners) {
    var self = this;

    self.electoralVoteChart = electoralVoteChart;
    self.tileChart = tileChart;
    self.votePercentageChart = votePercentageChart;
    self.electionWinners = electionWinners;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
YearChart.prototype.init = function () {

    var self = this;
    self.margin = { top: 10, right: 20, bottom: 30, left: 50 };
    var divyearChart = d3.select("#year-chart").classed("fullView", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divyearChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 100;

    //creates svg element within the div
    self.svg = divyearChart.append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight)
    //Set radius for each circle in year chart

    self.circleRadius = 10;
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
YearChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R") {
        return "yearChart republican";
    }
    else if (party == "D") {
        return "yearChart democrat";
    }
    else if (party == "I") {
        return "yearChart independent";
    }
}


/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */
YearChart.prototype.update = function () {
    var self = this;
    var clicked = null;

    //Domain definition for global color scale
    var domain = [-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60];

    //Color range for global color scale
    var range = ["#0066CC", "#0080FF", "#3399FF", "#66B2FF", "#99ccff", "#CCE5FF", "#ffcccc", "#ff9999", "#ff6666", "#ff3333", "#FF0000", "#CC0000"];

    //Global colorScale to be used consistently by all the charts
    self.colorScale = d3.scaleQuantile()
        .domain(domain).range(range);

    self.electionWinners.forEach(function (d) {
        d.YEAR = +d.YEAR;
    });

    // ******* TODO: PART I *******

    // Create the chart by adding circle elements representing each election year
    //The circles should be colored based on the winning party for that year
    //HINT: Use the .yearChart class to style your circle elements
    //HINT: Use the chooseClass method to choose the color corresponding to the winning party.
    self.svg.append("line")
        .attr("x1", 0)
        .attr("y1", self.svgHeight / 2)
        .attr("x2", self.svgWidth)
        .attr("y2", self.svgHeight / 2)
        .attr("class", "lineChart");
    self.svg.selectAll("circle")
        .data(self.electionWinners)
        .enter()
        .append("circle")
        .attr("class", d => self.chooseClass(d.PARTY))
        .attr("cy", self.svgHeight / 2)
        .attr("cx", function (d, i) {
            circleWidth = self.svgWidth / self.electionWinners.length
            return ((i * circleWidth) + circleWidth / 2);
        })
        .attr("r", self.circleRadius)
        
    self.svg.selectAll("text")
        .data(self.electionWinners)
        .enter()
        .append("text")
        .text(d => d.YEAR)
        .attr("x", function (d, i) {
            circleWidth = self.svgWidth / self.electionWinners.length
            return ((i * circleWidth) + circleWidth / 2)
        })
        .attr("y", self.svgHeight * 0.75)
        .attr("text-anchor", "middle")
        .attr("class", "yearText");

    self.svg.selectAll("circle")
        .on("click",function(d,i){
            d3.select(".highlighted")
                .attr("class", d => self.chooseClass(d.PARTY));
            d3.select(this)
                .attr("class","highlighted");
            const dataPath = "data/election-results-" + i.YEAR +".csv";
            d3.csv(dataPath)
            .then(function(electionResult) {

                electionResult.forEach(function(state){
                    state.D_Percentage = +state.D_Percentage;
                    state.R_Percentage = +state.R_Percentage;
                    state.I_Percentage = +state.I_Percentage;
                    state.Total_EV = +state.Total_EV;
                    state.D_Votes = +state.D_Votes;
                    state.R_Votes = +state.R_Votes;
                    state.I_Votes = +state.I_Votes;
                })
                democraticStates = electionResult.filter(state => {
                    return (state.D_Votes > state.R_Votes && state.D_Votes > state.I_Votes)
                }).map(function (state) {
                    let percentages = [state.D_Percentage, state.R_Percentage, state.I_Percentage];
                    percentages.sort(function (a, b) { return (b - a) });
                    state.mov = -1 * (percentages[0] - percentages[1]);
                    state.winner = "D";
                    return state;
                }).sort(function (a, b) { return a.mov - b.mov });
                republicanStates = electionResult.filter(state => {
                    return (state.R_Votes> state.D_Votes && state.R_Votes > state.I_Votes)
                }).map(function (state) {
                    let percentages = [state.D_Percentage, state.R_Percentage, state.I_Percentage];
                    percentages.sort(function (a, b) { return (b - a) });
                    state.mov = percentages[0] - percentages[1];
                    state.winner = "R";
                    return state;
                }).sort(function (a, b) { return a.mov - b.mov });;
                independentStates = electionResult.filter(state => {
                    return (state.I_Votes > state.R_Votes && state.I_Votes > state.D_Votes)
                }).map(function (state) {
                    let percentages = [state.D_Percentage, state.R_Percentage, state.I_Percentage];
                    percentages.sort(function (a, b) { return (b - a) });
                    state.mov = percentages[0] - percentages[1];
                    state.winner = "I";
                    return state;
                });
            
            
                let allStates = independentStates.concat(democraticStates, republicanStates);
                // console.log(electionResults);
                self.electoralVoteChart.update(allStates,self.colorScale);
                self.votePercentageChart.update(allStates);
                self.tileChart.update(allStates,self.colorScale);
            });
        });

    //Append text information of each year right below the corresponding circle
    //HINT: Use .yeartext class to style your text elements

    //Style the chart by adding a dashed line that connects all these years.
    //HINT: Use .lineChart to style this dashed line

    //Clicking on any specific year should highlight that circle and  update the rest of the visualizations
    //HINT: Use .highlighted class to style the highlighted circle

    //Election information corresponding to that year should be loaded and passed to
    // the update methods of other visualizations


    //******* TODO: EXTRA CREDIT *******

    //Implement brush on the year chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of brushSelection and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.
};
