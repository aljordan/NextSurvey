/**
 * Created by aljordan on 10/27/15.
 */

var Survey = function(surveyId, surveyName) {
    this.surveyId = ko.observable(surveyId);
    this.surveyName = ko.observable(surveyName);
};

var SurveyResult = function(chartId, questionId, questionText, answersArray) {
    this.chartId = ko.observable(chartId);
    this.questionId = ko.observable(questionId);
    this.questionText = ko.observable(questionText);
    this.answers = ko.observableArray(answersArray);
};

var FreeResponseResult = function(questionId, questionText, answersArray) {
    this.questionId = ko.observable(questionId);
    this.questionText = ko.observable(questionText);
    this.answers = ko.observableArray(answersArray);
};

var Filter = function(questionId, answerId, questionText, answerText) {
    this.questionId = ko.observable(questionId);
    this.questionText = ko.observable(questionText);
    this.answerId = ko.observable(answerId);
    this.answerText = ko.observable(answerText);
};

var AnswerCountData = function(answerId, answerText, answerCount) {
    this.answerId = ko.observable(answerId);
    this.answerText = ko.observable(answerText);
    this.answerCount = ko.observable(answerCount);
};

var Page = function(pageId, surveyId, pageName) {
    this.pageId = ko.observable(pageId);
    this.surveyId = ko.observable(surveyId);
    this.pageName = ko.observable(pageName);
};



