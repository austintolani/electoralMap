
/**
 * Constructor for the ElectoralVoteChart
 *
 * @param brushSelection an instance of the BrushSelection class
 */
function ElectoralVoteChart() {
    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ElectoralVoteChart.prototype.init = function () {
    var self = this;
    self.margin = { top: 30, right: 20, bottom: 30, left: 50 };

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 150;

    //creates svg element within the div
    self.svg = divelectoralVotes.append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight)

    self.iCount = self.svg.append("text")
        .attr("id", "iCount");
    self.dCount = self.svg.append("text")
        .attr("id", "dCount");
    self.rCount = self.svg.append("text")
        .attr("id", "rCount");
    self.middleText = self.svg.append("text")
        .attr("id","middleText");
    self.middleBar = self.svg.append("rect")
        .attr("id","middleBar");
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
ElectoralVoteChart.prototype.chooseClass = function (party) {
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
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

ElectoralVoteChart.prototype.update = function (electionResult, colorScale) {
    var self = this;

    let container = document.getElementById("stateList");

    container.innerHTML ="";
    // ******* TODO: PART II *******
    //Group the states based on the winning party for the state;
    //then sort them based on the margin of victory
    // democraticStates = electionResult.filter(state => {
    //     return (state.D_Votes > state.R_Votes && state.D_Votes > state.I_Votes)
    // }).map(function (state) {
    //     let percentages = [state.D_Percentage, state.R_Percentage, state.I_Percentage];
    //     percentages.sort(function (a, b) { return (b - a) });
    //     state.mov = -1 * (percentages[0] - percentages[1]);
    //     state.winner = "D";
    //     return state;
    // }).sort(function (a, b) { return a.mov - b.mov });
    // republicanStates = electionResult.filter(state => {
    //     return (state.R_Votes> state.D_Votes && state.R_Votes > state.I_Votes)
    // }).map(function (state) {
    //     let percentages = [state.D_Percentage, state.R_Percentage, state.I_Percentage];
    //     percentages.sort(function (a, b) { return (b - a) });
    //     state.mov = percentages[0] - percentages[1];
    //     state.winner = "R";
    //     return state;
    // }).sort(function (a, b) { return a.mov - b.mov });;
    // independentStates = electionResult.filter(state => {
    //     return (state.I_Votes > state.R_Votes && state.I_Votes > state.D_Votes)
    // }).map(function (state) {
    //     let percentages = [state.D_Percentage, state.R_Percentage, state.I_Percentage];
    //     percentages.sort(function (a, b) { return (b - a) });
    //     state.mov = percentages[0] - percentages[1];
    //     state.winner = "I";
    //     return state;
    // });


    // let electionResult = independentStates.concat(democraticStates, republicanStates);

    let rEVCount = 0;
    let iEVCount = 0;
    let dEVCount = 0;

    let totalEV = electionResult.reduce(function(sumEV,elem){
        return sumEV + elem.Total_EV;
    },0)

    
    electionResult.forEach(function(elem,index){
        if (elem.winner === "D"){
            dEVCount+= elem.Total_EV;
        }
        else if (elem.winner ==="R"){
            rEVCount += elem.Total_EV;
        }
        else{
            iEVCount += elem.Total_EV;
        }
    })
    var xScale = d3.scaleLinear()
        .domain([0, d3.sum(electionResult.map(state => state.Total_EV))])
        .range([0, self.svgWidth]);


    // Join Data
    var rects = self.svg.append('g').selectAll("rects")
        .data(electionResult);

    // Updates
    rects
        .attr("width", function (d) {
            return xScale(d.Total_EV)
        })
        .attr("x", function (d, i) {
            let sumTotalEV = 0;
            electionResult.forEach((elem, index) => {
                if (index < i) {
                    sumTotalEV += elem.Total_EV;
                }
            })
            return xScale(sumTotalEV);
        })
        .attr("fill", function (d) {
            if (d.winner === "I") {
                return ("#32a852");
            }
            else {
                return colorScale(d.mov);
            }

        })
    // Creation
    rects.enter()
        .append("rect")
        .attr("height", self.svgHeight / 4)
        .attr("width", function (d) {
            return xScale(d.Total_EV)
        })
        .attr("y", function () {
            let height = d3.select(this).attr("height");
            return (self.svgHeight / 2 - height / 2);
        })
        .attr("x", function (d, i) {
            let sumTotalEV = 0;
            electionResult.forEach((elem, index) => {
                if (index < i) {
                    sumTotalEV += elem.Total_EV;
                }
            })
            return xScale(sumTotalEV);
        })
        .attr("fill", function (d) {
            if (d.I_Percentage > d.R_Percentage && d.I_Percentage > d.D_Percentage) {
                return ("#32a852");
            }
            else {
                return colorScale(d.mov);
            }

        })
        .attr("class", "electoralVotes");

    // rects.exit().remove();
    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .electoralVotes class to style your bars.

    //Display total count of electoral votes won by the Democrat and Republican party
    //on top of the corresponding groups of bars.
    //HINT: Use the .electoralVoteText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary

    self.dCount.text(dEVCount)
        .attr("class", () => "electoralVoteText " + this.chooseClass("D"))
        .attr("x", function(){
            let sumTotalEV = 0;
            let xPosition;
            for ( i=0; i<electionResult.length;i++){
                if (electionResult[i].winner === "D"){
                    xPosition = sumTotalEV;
                    break;
                }
                sumTotalEV+= electionResult[i].Total_EV;
            }
            return xScale(xPosition);
        })
        .attr("y", this.svgHeight*0.35)
        .attr("text-anchor","start");
    self.rCount.text(rEVCount)
        .attr("class", () => "electoralVoteText " + this.chooseClass("R"))
        .attr("x", this.svgWidth)
        .attr("y", this.svgHeight*0.35)
        .attr("text-anchor","end");
    self.iCount.text(iEVCount>0 ? iEVCount: "")
        .attr("class", () => "electoralVoteText " + this.chooseClass("I"))
        .attr("x", 0)
        .attr("y", this.svgHeight*0.35)
        .attr("text-anchor","start");
    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.
    self.middleBar
        .attr("class","middleBar")
        .attr("width",2)
        .attr("height",self.svgHeight/4 + 5)
        .attr("x",self.svgWidth/2 - 1)
        .attr("y", self.svgHeight/2 - (self.svgHeight/4 + 5)/2)
        .raise();

    //Just above this, display the text mentioning the total number of electoral votes required
    // to win the elections throughout the country
    //HINT: Use .electoralVotesNote class to style this text element
    self.middleText.text("Electoral Vote (" + (Math.floor(totalEV/2) +1) + " needed to win)")
        .attr("class","electoralVotesNote")
        .attr("x",self.svgWidth/2)
        .attr("y",self.svgHeight/2 - (self.svgHeight/4 + 5)/2 - 10);
    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

    //******* TODO: PART V *******
    //Implement brush on the bar chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of brushSelection and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.

    const brush = d3.brushX()
        .on("start brush end",brushed);
    self.svg.call(brush);

    function brushed({selection}){
        // console.log(selection);
        if (selection){
            d3.selectAll(".tileSelected").attr("class","tile");
            const [x0,x1] = selection;
            // console.log(self.svg.selectAll("rect"));
            let selectedStates = electionResult.filter(function(d,i){
            // console.log(i);
            let sumTotalEV = 0;
            electionResult.forEach((elem, index) => {
                if (index < i) {
                    sumTotalEV += elem.Total_EV;
                }
            })
            let dx0=  xScale(sumTotalEV);
            let dx1 = dx0 + xScale(d.Total_EV);
            // console.log(d.State,x0,x1,dx0,dx1,dx0 >= x1 || x0 >= dx1);
            if (dx0 >= x1 || x0 >= dx1){
                // console.log("False,",d.State);
                return false;
            }
            // console.log("True",d.State);
            return true;

            });
            // console.log(selectedStates);
            let container = document.getElementById("stateList");

            container.innerHTML ="";

            let list = document.createElement('ul');

            selectedStates.forEach(function(elem){
                d3.select("#" + elem.Abbreviation).attr("class","tileSelected");
                // document.getElementById(elem.Abbreviation).className = "tileSelected";
                let item = document.createElement('li');
                item.appendChild(document.createTextNode(elem.State));
                list.appendChild(item);
            });

            container.appendChild(list);
        }
        return self.svg.node();
    }
};
