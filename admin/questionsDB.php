<?php

$iniArray = parse_ini_file("../nextsurvey.ini.php");
$db = new MySqli($iniArray['host'], $iniArray['username'], $iniArray['password'], $iniArray['database']);

$action = (!empty($_POST['action'])) ? $_POST['action'] : '';

switch ($action) {
    case 'insertSurvey':
        $dbSurvey = (!empty($_POST['dbSurvey'])) ? $_POST['dbSurvey'] : '';

        if (!empty($dbSurvey)) {
            //note - use of $mysqli->real_escape_string() is to prevent SQL Injection attacks.
            //$surveyId = $db->real_escape_string($dbSurvey['surveyId']);
            $surveyName = $db->real_escape_string($dbSurvey['surveyName']);
            $surveyDescription = $db->real_escape_string($dbSurvey['surveyDescription']);
            $locked = $db->real_escape_string($dbSurvey['locked']);
            $published = $db->real_escape_string($dbSurvey['published']);
            //$db->query("INSERT INTO survey (surveyid, surveyname, surveydescription, locked) VALUES ('$surveyId', '$surveyName', '$surveyDescription', '$locked')");
            $db->query("INSERT INTO survey (surveyname, surveydescription, locked, published) VALUES ('$surveyName', '$surveyDescription', $locked, $published)");
            echo $db->insert_id; //last insert id
        }
        break;

    case 'updateSurvey':
        $dbSurvey = (!empty($_POST['dbSurvey'])) ? $_POST['dbSurvey'] : '';
        if (!empty($dbSurvey)) {
            $surveyId = $db->real_escape_string($dbSurvey['surveyId']);
            $surveyName = $db->real_escape_string($dbSurvey['surveyName']);
            $surveyDescription = $db->real_escape_string($dbSurvey['surveyDescription']);
            $published = $db->real_escape_string($dbSurvey['published']);
            $db->query("UPDATE survey SET surveyName = '$surveyName',"
                    . " surveyDescription = '$surveyDescription', published = $published "
                    . "WHERE surveyId = '$surveyId'");
        }
        break;
    
    case 'archiveSurvey':
        $dbSurveyId = (!empty($_POST['dbSurveyId'])) ? $_POST['dbSurveyId'] : '';
        if (!empty($dbSurveyId)) {
            $surveyId = $db->real_escape_string($dbSurveyId);
            $db->query("update survey set archived = 1 WHERE surveyId = '$surveyId'");
        }
        break;

        
    case 'updateQuestion':
        $dbQuestion = (!empty($_POST['dbQuestion'])) ? $_POST['dbQuestion'] : '';
        if (!empty($dbQuestion)) {
            $questionId = $db->real_escape_string($dbQuestion['questionId']);
            $questionText = $db->real_escape_string($dbQuestion['questionText']);
            $pageId = $db->real_escape_string($dbQuestion['pageId']);
            $answerTemplateId = $db->real_escape_string($dbQuestion['answerTemplateId']);
            
            $db->query("UPDATE question SET questionText = '$questionText', pageId = '$pageId', "
                    . "answerTemplateId = '$answerTemplateId' WHERE questionId = '$questionId'");
        }
        break;



    case 'deleteQuestion':
        $dbQuestionId = (!empty($_POST['dbQuestionId'])) ? $_POST['dbQuestionId'] : '';
        if (!empty($dbQuestionId)) {
            $questionId = $db->real_escape_string($dbQuestionId);
            $db->query("DELETE FROM question WHERE questionId = '$questionId'");
        }
        break;
 
    
    case 'insertQuestion':
        $dbQuestion = (!empty($_POST['dbQuestion'])) ? $_POST['dbQuestion'] : '';

        if (!empty($dbQuestion)) {
            //note - use of $mysqli->real_escape_string() is to prevent SQL Injection attacks.
            $questionId = $db->real_escape_string($dbQuestion['questionId']);
            $pageId = $db->real_escape_string($dbQuestion['pageId']);
            $questionText = $db->real_escape_string($dbQuestion['questionText']);
            $questionOrder = $db->real_escape_string($dbQuestion['questionOrder']);
            $answerTemplateId = $db->real_escape_string($dbQuestion['answerTemplateId']);
            $db->query("INSERT INTO question (questionId, pageId, questionText, questionOrder, answerTemplateId) VALUES ('$questionId', '$pageId', '$questionText', '$questionOrder', '$answerTemplateId')");
            echo $db->insert_id; //last insert id
        }
        break;
        
        
    case 'saveQuestions':
        $questionsArray = (!empty($_POST['dbQuestionsArray'])) ? $_POST['dbQuestionsArray'] : '';
        foreach($questionsArray as $question) {
            $questionId = $db->real_escape_string($question['questionId']);
            $questionText = $db->real_escape_string($question['questionText']);
            $questionOrder = $db->real_escape_string($question['questionOrder']);
            $pageId = $db->real_escape_string($question['pageId']);
            $answerTemplateId = $db->real_escape_string($question['answerTemplateId']);

            $test = $db->query("SELECT COUNT(*) as x, questionId FROM question WHERE questionId = '$questionId'");
            $result = $test->fetch_array();

            if($result[0] == 0) {
                $db->query("INSERT INTO question (questionId, questionText, questionOrder, pageId, answerTemplateId) VALUES ('$questionId', '$questionText', '$questionOrder', '$pageId', '$answerTemplateId')");
            } else {
                $db->query("UPDATE question SET questionText = '$questionText', questionOrder = '$questionOrder', pageId = '$pageId', answerTemplateId = '$answerTemplateId' WHERE questionId = '$questionId'");
            }
        }
        break;

    case 'getQuestions':
        $pageId = $_POST['db_pageId'];
        $questions = $db->query("select questionId, questionText, questionOrder, pageId, answerTemplateId from question where pageId = '$pageId' order by CAST(questionOrder AS SIGNED)");
        
        $questionsReturned = array();
        while ($row = $questions->fetch_array()) {
            $questionId = $row['questionId'];
            $questionText = $row['questionText'];
            $questionOrder = $row['questionOrder'];
            $pageId = $row['pageId'];
            $answerTemplateId = $row['answerTemplateId'];            
            $questionsReturned[] = array(
                'questionId' => $questionId, 'questionText' => $questionText, 'questionOrder' => $questionOrder,
                'pageId' => $pageId, 'answerTemplateId' => $answerTemplateId
            );            
        }
        echo json_encode($questionsReturned);        
        break;

    
    case 'savePages':
        $pagesArray = (!empty($_POST['dbPagesArray'])) ? $_POST['dbPagesArray'] : '';
        foreach($pagesArray as $page) {
            $pageId = $page['pageId'];
            $surveyId = $page['surveyId'];
            $pageName = $db->real_escape_string($page['pageName']);
            $pageOrder = $db->real_escape_string($page['pageOrder']);

            $test = $db->query("SELECT COUNT(*) as x, pageId FROM page WHERE pageId = '$pageId' and surveyId = '$surveyId'");
            $result = $test->fetch_array();

            if($result[0] == 0) {
                $db->query("INSERT INTO page (pageId, surveyId, pageName, pageOrder) VALUES ('$pageId', '$surveyId', '$pageName', '$pageOrder')");
            } else {
                $db->query("UPDATE page SET pageOrder = '$pageOrder', pageName = '$pageName' WHERE pageId = '$pageId' and surveyId = '$surveyId'");
            }
        }
        break;
    
    
    case 'updatePage':
        $dbPage = (!empty($_POST['dbPage'])) ? $_POST['dbPage'] : '';
        if (!empty($dbPage)) {
            $pageId = $db->real_escape_string($dbPage['pageId']);
            $pageName = $db->real_escape_string($dbPage['pageName']);
            $db->query("UPDATE page SET pageName = '$pageName' WHERE pageId = '$pageId'");
        }
        break;


    case 'deletePage':
        $dbPageId = (!empty($_POST['dbPageId'])) ? $_POST['dbPageId'] : '';
        if (!empty($dbPageId)) {
            $pageId = $db->real_escape_string($dbPageId);
            $db->query("DELETE FROM question WHERE pageId = '$pageId'");
            $db->query("DELETE FROM page WHERE pageId = '$pageId'");
        }
        break;
 
    case 'getPages':
        $surveyId = $_POST['db_surveyId'];
        $pages = $db->query("select pageId, surveyId, pageName, pageOrder from page where surveyId = '$surveyId' order by CAST(pageOrder AS SIGNED)");
        
        $pagesReturned = array();
        while ($row = $pages->fetch_array()) {
            $pageId = $row['pageId'];
            $surveyId = $row['surveyId'];
            $pageName = $row['pageName'];
            $pageOrder = $row['pageOrder'];
            $pagesReturned[] = array(
                'pageId' => $pageId, 'surveyId' => $surveyId, 'pageName' => $pageName,
                'pageOrder' => $pageOrder
            );            
        }
        echo json_encode($pagesReturned);        
        break;

    case 'insertPage':
        $dbPage = (!empty($_POST['dbPage'])) ? $_POST['dbPage'] : '';

        if (!empty($dbPage)) {
            //note - use of $mysqli->real_escape_string() is to prevent SQL Injection attacks.
            $pageId = $db->real_escape_string($dbPage['pageId']);
            $surveyId = $db->real_escape_string($dbPage['surveyId']);
            $pageName = $db->real_escape_string($dbPage['pageName']);
            $pageOrder = $db->real_escape_string($dbPage['pageOrder']);
            $db->query("INSERT INTO page (pageId, surveyId, pageName, pageOrder) VALUES ('$pageId', '$surveyId', '$pageName', '$pageOrder')");
            echo $db->insert_id; //last insert id
        }
        break;

    case 'getAnswerTemplates':
        $answerTemplates = $db->query("select answerTemplateID, answerTemplateName from answertemplate order by answerTemplateName");

        $answerTemplatesReturned = array();
        while ($row = $answerTemplates->fetch_array()) {

            $answerTemplateID = $row['answerTemplateID'];
            $answerTemplateName = $row['answerTemplateName'];

            $answerTemplatesReturned[] = array(
                'answerTemplateID' => $answerTemplateID, 'answerTemplateName' => $answerTemplateName
            );
        }
        echo json_encode($answerTemplatesReturned);
        break;
        
    
    default:
        $surveys = $db->query("select surveyid, surveyname, surveydescription, locked, published from survey where archived = 0 order by surveyname");

        $surveysReturned = array();
        while ($row = $surveys->fetch_array()) {

            $surveyId = $row['surveyid'];
            $surveyName = $row['surveyname'];
            $surveyDescription = $row['surveydescription'];            
            $locked = $row['locked'];
            $published = (bool)$row['published'];

            $surveysReturned[] = array(
                'surveyId' => $surveyId, 'surveyName' => $surveyName, 'surveyDescription' => $surveyDescription ,'locked' => $locked ,'published' => $published
            );
        }

        echo json_encode($surveysReturned);
        break;
    
}