var ViewModel = function() {
    var self = this;
    self.surveyResults = ko.observableArray(null);
    self.freeResponseResults = ko.observableArray(null);
    self.surveys = ko.observableArray(null);
    self.pages = ko.observableArray(null);
    self.resultsFilters = ko.observableArray(null);
    self.currentSurveyName = ko.observable();
    self.currentSurveyId = ko.observable();
    self.currentPageName = ko.observable();
    self.currentPageId = ko.observable();
    self.showHeadings = ko.observable(false);
    self.filterByDate = ko.observable(false);
    self.filterByQuestion = ko.observable(false);
    self.beginDateFilter = ko.observable("");
    self.endDateFilter = ko.observable("");
    self.currentQuestionFilter = ko.observable(null);
    self.filterQuestionAnswers = ko.observableArray(null);
    self.enableAddButton = ko.observable(false);
    var beginDate = "";
    var endDate = "";


    this.loadSurveys = function() {
        //fetch existing data from database
        $.ajax({
            type: "POST",
            url: 'surveyResultsDB.php',
            data: {'action': 'loadSurveys'},
            dataType: 'json',
            success: function(data) {
                for (var x in data) {
                    var surveyId = data[x]['surveyId'];
                    var surveyName = data[x]['surveyName'];
                    self.surveys.push(new Survey(surveyId, surveyName));
                }
            }
        });
    };

    this.setDates = function() {
        if (!self.filterByDate()) {
            //first backup current dates
            beginDate = self.beginDateFilter();
            endDate = self.endDateFilter();
            // now clear dates
            self.beginDateFilter("");
            self.endDateFilter("");
            $("#dateFilters").hide();
        } else {
            $("#dateFilters").show();
            $('#startingDate').val(beginDate);
            self.beginDateFilter(beginDate);
            $('#endingDate').val(endDate);
            self.endDateFilter(endDate);
        }
        return true;
    };


    this.setQuestions = function() {
        if (!self.filterByQuestion()) {
            // clear filters
            self.resultsFilters([]);
            $("#questionFilters").hide();
        } else {
            $("#questionFilters").show();
        }
        return true;
    };

    this.getSurveyResultByQuestionId = function(questionId) {
        return ko.utils.arrayFirst(self.surveyResults(), function(item) {
                return item.questionId() == questionId;
            }) || 'not found';
    };


    this.getAnswerInfoByAnswerId = function(answerId) {
        return ko.utils.arrayFirst(self.filterQuestionAnswers(), function(item) {
                return item.answerId() == answerId;
            }) || 'not found';
    };


    self.loadFilterQuestionAnswers = function(data, event) {
        //write a function to search through the surveyResultsArray to get the answersarray
        self.enableAddButton(false);
        var currentQuestionId = event.target.value;
        if (currentQuestionId) {
            var filterSurveyResult = this.getSurveyResultByQuestionId(currentQuestionId);
            self.filterQuestionAnswers(filterSurveyResult.answers());
            self.currentQuestionFilter(new Filter(filterSurveyResult.questionId(), null, filterSurveyResult.questionText(), null));
        }
    };


    self.setQuestionFilter = function(data, event) {
        var currentAnswerId = event.target.value;
        if(currentAnswerId) {
            var answerInfo = this.getAnswerInfoByAnswerId(currentAnswerId);
            self.currentQuestionFilter().answerId(answerInfo.answerId());
            self.currentQuestionFilter().answerText(answerInfo.answerText());
            self.enableAddButton(true);
        }
    };


    self.addFilter = function() {
        self.resultsFilters().push(self.currentQuestionFilter());
        var message = "The following filters are in place:\n";

        ko.utils.arrayForEach(self.resultsFilters(), function(resultFilter) {
            message += resultFilter.questionText() + "  " + resultFilter.answerText() + "\n";
        });

        message += "\nTo clear all filters, uncheck Filter by a question";

        alert(message);
        this.loadSurveyResults(null);
    };


    this.loadSurveyResults = function(data) {
        var surveyId;
        var pageId;

        if (!data) {
            surveyId = self.currentSurveyId();
            pageId = self.currentPageId();
        } else {
            surveyId = data.surveyId();
            pageId = data.pageId();
            self.currentPageName(data.pageName());
            self.currentPageId(pageId);
            self.currentSurveyId(surveyId);
            self.showHeadings(true);
        }


        // build question filters
        var questionsFilterText = "";
        if (self.resultsFilters().length > 0) {
            ko.utils.arrayForEach(self.resultsFilters(), function(resultFilter) {
                questionsFilterText += "and response.userId in (select userId from response where answerId = "
                    + resultFilter.answerId()
                    + " and questionId = " + resultFilter.questionId() +") ";
            });
        }

        //fetch existing data from database
        $.ajax({
            type: "POST",
            url: 'surveyResultsDB.php',
            data: {'action': 'loadSurveyResults', 'surveyId': surveyId, 'pageId': pageId,
                'beginDate': self.beginDateFilter, 'endDate': self.endDateFilter, 'questionsFilter': questionsFilterText},
            dataType: 'json',
            success: function(data) {
                //clear out any existing survey results data
                self.surveyResults([]);
                var answerArray = [];
                var previousChartId = null;
                var previousQuestionId = null;
                var previousQuestionText = null;
                var firstTimeThrough = true;
                for (var x in data) {
                    var chartId = 'chart' + data[x]['questionId'];
                    var questionId = data[x]['questionId'];
                    var questionText = data[x]['questionText'];
                    var answerText = data[x]['answerText'];
                    var answerCount = data[x]['answerCount'];
                    var answerId = data[x]['answerId'];
                    if (questionText != previousQuestionText) {
                        if (!firstTimeThrough) {
                            self.surveyResults.push(new SurveyResult(previousChartId, previousQuestionId, previousQuestionText, answerArray));
                        }
                        previousChartId = chartId;
                        previousQuestionId = questionId;
                        previousQuestionText = questionText;
                        answerArray = [];
                        answerArray.push(new AnswerCountData(answerId,answerText,answerCount));
                    } else {
                        answerArray.push(new AnswerCountData(answerId,answerText,answerCount));
                    }
                    firstTimeThrough = false;

                }
                // push last results
                self.surveyResults.push(new SurveyResult(chartId, questionId, questionText, answerArray));
                drawCharts();
            }
        });

        questionsFilterText = null;
        if (self.resultsFilters().length > 0) {
            questionsFilterText = "and freeResponse.userId in (select userId from response where answerId = "
                + self.resultsFilters()[0].answerId()
                + " and questionId = " + self.resultsFilters()[0].questionId() +")";
        }

        $.ajax({
            type: "POST",
            url: 'surveyResultsDB.php',
            data: {'action': 'loadFreeResponseResults', 'surveyId': surveyId, 'pageId': pageId,
                'beginDate': self.beginDateFilter, 'endDate': self.endDateFilter, 'questionsFilter': questionsFilterText},
            dataType: 'json',
            success: function(data) {
                //clear out any existing survey results data
                self.freeResponseResults([]);

                var answerArray = [];
                var previousQuestionId = null;
                var previousQuestionText = null;
                var firstTimeThrough = true;
                for (var x in data) {
                    var questionId = data[x]['questionId'];
                    var questionText = data[x]['questionText'];
                    var answerText = data[x]['answerText'];
                    if (questionText != previousQuestionText) {
                        if (!firstTimeThrough) {
                            self.freeResponseResults.push(new FreeResponseResult(previousQuestionId, previousQuestionText, answerArray));
                        }
                        previousQuestionId = questionId;
                        previousQuestionText = questionText;
                        answerArray = [];
                        //answerArray.push(answerText);
                        answerArray.push({answerText: new ko.observable(answerText)});
                    } else {
                        //answerArray.push(answerText);
                        answerArray.push({answerText: new ko.observable(answerText)});
                    }
                    firstTimeThrough = false;

                }
                // push last results
                self.freeResponseResults.push(new FreeResponseResult(questionId, questionText, answerArray));
            }
        });

    };


    self.loadSurveyPages = function(data) {
        self.showHeadings(false);
        self.surveyResults([]);
        var surveyId = data.surveyId();
        self.currentSurveyName(data.surveyName());
        self.pages([]);
        self.pages.push(new Page("all",surveyId,"All"));
        $.ajax({
            type: "POST",
            url: 'surveyResultsDB.php',
            data: {'action': 'getPages', 'surveyId': surveyId},
            dataType: 'json',
            success: function(data) {
                for (var x in data) {
                    var pageId = data[x]['pageId'];
                    var surveyId = data[x]['surveyId'];
                    var pageName = data[x]['pageName'];
                    self.pages.push(new Page(pageId, surveyId, pageName));
                }
            }
        });
    };



    this.loadSurveys();

}; //end view model

