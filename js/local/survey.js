var Answer = function(answerId, answerText) {
    this.answerId = ko.observable(answerId);
    this.answerText = ko.observable(answerText);
};

var Question = function(questionId, questionText, answerTemplateId, possibleAnswers, selectedAnswerId, freeResponseText) {
    this.questionId = ko.observable(questionId);
    this.questionText = ko.observable(questionText);
    this.answerTemplateId = ko.observable(answerTemplateId);
    this.possibleAnswers = ko.observableArray(possibleAnswers);
    this.selectedAnswer = ko.observable(selectedAnswerId);
    this.freeResponseText = ko.observable(freeResponseText);
};

var Page = function(pageId, pageName) {
    this.pageId = ko.observable(pageId);
    this.pageName = ko.observable(pageName);
};

// Data models above 
// View model below

var ViewModel = function() {
    var self = this;
    self.currentSurveyId = ko.observable(getUrlVars()['surveyId']);
    self.currentSurveyName = ko.observable(unescape(getUrlVars()['surveyName']));
    self.currentUserId = ko.observable();

    self.pages = ko.observableArray(null); // holds all pages in the survey
    self.questions = ko.observableArray(null);  // holds all questions for the surrent page
    self.pageCount = ko.observable(); // holds number of pages in the survey
    
    self.currentPageId = ko.observable(null); // used to load survey questions
    self.currentPageName = ko.observable(); // informational item on html page
    self.currentPageNumber = ko.observable(); // used for progress information as well as setting button visibility and loading questions
    self.progress = ko.observable(); //information message about where a user is in the survey
    self.nextVisible = ko.observable();  // visibility binding for next button
    self.previousVisible = ko.observable(); // visibility binding for previous button
    
    
    // save all answers to the current page questions to the database
    this.saveData = function() {
        $.ajax({
            url: 'surveyDB.php',
            type: 'POST',
            data: {'dbQuestionsArray': self.questions(), 'dbUserId': self.currentUserId(), 'dbSurveyId': self.currentSurveyId(), 'action': 'saveResponses'},
            dataType: 'json'
        });        
//        just used for testing
//        console.log(self.currentUserId());
//        console.log(self.currentSurveyId());
//        ko.utils.arrayForEach(self.questions(), function(question) {
//            console.log("Question ID = " + question.questionId());
//            console.log("Selected answer = " + question.selectedAnswer());
//        });  // end of arrayForEach on questions        

    };
    
    
    //move forward or back one page in the survey
    this.navigatePage = function(direction)  {
        self.saveData();
        // call everything below here AFTER you save the answers!
        self.questions([]);
        if (direction === "next") {
            self.currentPageId(self.pages()[self.currentPageNumber()].pageId());
            self.currentPageName(self.pages()[self.currentPageNumber()].pageName());
            self.currentPageNumber(self.currentPageNumber() + 1);
        } else { // direction should equal "previous"
            self.currentPageId(self.pages()[self.currentPageNumber()-2].pageId());
            self.currentPageName(self.pages()[self.currentPageNumber()-2].pageName());    
            self.currentPageNumber(self.currentPageNumber() - 1);
        }
        self.loadCurrentPageQuestions();
        self.setButtonVisibility();
    };
    
    
    // stub for submitting final data and closing survey window (or going back to survey choice page)
    this.submitSurvey = function() {
        self.saveData();    
        alert("Thank you for your feedback");
        window.location.replace("index.html");
    };
    
    // logic to decide if we should show the next and/or previous page buttons.
    this.setButtonVisibility = function() {
        self.nextVisible(parseInt(self.currentPageNumber()) < self.pageCount());
        self.previousVisible(parseInt(self.currentPageNumber()) > 1);
        self.progress(" Page " + self.currentPageNumber() + " of " + self.pageCount());        
    };
    
    
    // get a collection of survey pages that make up the current survey.
    // Survey questions are divided into categories (or pages)
    this.loadSurveyPages = function() {
        //get pages for the current survey
        $.ajax({
            url: 'surveyDB.php',
            type: 'POST',
            data: {'dbSurveyId': self.currentSurveyId, 'action': 'getSurveyPages'},
            dataType: 'json',
            success: function(data) {
                for (var x in data) {
                    var pageId = data[x]['pageId'];
                    var pageName = data[x]['pageName'];
                    self.pages.push(new Page(pageId, pageName));
                    //console.log(pageId);console.log(pageName);
                }
                self.pageCount(self.pages().length);
                self.currentPageId(self.pages()[0].pageId());
                self.currentPageName(self.pages()[0].pageName());
                self.currentPageNumber(1);
                self.loadCurrentPageQuestions();
                self.setButtonVisibility();
            }
        });       
    };
    
    
    // get survey questions from the database and display them in the HTML page.
    this.loadCurrentPageQuestions = function() {
        $.ajax({
            url: 'surveyDB.php',
            type: 'POST',
            data: {'dbPageId': self.currentPageId(), 'dbUserId': self.currentUserId(), 'action': 'getSurveyQuestions'},
            dataType: 'json',
            success: function(data) {
                // This above query returns two joined tables, so I only take the
                // unique questions, but all possible answers for each question.
                var previousQuestionId = null;
                var previousQuestionText = null;
                var previousAnswerTemplateId = null;
                var previousSelectedAnswerId = null;
                var previousSelectedFreeResponseText = null;
                var answerArray = [];
                var firstTimeThrough = true;
                for (var x in data) {
                    var questionId = data[x]['questionId'];
                    var questionText = data[x]['questionText'];
                    var answerTemplateId = data[x]['answerTemplateId'];
                    var answerId = data[x]['answerId'];
                    var answerText = data[x]['answerText'];
                    var selectedAnswerId = data[x]['selectedAnswerId'];
                    var freeResponseText = data[x]['freeResponseText'];
                    if (questionId !== previousQuestionId) {
                        // push the question and then reset
                        if (firstTimeThrough === false) {
                            self.questions.push(new Question(previousQuestionId, previousQuestionText, previousAnswerTemplateId, answerArray, previousSelectedAnswerId, previousSelectedFreeResponseText));
                        }
                        previousQuestionId = questionId;
                        previousQuestionText = questionText;
                        previousAnswerTemplateId = answerTemplateId;
                        previousSelectedAnswerId = selectedAnswerId;
                        previousSelectedFreeResponseText = freeResponseText;
                        //TODO: It seems to me these next to lines should be in
                        // the opposite order.
                        answerArray.push(new Answer(answerId,answerText));
                        answerArray = [];
                    } else {
                        answerArray.push(new Answer(answerId,answerText));
                    }
                    firstTimeThrough = false;
                }
                //push last set of results
            self.questions.push(new Question(previousQuestionId, previousQuestionText, previousAnswerTemplateId, answerArray, previousSelectedAnswerId, previousSelectedFreeResponseText));
            }
        });
    };
    

    // Anonymous user IDs to apply to survey answers
    this.getGeneratedUserId = function() {
        $.ajax({
        url: 'surveyDB.php',
        type: 'POST',
        data: {'action': 'generateUserId'},
        dataType: 'json',
        success: function(data) {
            self.currentUserId(data);
            self.loadSurveyPages();
        }
        });        
    };
    
    
    this.loadData = function() { // for initial data loading only
        self.getGeneratedUserId();  //every time we visit this page, get a new user ID
        // getGeneratedUserID finishes then calls loadSurveyPages().
        // loadSurveyPages() calls loadCurrentPageQuestions in its data retrieval success function.
        // I have to do it this way because loadCurrentPageQuestions() relies on data from loadSurveyPages(),
        // and these are asynchronous calls.
    };

    this.loadData();
    
    
}; // end ViewModel


// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


ko.applyBindings(new ViewModel());
