/**
 * Created by aljordan on 10/27/15.
 */
/*
var SurveyQuestionResult = function(questionText, answerText, answerCount) {
    //var self = this;
    this.questionText = ko.observable(questionText);
    this.answerText = ko.observable(answerText);
    this.answerCount = ko.observable(answerCount);
};
*/

var SurveyResult = function(questionText, answersArray) {
    this.questionText = ko.observable(questionText);
    this.answers = ko.observableArray(answersArray);
}

var AnswerCountData = function(answerText, answerCount) {
    this.answerText = ko.observable(answerText);
    this.answerCount = ko.observable(answerCount);
};


var ViewModel = function() {
    var self = this;
    self.surveyQuestionResults = ko.observableArray(null); // answers to current survey
    self.surveyResults = ko.observableArray(null);

    this.loadData = function() {
        //fetch existing data from database
        $.ajax({
            url: 'surveyResultsDB.php',
            dataType: 'json',
            success: function(data) {
/*
                for (var x in data) {
                    var questionText = data[x]['questionText'];
                    var answerText = data[x]['answerText'];
                    var answerCount = data[x]['answerCount'];
                    self.surveyQuestionResults.push(new SurveyQuestionResult(questionText, answerText, answerCount));
                }
*/
                var answerArray = [];
                var previousQuestionText = null;
                var firstTimeThrough = true;
                for (var x in data) {
                    var questionText = data[x]['questionText'];
                    var answerText = data[x]['answerText'];
                    var answerCount = data[x]['answerCount'];
                    if (questionText != previousQuestionText) {
                        if (!firstTimeThrough) {
                            self.surveyResults.push(new SurveyResult(previousQuestionText,answerArray));
                        }
                        previousQuestionText = questionText;
                        answerArray = [];
                        answerArray.push(new AnswerCountData(answerText,answerCount));
                    } else {
                        answerArray.push(new AnswerCountData(answerText,answerCount));
                    }
                    firstTimeThrough = false;

                }
                // push last results
                self.surveyResults.push(new SurveyResult(questionText,answerArray));
            }
        });
    };


    this.loadData();

}; //end view model


ko.applyBindings(new ViewModel());