//ko.applyBindings(new ViewModel());
vm = new ViewModel();
ko.applyBindings(vm);

$("#dateFilters").hide(); //initially hide date filters
$("#questionFilters").hide(); //initially hide question filters


google.load('visualization', '1', {'packages':['corechart']});
var chartData;
var chart;

function initCharts() {
    // Load the Visualization API and the piechart package.
//    google.load('visualization', '1', {'packages':['corechart']});
    // Set a callback to run when the Google Visualization API is loaded.
//    google.setOnLoadCallback(drawCharts);
}


// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawCharts() {
    var colors = ['#008000','#4169E1','#708090','#FF8C00','#B22222','#6A5ACD','#00FF7F','#1E90FF'];

    /*
    var width = Math.max(document.documentElement["clientWidth"], document.body["scrollWidth"],
        document.documentElement["scrollWidth"], document.body["offsetWidth"],
        document.documentElement["offsetWidth"]);
    */

    for (var x in vm.surveyResults()) {
        // it would be better to check the length of surveyResults outside of loop
        // but if the data is empty the length still returns as 1.
        var haveData = false;

        // Create our data table.
        chartData = new google.visualization.DataTable();
        chartData.addColumn('string', 'Answer');
        chartData.addColumn('number', 'Count');

        for (var a in vm.surveyResults()[x].answers()) {
            haveData = true;

            chartData.addRow([vm.surveyResults()[x].answers()[a].answerText(),
                Number(vm.surveyResults()[x].answers()[a].answerCount())]);
        }

        // Set chart options
        var options = {
            'title': vm.surveyResults()[x].questionText(),
            //'width': width,
            //'height': 300,
            is3D: true,
            colors: colors
        };

        if (haveData) {
            // Instantiate and draw our chart, passing in some options.
            //chart = new google.visualization.PieChart(document.getElementById('chart75'));
            chart = new google.visualization.PieChart(document.getElementById(vm.surveyResults()[x].chartId()));
            chart.draw(chartData, options);
        }
    }
}

