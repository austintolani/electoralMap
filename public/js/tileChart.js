/**
 * Constructor for the TileChart
 */
function TileChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required to lay the tiles
 * and to populate the legend.
 */
TileChart.prototype.init = function(){
    var self = this;

    //Gets access to the div element created for this chart and legend element from HTML
    var divTileChart = d3.select("#tiles").classed("content", true);
    var legend = d3.select("#legend").classed("content",true);
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    var svgBounds = divTileChart.node().getBoundingClientRect();
    self.svgWidth = svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = self.svgWidth/2;
    var legendHeight = 150;

    //creates svg elements within the div
    self.legendSvg = legend.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",legendHeight)
        // .attr("transform", "translate(" + self.margin.left + ",0)")

    self.svg = divTileChart.append("svg")
                        .attr("width",self.svgWidth)
                        .attr("height",self.svgHeight)
                        // .attr("transform", "translate(" + self.margin.left + ",0)")
                        .style("bgcolor","green")

};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
TileChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party== "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip.
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for tool tip
 */
TileChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<h2 class ="  + self.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
    text +=  "Electoral Votes: " + tooltip_data.electoralVotes;
    text += "<ul>"
    tooltip_data.result.forEach(function(row){
        if (row.votecount < 1){
            return;
        }
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });
    text += "</ul>";
    return text;
}

