/**
 * Created by aljordan on 10/27/15.
 */

var SurveyResult = function(chartId, questionText, answersArray) {
    this.chartId = ko.observable(chartId);
    this.questionText = ko.observable(questionText);
    this.answers = ko.observableArray(answersArray);
}

var AnswerCountData = function(answerText, answerCount) {
    this.answerText = ko.observable(answerText);
    this.answerCount = ko.observable(answerCount);
};


var ViewModel = function() {
    var self = this;
    self.surveyResults = ko.observableArray(null);

    this.loadData = function() {
        //fetch existing data from database
        $.ajax({
            url: 'surveyResultsDB.php',
            dataType: 'json',
            success: function(data) {
                var answerArray = [];
                var previousQuestionId = null;
                var previousQuestionText = null;
                var firstTimeThrough = true;
                for (var x in data) {
                    var chartId = 'chart' + data[x]['questionId'];
                    var questionText = data[x]['questionText'];
                    var answerText = data[x]['answerText'];
                    var answerCount = data[x]['answerCount'];
                    if (questionText != previousQuestionText) {
                        if (!firstTimeThrough) {
                            self.surveyResults.push(new SurveyResult(previousChartId, previousQuestionText, answerArray));
                        }
                        previousChartId = chartId;
                        previousQuestionText = questionText;
                        answerArray = [];
                        answerArray.push(new AnswerCountData(answerText,answerCount));
                    } else {
                        answerArray.push(new AnswerCountData(answerText,answerCount));
                    }
                    firstTimeThrough = false;

                }
                // push last results
                self.surveyResults.push(new SurveyResult(chartId, questionText, answerArray));

            }
        });
    };


    this.loadData();

}; //end view model

//ko.applyBindings(new ViewModel());
vm = new ViewModel();
ko.applyBindings(vm);


var chartData;
var chart;

function initCharts() {
    // Load the Visualization API and the piechart package.
    google.load('visualization', '1', {'packages':['corechart']});
    // Set a callback to run when the Google Visualization API is loaded.
    google.setOnLoadCallback(drawCharts);
}


// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawCharts() {
    var colors = ['#008000','#4169E1','#708090','#FF8C00','#B22222'];
    for (var x in vm.surveyResults()) {
        // Create our data table.
        chartData = new google.visualization.DataTable();
        chartData.addColumn('string', 'Answer');
        chartData.addColumn('number', 'Count');

        for (var a in vm.surveyResults()[x].answers()) {
            // alert(vm.surveyResults()[0].answers()[a].answerText());

            chartData.addRow([vm.surveyResults()[x].answers()[a].answerText(),
                Number(vm.surveyResults()[x].answers()[a].answerCount())]);
        }

        // Set chart options
        var options = {
            'title': vm.surveyResults()[x].questionText(),
            'width': 600,
            'height': 300,
            is3D: true,
            colors: colors
        };

        // Instantiate and draw our chart, passing in some options.
        //chart = new google.visualization.PieChart(document.getElementById('chart75'));
        chart = new google.visualization.PieChart(document.getElementById(vm.surveyResults()[x].chartId()));
        chart.draw(chartData, options);
    }
}

initCharts();