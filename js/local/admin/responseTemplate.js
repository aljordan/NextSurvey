var AnswerTemplate = function(answerTemplateID, answerTemplateName, locked) {
    this.answerTemplateID = ko.observable(answerTemplateID);
    this.answerTemplateName = ko.observable(answerTemplateName);
    this.locked = ko.observable(locked);
};

var Answer = function(answerId, answerText, answerOrder, answerTemplateId) {
    this.answerId = ko.observable(answerId);
    this.answerText = ko.observable(answerText);
    this.answerOrder = ko.observable(answerOrder);
    this.answerTemplateId = ko.observable(answerTemplateId);    
};

var ViewModel = function() {
    var self = this;
    self.answerTemplates = ko.observableArray(null); // stores available templates
    self.answers = ko.observableArray(null);
    self.currentTemplateId = ko.observable();
    self.currentTemplateName = ko.observable("Answers");

    self.selectedResponse = ko.observable();
    
    self.addResponseTemplate = function() {
        var templateName = prompt("Enter Response Template name","");
        if (templateName !== null && templateName.length > 0) {
            $.ajax({
                url: 'responseTemplateDB.php',
                type: 'POST',
                data: {'dbAnswerTemplate': templateName, 'action': 'insertAnswerTemplate'},
                dataType: 'json',
                success: function(id) {
                    var answertemplate = new AnswerTemplate(id, templateName);
                    self.answerTemplates.push(answertemplate);
                    self.loadResponseTemplate(answertemplate);
                }
            });       
        }
    };
    
    self.editResponseTemplate = function() {
        //this refers to the answerTemplate that gets automatically
        // passed from the click function.
        //Todo: change all functions to not use unwrapObservable
        var templateId = this.answerTemplateID();
        var templateName = prompt("Edit Response Template name",this.answerTemplateName());
        if (templateName !== null && templateName.length > 0) {
            this.answerTemplateName(templateName);
            $.ajax({
                url: 'responseTemplateDB.php',
                type: 'POST',
                data: {'dbAnswerTemplateName': templateName, 'dbAnswerTemplateId': templateId, 'action': 'updateAnswerTemplate'},
                dataType: 'json'
            });
            self.loadResponseTemplate(this);
        }
    };

    self.deleteResponseTemplate = function() {
        var templateId = this.answerTemplateID();
        var remove = confirm("Are you sure you want to delete the *" + this.answerTemplateName() 
                + "* answer template, and all of its associated answers?");
        if (remove===true) {
            $.ajax({
                url: 'responseTemplateDB.php',
                type: 'POST',
                data: {'dbAnswerTemplateId': templateId, 'action': 'deleteAnswerTemplate'},
                dataType: 'json'
            });
            if (self.currentTemplateId() === templateId) {
                self.answers([]);  //remove items in the answer area
            }
            self.answerTemplates.remove(this);
            self.currentTemplateName("Answers");
            self.currentTemplateId(null);
        }
    };
    
    self.loadResponseTemplate = function(data) {
        var answerTemplateId = data.answerTemplateID();
        self.currentTemplateName(data.answerTemplateName() + " answers");
        self.currentTemplateId(answerTemplateId);
        self.answers([]);
        $.ajax({
            type: "POST",
            url: 'responseTemplateDB.php',
            data: {'action': 'getTemplateAnswers', 'db_answerTemplateId': answerTemplateId},
            dataType: 'json',
            success: function(data) {
                 for (var x in data) {
                    var answerId = data[x]['answerId'];
                    var answerText = data[x]['answerText'];
                    var answerOrder = data[x]['answerOrder'];
                    var answerTemplateId = data[x]['answerTemplateId'];
                    self.answers.push(new Answer(answerId, answerText, answerOrder, answerTemplateId)); 
                }
            }
        });
        //self.checkDataResponse(data);
    };

    
    self.clearResponse = function(data, event) {
        if (data === self.selectedResponse()) {
            self.selectedResponse(null);
        }
        if (data.answerText() === "") {
            //need to delete answer from database
            $.ajax({
                url: 'responseTemplateDB.php',
                type: 'POST',
                data: {'dbAnswerId': data.answerId(), 'action': 'deleteAnswer'},
                dataType: 'json'
            });                    
            
            self.answers.remove(data);

            // have to run saveAnswers so that the order will be updated properly on delete.
            self.saveAnswers();
        }
        else {
            var templateAnswer = {'answerId': data.answerId(), 
                'answerText': data.answerText()
            };
            
            $.ajax({
                url: 'responseTemplateDB.php',
                type: 'POST',
                data: {'dbTemplateAnswer': templateAnswer, 'action': 'updateAnswer'},
                dataType: 'json'
            });                    
        }
    };
    
    
    self.saveAnswers = function() {
        for (var i = 0; i < self.answers().length; i++) {
            //set the answer order to the position in the array
            self.answers()[i].answerOrder(i+1);
        }
        
        $.ajax({
            url: 'responseTemplateDB.php',
            type: 'POST',
            data: {'dbAnswersArray': self.answers(), 'action': 'saveAnswers'},
            dataType: 'json'
        });        

    };


    self.addResponse = function() {
        var newPosition = self.answers().length + 1;

        var templateAnswer = {'answerId': null, 
            'answerText': "new",
            'answerOrder': newPosition,
            'answerTemplateId': self.currentTemplateId()
        };
        
        $.ajax({
            url: 'responseTemplateDB.php',
            type: 'POST',
            data: {'dbTemplateAnswer': templateAnswer, 'action': 'insertAnswer'},
            dataType: 'json',
            success: function(id) {
                var answer = new Answer(id, "new", newPosition, self.currentTemplateId());
                self.selectedResponse(answer);
                self.answers.push(answer);
            }
        });
    };
    

    self.isResponseSelected = function(answer) {
       return answer === self.selectedResponse();
    };
    
    
    this.loadData = function() {
        //fetch existing data from database
        $.ajax({
            url: 'responseTemplateDB.php',
            dataType: 'json',
            success: function(data) {
                for (var x in data) {
                    var answerTemplateID = data[x]['answerTemplateID'];
                    var answerTemplateName = data[x]['answerTemplateName'];
                    var locked = data[x]['locked'];
                    self.answerTemplates.push(new AnswerTemplate(answerTemplateID, answerTemplateName, locked));
                }
            }
        });
    };
    this.loadData();
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

