var Survey = function(surveyId, surveyName, surveyDescription, locked) {
    this.surveyId = ko.observable(surveyId);
    this.surveyName = ko.observable(surveyName);
    this.surveyDescription = ko.observable(surveyDescription);
};

var ViewModel = function() {
    self.surveys = ko.observableArray(null); // stores available surveys

//    this.openSurvey = function(data) {
//        var surveyUrl = "survey.html?surveyId=" + data.surveyId() + "&surveyName=" + data.surveyName();
//        window.open(surveyUrl, "surveyWindow", "height=600, width=800, toolbar=no, menubar=no, scrollbars=no, resizable=yes, location=no, directories=no, status=no");        
//    };
    
    this.loadData = function() {
        //fetch existing data from database
        $.ajax({
            url: 'surveyListDB.php',
            dataType: 'json',
            success: function(data) {
                for (var x in data) {
                    var surveyId = data[x]['surveyId'];
                    var surveyName = data[x]['surveyName'];
                    var surveyDescription = data[x]['surveyDescription'];
                    self.surveys.push(new Survey(surveyId, surveyName, surveyDescription));
                }
            }
        });
    };
    
    this.loadData();

}; // end ViewModel

ko.applyBindings(new ViewModel());

