
/**
 * Constructor for the Vote Percentage Chart
 */
function VotePercentageChart() {

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
VotePercentageChart.prototype.init = function () {
    var self = this;
    self.margin = { top: 30, right: 20, bottom: 30, left: 50 };
    var divvotesPercentage = d3.select("#votes-percentage").classed("content", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divvotesPercentage.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 200;

    //creates svg element within the div
    self.svg = divvotesPercentage.append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight);

    self.middleBar = self.svg.append("rect")
        .attr("id", "middleBar");

    self.middleText = self.svg.append("text")
        .attr("id", "middleText");
    self.iPercent = self.svg.append("text")
        .attr("id", "iPercent");
    self.dPercent = self.svg.append("text")
        .attr("id", "dPercent");
    self.rPercent = self.svg.append("text")
        .attr("id", "rPercent");
    self.iNominee = self.svg.append("text")
        .attr("id", "iNominee");
    self.dNominee = self.svg.append("text")
        .attr("id", "dNominee");
    self.rNominee = self.svg.append("text")
        .attr("id", "rNominee");  
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
VotePercentageChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R") {
        return "republican";
    }
    else if (party == "D") {
        return "democrat";
    }
    else if (party == "I") {
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for toop tip
 */
VotePercentageChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<ul>";
    tooltip_data.result.forEach(function (row) {
        if (row.percentage <1){
            return;
        }
        text += "<li class = " + self.chooseClass(row.party) + ">" + row.nominee + ":\t\t" + row.votecount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + "(" + row.percentage.toFixed(2) + "%)" + "</li>"
    });

    return text;
}

/**
 * Creates the stacked bar chart, text content and tool tips for Vote Percentage chart
 *
 * @param electionResult election data for the year selected
 */
VotePercentageChart.prototype.update = function (electionResult) {
    var self = this;

    let dNominee = electionResult[0].D_Nominee;
    let rNominee = electionResult[0].R_Nominee;
    let iNominee = electionResult[0].I_Nominee;

    let totalDVotes = electionResult.reduce(function (totalVotes, elem) {
        return totalVotes + elem.D_Votes;
    }, 0)
    let totalRVotes = electionResult.reduce(function (totalVotes, elem) {
        return totalVotes + elem.R_Votes;
    }, 0)
    let totalIVotes = electionResult.reduce(function (totalVotes, elem) {
        return totalVotes + elem.I_Votes;
    }, 0)
    let totalVotes = totalDVotes + totalIVotes + totalRVotes;
    let dPercentage = (totalDVotes / totalVotes) * 100;
    let rPercentage = (totalRVotes / totalVotes) * 100;
    let iPercentage = (totalIVotes / totalVotes) * 100;

    let voterPercentageData = { "result": [{ "nominee": iNominee, "votecount": totalIVotes, "percentage": iPercentage, "party": "I" }, { "nominee": dNominee, "votecount": totalDVotes, "percentage": dPercentage, "party": "D" }, { "nominee": rNominee, "votecount": totalRVotes, "percentage": rPercentage, "party": "R" }] }


    var xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, self.svgWidth]);

    // console.log(dPercentage.toFixed(1) + "%");
    
    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('s')
        .offset(function () {
            return [0, 0];
        })
        .html(function (d) {
            /* populate data in the following format
             * tooltip_data = {
             * "result":[
             * {"nominee": D_Nominee_prop,"votecount": D_Votes_Total,"percentage": D_PopularPercentage,"party":"D"} ,
             * {"nominee": R_Nominee_prop,"votecount": R_Votes_Total,"percentage": R_PopularPercentage,"party":"R"} ,
             * {"nominee": I_Nominee_prop,"votecount": I_Votes_Total,"percentage": I_PopularPercentage,"party":"I"}
             * ]
             * }
             * pass this as an argument to the tooltip_render function then,
             * return the HTML content returned from that method.
             * */
            return self.tooltip_render(voterPercentageData);
        });

    self.svg.call(tip);
    // ******* TODO: PART III *******

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .votesPercentage class to style your bars.

    // Join Data
    var rects = self.svg.selectAll("rects")
        .data(voterPercentageData.result);
    // Updates
    rects
        .attr("width", function (d) {
            return xScale(d.percentage)
        })
        .attr("x", function (d, i) {
            let sumTotalPercent = 0;
            voterPercentageData.result.forEach((elem, index) => {
                if (index < i) {
                    sumTotalPercent += elem.percentage;
                }
            })
            return xScale(sumTotalPercent);
        })
    // Creation
    rects.enter()
        .append("rect")
        .attr("height", self.svgHeight / 4)
        .attr("width", function (d) {
            return xScale(d.percentage)
        })
        .attr("y", function () {
            let height = d3.select(this).attr("height");
            return (self.svgHeight / 2 - height / 2);
        })
        .attr("x", function (d, i) {
            let sumTotalPercent = 0;
            voterPercentageData.result.forEach((elem, index) => {
                if (index < i) {
                    sumTotalPercent += elem.percentage;
                }
            })
            return xScale(sumTotalPercent);
        })
        .attr("class", function (d) {
            return "votesPercentage " + self.chooseClass(d.party)
        }
        )
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        ;

    //Display the total percentage of votes won by each party
    //on top of the corresponding groups of bars.
    //HINT: Use the .votesPercentageText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary
    self.dPercent.text(dPercentage.toFixed(1) + "%")
        .attr("class", () => "votesPercentageText " + this.chooseClass("D"))
        .attr("x", function () {
            let sumTotalPercent = 0;
            let xPosition;
            for (i = 0; i < voterPercentageData.result.length; i++) {
                if (voterPercentageData.result[i].party === "D") {
                    xPosition = sumTotalPercent;
                    break;
                }
                sumTotalPercent += voterPercentageData.result[i].percentage;
            }

            if (iPercentage > 0){
                return (self.svgWidth/4);
            }
            else{
                return xScale(xPosition);
            }
        })
        .attr("y", this.svgHeight * 0.35)
        .attr("text-anchor", "start");
    self.rPercent.text(rPercentage.toFixed(1) + "%")
        .attr("class", () => "votesPercentageText " + this.chooseClass("R"))
        .attr("x", this.svgWidth)
        .attr("y", this.svgHeight * 0.35)
        .attr("text-anchor", "end");
    self.iPercent.text(iPercentage > 0 ? iPercentage.toFixed(1) + "%" : "")
        .attr("class", () => "votesPercentageText " + this.chooseClass("I"))
        .attr("x", 0)
        .attr("y", this.svgHeight * 0.35)
        .attr("text-anchor", "start");
    
    self.dNominee.text(dNominee)
        .attr("class", () => "votesPercentageText " + this.chooseClass("D"))
        .attr("x", function () {
            let sumTotalPercent = 0;
            let xPosition;
            for (i = 0; i < voterPercentageData.result.length; i++) {
                if (voterPercentageData.result[i].party === "D") {
                    xPosition = sumTotalPercent;
                    break;
                }
                sumTotalPercent += voterPercentageData.result[i].percentage;
            }

            if (iPercentage > 0){
                return (self.svgWidth/2 - 50);
            }
            else{
                return xScale(xPosition);
            }

            return self.svgWidth/2
            
        })
        .attr("y", self.svgHeight * 0.1)
        .attr("text-anchor", "middle");
    self.rNominee.text(rNominee)
        .attr("class", () => "votesPercentageText " + this.chooseClass("R"))
        .attr("x", self.svgWidth)
        .attr("y", self.svgHeight * 0.1)
        .attr("text-anchor", "end");
    self.iNominee.text(iPercentage > 0 ? iNominee : "")
        .attr("class", () => "votesPercentageText " + this.chooseClass("I"))
        .attr("x", 0)
        .attr("y", this.svgHeight * 0.1)
        .attr("text-anchor", "start");
    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.
    self.middleBar
        .attr("class", "middleBar")
        .attr("width", 2)
        .attr("height", self.svgHeight / 4 + 5)
        .attr("x", self.svgWidth / 2 - 1)
        .attr("y", self.svgHeight / 2 - (self.svgHeight / 4 + 5) / 2)
        .raise();
    //Just above this, display the text mentioning details about this mark on top of this bar
    //HINT: Use .votesPercentageNote class to style this text element
    self.middleText.text("Popular Vote (50%)")
        .attr("class", "votesPercentageNote")
        .attr("x", self.svgWidth / 2)
        .attr("y", self.svgHeight / 2 - (self.svgHeight / 4 + 5) / 2 - 10);
    //Call the tool tip on hover over the bars to display stateName, count of electoral votes.
    //then, vote percentage and number of votes won by each party.

    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

};
