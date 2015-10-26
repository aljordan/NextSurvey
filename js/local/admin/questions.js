var Survey = function(surveyId, surveyName, surveyDescription, locked, published, viewModel) {
    var self = this;
    this.surveyId = ko.observable(surveyId);
    this.surveyName = ko.observable(surveyName);
    this.surveyDescription = ko.observable(surveyDescription);   
    this.locked = ko.observable(locked);
    this.published = ko.observable(published);
    this.published.subscribe(function() { viewModel.updateSurvey(self); });
};
        
var AnswerTemplate = function(answerTemplateId, answerTemplateName) {
    this.answerTemplateId = ko.observable(answerTemplateId);
    this.answerTemplateName = ko.observable(answerTemplateName);
};


// The Question model is a little different than usual.
// The only way I can run a method when the Answer Template drop down selection 
// is changed, is to add an event subscription to the observable that holds the 
// selected answerTemplateId.  The reason being that when I try to add a function 
// directly to the change or blur or click event of the select box, it fires 
// every time a question is loaded, which is crazy.  So in this model, the
// constructor's last parameter is a reference to the ViewModel below, so I can 
// run a method in the view model when ever the select box item is changed.
// Note that self here refers to the current question that gets pushed into the 
// questions observable array.
var Question = function(questionId, questionText, questionOrder, pageId, answerTemplateId, viewModel) {
    var self = this;
    this.questionId = ko.observable(questionId);
    this.questionText = ko.observable(questionText);
    this.questionOrder = ko.observable(questionOrder);
    this.pageId = ko.observable(pageId);
    this.answerTemplateId = ko.observable(answerTemplateId);
//    this.answerTemplateId.subscribe(function() { viewModel.saveQuestions(); });
    this.answerTemplateId.subscribe(function() { viewModel.clearQuestion(self, null); });
};

var Page = function(pageId, surveyId, pageName, pageOrder) {
    this.pageId = ko.observable(pageId);
    this.surveyId = ko.observable(surveyId);
    this.pageName = ko.observable(pageName);
    this.pageOrder = ko.observable(pageOrder);   
};