/**
 * Creates tiles and tool tip for each state, legend for encoding the color scale information.
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
TileChart.prototype.update = function(electionResult, colorScale){
    var self = this;
    var stateGridPositions = {
        "AK": {"row":0,"column":0},
        "ME": {"row":0,"column":11},
        "VT": {"row":1,"column":10},
        "NH": {"row":1,"column":11},
        "WA": {"row":2,"column":1},
        "ID": {"row":2,"column":2},
        "MT": {"row":2,"column":3},
        "ND": {"row":2,"column":4},
        "MN": {"row":2,"column":5},
        "IL": {"row":2,"column":6},
        "WI": {"row":2,"column":7},
        "MI": {"row":2,"column":8},
        "NY": {"row":2,"column":9},
        "RI": {"row":2,"column":10},
        "MA": {"row":2,"column":11},
        "OR": {"row":3,"column":1},
        "NV": {"row":3,"column":2},
        "WY": {"row":3,"column":3},
        "SD": {"row":3,"column":4},
        "IA": {"row":3,"column":5},
        "IN": {"row":3,"column":6},
        "OH": {"row":3,"column":7},
        "PA": {"row":3,"column":8},
        "NJ": {"row":3,"column":9},
        "CT": {"row":3,"column":10},
        "CA": {"row":4,"column":1},
        "UT": {"row":4,"column":2},
        "CO": {"row":4,"column":3},
        "NE": {"row":4,"column":4},
        "MO": {"row":4,"column":5},
        "KY": {"row":4,"column":6},
        "WV": {"row":4,"column":7},
        "VA": {"row":4,"column":8},
        "MD": {"row":4,"column":9},
        "DC": {"row":4,"column":10},
        "AZ": {"row":5,"column":2},
        "NM": {"row":5,"column":3},
        "KS": {"row":5,"column":4},
        "AR": {"row":5,"column":5},
        "TN": {"row":5,"column":6},
        "NC": {"row":5,"column":7},
        "SC": {"row":5,"column":8},
        "DE": {"row":5,"column":9},
        "OK": {"row":6,"column":4},
        "LA": {"row":6,"column":5},
        "MS": {"row":6,"column":6},
        "AL": {"row":6,"column":7},
        "GA": {"row":6,"column":8},
        "HI": {"row":7,"column":1},
        "TX": {"row":7,"column":4},
        "FL": {"row":7,"column":9}

    }

    electionResult.forEach(function(elem){
        elem.Space = stateGridPositions[elem.Abbreviation].column;
        elem.Row = stateGridPositions[elem.Abbreviation].row;
    })

    //Calculates the maximum number of columns to be laid out on the svg
    self.maxColumns = d3.max(electionResult,function(d){
                                return parseInt(d["Space"]);
                            });

    //Calculates the maximum number of rows to be laid out on the svg
    self.maxRows = d3.max(electionResult,function(d){
                                return parseInt(d["Row"]);
                        });
    
    let rectWidth = self.svgWidth/(self.maxColumns+1);
    let rectHeight = self.svgHeight/(self.maxRows+1);
    let vertDistToCenter = rectHeight/2;
    let horizDistToCenter = rectWidth/2;
    console.log(self.svgWidth,self.svgHeight);
    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('se')
        .offset(function() {
            return [0,0];
        })
        .html(function(data) {
            /* populate data in the following format
             * tooltip_data = {
             * "state": State,
             * "winner":d.State_Winner
             * "electoralVotes" : Total_EV
             * "result":[
             * {"nominee": D_Nominee_prop,"votecount": D_Votes,"percentage": D_Percentage,"party":"D"} ,
             * {"nominee": R_Nominee_prop,"votecount": R_Votes,"percentage": R_Percentage,"party":"R"} ,
             * {"nominee": I_Nominee_prop,"votecount": I_Votes,"percentage": I_Percentage,"party":"I"}
             * ]
             * }
             * pass this as an argument to the tooltip_render function then,
             * return the HTML content returned from that method.
             * */

            let d = data.srcElement.__data__;
            tooltip_data = {
            "state": d.State,
            "winner":d.winner,
            "electoralVotes" : d.Total_EV,
            "result":[
            {"nominee": d.D_Nominee,"votecount": d.D_Votes,"percentage": d.D_Percentage,"party":"D"} ,
            {"nominee": d.R_Nominee,"votecount": d.R_Votes,"percentage": d.R_Percentage,"party":"R"} ,
            {"nominee": d.I_Nominee,"votecount": d.I_Votes,"percentage": d.I_Percentage,"party":"I"}
            ]
            }
            return self.tooltip_render(tooltip_data);
        });
    self.svg.call(tip);
    //Creates a legend element and assigns a scale that needs to be visualized
    self.legendSvg.append("g")
        .attr("class", "legendQuantile")
        .attr("transform", "translate("+self.svgWidth/15+",0)");

    var legendQuantile = d3.legendColor()
        .shapeWidth(self.svgWidth/14)
        .cells(10)
        .orient('horizontal')
        .scale(colorScale);
    self.legendSvg.select(".legendQuantile")
        .call(legendQuantile);

    // ******* TODO: PART IV *******
    //Tansform the legend element to appear in the center and make a call to this element for it to display.
    //Lay rectangles corresponding to each state according to the 'row' and 'column' information in the data.
        // Join Data
    var rects = self.svg.selectAll("rects")
        .data(electionResult);

    // Updates
    rects
        .attr("fill", function (d) {
            if (d.winner === "I") {
                return ("#32a852");
            }
            else {
                return colorScale(d.mov);
            }

        })
        .attr("class","tile");
    // Creation
    rects.enter()
        .append("rect")
        .attr("height", rectHeight)
        .attr("width", rectWidth)
        .attr("y", function (d) {
            return d.Row*rectHeight;
        })
        .attr("x", function (d) {
            return d.Space*rectWidth;
        })
        .attr("fill", function (d) {
            if (d.winner === "I") {
                return ("#32a852");
            }
            else {
                return colorScale(d.mov);
            }

        })
        .attr("class","tile")
        .attr("id",function(d){
            return d.Abbreviation;
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
    
    var labels = self.svg.selectAll("g")
        .data(electionResult);
    
    labels.raise();
    labels
        .select(".EV")
        .text(function(d){return d.Total_EV}).raise();
        

    
    var enteringGroups = labels.enter().append("g");

    enteringGroups
        .append("text")
        .attr("y", function (d) {
            return d.Row*rectHeight + vertDistToCenter +10;
        })
        .attr("x", function (d) {
            return d.Space*rectWidth + horizDistToCenter;
        })
        .attr("class", "tilestext EV")
        .attr("id",function(d){
            return d.Abbreviation;
        })
        .attr("text-anchor","start")
        .text(function(d){return d.Total_EV});
    enteringGroups
        .append("text")
        .attr("y", function (d) {
            return d.Row*rectHeight + vertDistToCenter -5;
        })
        .attr("x", function (d) {
            return d.Space*rectWidth + horizDistToCenter;
        })
        .attr("class", "tilestext")
        .attr("id",function(d){
            return d.Abbreviation;
        })
        .attr("text-anchor","start")
        .text(function(d){return d.Abbreviation});
    //Display the state abbreviation and number of electoral votes on each of these rectangles

    //Use global color scale to color code the tiles.

    //HINT: Use .tile class to style your tiles;
    // .tilestext to style the text corresponding to tiles

    //Call the tool tip on hover over the tiles to display stateName, count of electoral votes
    //then, vote percentage and number of votes won by each party.
    //HINT: Use the .republican, .democrat and .independent classes to style your elements.
};