var ViewModel = function() {
    var self = this;
    self.surveys = ko.observableArray(null); // stores available surveys
    self.pages = ko.observableArray(null); // pages in current survey
    self.questions = ko.observableArray(null); // questions in current survey page
    self.answerTemplates = ko.observableArray(null); // available answer templates
    self.currentSurvey = ko.observable();
    self.currentSurveyId = ko.observable();
    self.currentSurveyName = ko.observable();
    self.currentPage = ko.observable();
    self.currentPageId = ko.observable();
    self.currentPageName = ko.observable();

    self.selectedPage = ko.observable();
    self.selectedQuestion = ko.observable();

    
    
    self.addSurvey = function() {
        var survey = {'surveyId': null, 
            'surveyName': "New survey",
            'surveyDescription': "description",
            'locked': 0,
            'published': 0
        };
        
        $.ajax({
            url: 'questionsDB.php',
            type: 'POST',
            data: {'dbSurvey': survey, 'action': 'insertSurvey'},
            dataType: 'json',
            success: function(id) {
                var survey = new Survey(id, "new survey", "survey description", "0", 0, self);
                self.surveys.push(survey);
            }
        });
    };
    

    self.deleteSurvey = function() {
        var surveyId = this.surveyId();
        var remove = confirm("Are you sure you want to delete the *" + this.surveyName() 
                + "* survey, and all of its associated pages and their questions?");
        if (remove===true) {
            $.ajax({
                url: 'questionsDB.php',
                type: 'POST',
                data: {'dbSurveyId': surveyId, 'action': 'archiveSurvey'},
                dataType: 'json'
            });
            if (self.currentSurveyId() === surveyId) {
                self.pages([]);  //remove items in the pages area
                self.questions([]);
                self.currentSurvey(null);
                self.currentSurveyId(null);
                self.currentSurveyName(null);
            }
            self.surveys.remove(this);
        }
    };


    self.updateSurvey = function(data) {
        var survey = {'surveyId': data.surveyId(), 
            'surveyName': data.surveyName(),
            'surveyDescription': data.surveyDescription(),
            'published': data.published()
        };

        $.ajax({
            url: 'questionsDB.php',
            type: 'POST',
            data: {'dbSurvey': survey, 'action': 'updateSurvey'},
            dataType: 'json'
        });                    
    };


    self.addQuestion = function() {
        var newPosition = self.questions().length + 1;

        var question = {'questionId': null, 
            'pageId': self.currentPageId(),
            'questionText': "new question",
            'questionOrder': newPosition,
            'answerTemplateId': 1
        };
        
        $.ajax({
            url: 'questionsDB.php',
            type: 'POST',
            data: {'dbQuestion': question, 'action': 'insertQuestion'},
            dataType: 'json',
            success: function(id) {
                var question = new Question(id, "new question", newPosition, self.currentPageId(), 1, self);
                self.selectedQuestion(question);
                self.questions.push(question);
            }
        });
    };

    
    self.saveQuestions = function() {
        for (var i = 0; i < self.questions().length; i++) {
            //set the question order to the position in the array
            self.questions()[i].questionOrder(i+1);
        }
        
        $.ajax({
            url: 'questionsDB.php',
            type: 'POST',
            data: {'dbQuestionsArray': self.questions(), 'action': 'saveQuestions'},
            dataType: 'json'
        });        
    };


    self.clearQuestion = function(data, event) {
        if (data === self.selectedQuestion()) {
            self.selectedQuestion(null);
        }
        if (data.questionText() === "") {
            //need to delete question from database
            var remove = confirm("Are you sure you want to delete this question?"); 
            if (remove===true) {
                $.ajax({
                    url: 'questionsDB.php',
                    type: 'POST',
                    data: {'dbQuestionId': data.questionId(), 'action': 'deleteQuestion'},
                    dataType: 'json'
                });
                self.questions.remove(data);
                // have to run saveQuestions so that the order will be updated properly on delete.
                self.saveQuestions();
            } else {
                self.loadSurveyQuestions(self.currentPage());
            }
        }
        else {
            var question = {'questionId': data.questionId(), 
                'questionText': data.questionText(),
                'pageId': data.pageId(),
                'answerTemplateId': data.answerTemplateId()
            };
            
            $.ajax({
                url: 'questionsDB.php',
                type: 'POST',
                data: {'dbQuestion': question, 'action': 'updateQuestion'},
                dataType: 'json'
            });                    
        }
    };


    
    
    self.loadQuestions = function(data) {
        var pageId = data.pageId();
        self.currentPage(data);
        self.currentPageName(data.pageName() + " questions");
        self.currentPageId(pageId);
        self.questions([]);
        $.ajax({
            type: "POST",
            url: 'questionsDB.php',
            data: {'action': 'getQuestions', 'db_pageId': pageId},
            dataType: 'json',
            success: function(data) {
                 for (var x in data) {
                    var questionId = data[x]['questionId'];
                    var questionText = data[x]['questionText'];
                    var questionOrder = data[x]['questionOrder'];
                    var pageId = data[x]['pageId'];
                    var answerTemplateId = data[x]['answerTemplateId'];
                    //var answerTemplateId = ko.observable(data[x]['answerTemplateId']);
                    //answerTemplateId.subscribe(function(newValue) { alert("test"); });
                    self.questions.push(new Question(questionId, questionText, questionOrder, pageId, answerTemplateId, self)); 
                }
            }
        });        
    };

    self.isQuestionSelected = function(question) {
       return question === self.selectedQuestion();
    };

    self.clearPage = function(data, event) {
        if (data === self.selectedPage()) {
            self.selectedPage(null);
        }
        if (data.pageName() === "") {
            //need to delete page from database
            var remove = confirm("Are you sure you want to delete this page and all questions associated with it?"); 
            if (remove===true) {
                $.ajax({
                    url: 'questionsDB.php',
                    type: 'POST',
                    data: {'dbPageId': data.pageId(), 'action': 'deletePage'},
                    dataType: 'json'
                });                    
                self.pages.remove(data);
                // have to run savePages so that the order will be updated properly on delete.
                self.savePages();
            } else {
                self.loadSurveyPages(self.currentSurvey());
            }
        }
        else {
            var page = {'pageId': data.pageId(), 
                'pageName': data.pageName()
            };
            
            $.ajax({
                url: 'questionsDB.php',
                type: 'POST',
                data: {'dbPage': page, 'action': 'updatePage'},
                dataType: 'json'
            });                    
        }
    };


    
    self.loadSurveyPages = function(data) {
        var surveyId = data.surveyId();
        self.currentSurvey(data);
        self.currentSurveyName(data.surveyName() + " pages");
        self.currentSurveyId(surveyId);
        self.pages([]);
        $.ajax({
            type: "POST",
            url: 'questionsDB.php',
            data: {'action': 'getPages', 'db_surveyId': surveyId},
            dataType: 'json',
            success: function(data) {
                 for (var x in data) {
                    var pageId = data[x]['pageId'];
                    var surveyId = data[x]['surveyId'];
                    var pageName = data[x]['pageName'];
                    var pageOrder = data[x]['pageOrder'];
                    self.pages.push(new Page(pageId, surveyId, pageName, pageOrder)); 
                }
            }
        });        
    };
    
    
    self.isPageSelected = function(page) {
       return page === self.selectedPage();
    };


    self.addPage = function() {
        var newPosition = self.pages().length + 1;

        var page = {'pageId': null, 
            'surveyId': self.currentSurveyId(),
            'pageName': "new page",
            'pageOrder': newPosition
        };
        
        $.ajax({
            url: 'questionsDB.php',
            type: 'POST',
            data: {'dbPage': page, 'action': 'insertPage'},
            dataType: 'json',
            success: function(id) {
                var page = new Page(id, self.currentSurveyId(), "new page", newPosition );
                self.selectedPage(page);
                self.pages.push(page);
            }
        });
    };

    
    
     self.savePages = function() {
        for (var i = 0; i < self.pages().length; i++) {
            //set the page order to the position in the array
            self.pages()[i].pageOrder(i+1);
        }
        
        $.ajax({
            url: 'questionsDB.php',
            type: 'POST',
            data: {'dbPagesArray': self.pages(), 'action': 'savePages'},
            dataType: 'json'
        });        
    };
   
    self.loadAnswerTemplates = function() {
        //fetch existing data from database
        $.ajax({
            url: 'questionsDB.php',
            type: 'POST',
            data: {'action': 'getAnswerTemplates'},
            dataType: 'json',
            success: function(data) {
                for (var x in data) {
                    var answerTemplateId = data[x]['answerTemplateID'];
                    var answerTemplateName = data[x]['answerTemplateName'];
                    self.answerTemplates.push(new AnswerTemplate(answerTemplateId, answerTemplateName));
                }
            }
        });
    };

    
    this.loadData = function() {
        //fetch existing data from database
        $.ajax({
            url: 'questionsDB.php',
            dataType: 'json',
            success: function(data) {
                for (var x in data) {
                    var surveyId = data[x]['surveyId'];
                    var surveyName = data[x]['surveyName'];
                    var surveyDescription = data[x]['surveyDescription'];
                    var locked = data[x]['locked'];
                    var published = data[x]['published'];
                    self.surveys.push(new Survey(surveyId, surveyName, surveyDescription, locked, published, self));
                }
            }
        });
        self.loadAnswerTemplates();
    };
    this.loadData();

    
    // Note, to pass data to a jquery ui modal form, I have to add it to the 
    // data collection of the dialog-form ui element.  This method then 
    // opens the dialog by calling the open method.
    self.editSurveyName = function() {
        $("#dialog-form")
                .data('survey', this)
                .dialog("open");
    };


    // This is jquery stuff for the dialog-form UI
    $(function() {
        var name = $("#name"),
                description = $("#description"),
                allFields = $([]).add(name).add(description);

        $("#dialog-form").dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            open: function() {
                name.val($("#dialog-form").data('survey').surveyName());
                description.val($("#dialog-form").data('survey').surveyDescription());
            },
            buttons: {
                "Update": function() {
                    $("#dialog-form").data('survey').surveyName(name.val());
                    $("#dialog-form").data('survey').surveyDescription(description.val());
                    //self.loadSurveyPages($("#dialog-form").data('survey'));
                    self.updateSurvey($("#dialog-form").data('survey'));
                    $(this).dialog("close");
                },
                Cancel: function() {
                    $(this).dialog("close");
                }
            },
            close: function() {
                allFields.val("");
            }
        });
    });


}; //end view model


//control visibility, give element focus, and select the contents (in order)
ko.bindingHandlers.visibleAndSelect = {
    update: function(element, valueAccessor) {
        ko.bindingHandlers.visible.update(element, valueAccessor);
        if (valueAccessor()) {
            setTimeout(function() {
                $(element).find("input").focus().select();
            }, 0); //new tasks are not in DOM yet
        }
    }
};

ko.applyBindings(new ViewModel());

