<?php

$iniArray = parse_ini_file("../nextsurvey.ini.php");
$db = new MySqli($iniArray['host'], $iniArray['username'], $iniArray['password'], $iniArray['database']);

$action = (!empty($_POST['action'])) ? $_POST['action'] : '';

switch ($action) {
    
    case 'saveResponses':
        $dbUserId = (!empty($_POST['dbUserId'])) ? $_POST['dbUserId'] : '';
        $dbSurveyId = (!empty($_POST['dbSurveyId'])) ? $_POST['dbSurveyId'] : '';
        $userId = $db->real_escape_string($dbUserId);
        $surveyId = $db->real_escape_string($dbSurveyId);
        $questionsArray = (!empty($_POST['dbQuestionsArray'])) ? $_POST['dbQuestionsArray'] : '';
        foreach($questionsArray as $response) {
            $questionId = $response['questionId'];
            $selectedAnswerId = $db->real_escape_string($response['selectedAnswer']);
            $freeResponseText = $db->real_escape_string($response['freeResponseText']);
            if ($selectedAnswerId == "null" && $freeResponseText != "null" ) {  // check to see if free response question
                $test = $db->query("SELECT COUNT(*) as x, freeResponseId FROM freeResponse WHERE surveyId = '$surveyId' and userId = '$userId' and questionId = '$questionId'");
                $result = $test->fetch_array();
                if($result[0] == 0) {
                    $db->query("INSERT INTO freeResponse (userId, surveyId, questionId, responseText, datetime) VALUES ('$userId', '$surveyId', '$questionId', '$freeResponseText', NOW())");
                } else {
                    $db->query("UPDATE freeResponse SET responseText = '$freeResponseText', datetime = NOW() WHERE surveyId = '$surveyId' and userId = '$userId' and questionId = '$questionId'");
                }
            } else if ($selectedAnswerId != "null") {
                $test = $db->query("SELECT COUNT(*) as x, responseId FROM response WHERE surveyId = '$surveyId' and userId = '$userId' and questionId = '$questionId'");
                $result = $test->fetch_array();

                if($result[0] == 0) {
                    $db->query("INSERT INTO response (userId, surveyId, questionId, answerId, datetime) VALUES ('$userId', '$surveyId', '$questionId', '$selectedAnswerId', NOW())");
                } else {
                    $db->query("UPDATE response SET answerId = '$selectedAnswerId', datetime = NOW() WHERE surveyId = '$surveyId' and userId = '$userId' and questionId = '$questionId'");
                }
            }
                        
            //$db->query("INSERT INTO response (userId, surveyId, questionId, answerId, datetime) VALUES ('$userId', '$surveyId', '$questionId', '$selectedAnswerId', NOW())");
        }

        break;
    

    case 'generateUserId':
        $sql = "SELECT UUID() as uuid limit 1";
        $getId = mysqli_fetch_assoc(mysqli_query($db, $sql));
        $userId = $getId['uuid'];
        echo json_encode($userId);
        break;

    
    
    case 'getSurveyQuestions':
        $dbPageId = (!empty($_POST['dbPageId'])) ? $_POST['dbPageId'] : '';
        $dbUserId = (!empty($_POST['dbUserId'])) ? $_POST['dbUserId'] : '';
        if (!empty($dbPageId) && !empty($dbUserId)) {
            $pageId = $_POST['dbPageId'];
            $userId = $_POST['dbUserId'];
            $questions = $db->query("select question.questionId, question.questionText, question.answerTemplateId, "
                    . "answer.answerId, answer.answerText, response.answerId as selectedAnswerId, freeResponse.responseText as freeResponseText "
                    . "from question "
                    . "left outer join answer on answer.answerTemplateId = question.answerTemplateId "
                    . "left outer join response on response.questionId = question.questionId "
                    . "and response.userId = '$userId' "
                    . "left outer join freeResponse on freeResponse.questionId = question.questionId "
                    . "and freeResponse.userId = '$userId' " 
                    . "where pageId = '$pageId' "
                    . "order by CAST(question.questionOrder AS SIGNED), CAST(answer.answerOrder AS SIGNED)");
            
            $questionsReturned = array();
            while ($row = $questions->fetch_array()) {

                $questionId = $row['questionId'];
                $questionText = $row['questionText'];
                $answerTemplateId = $row['answerTemplateId'];
                $answerId = $row['answerId'];
                $answerText = $row['answerText'];
                $selectedAnswerId = $row['selectedAnswerId'];
                $freeResponseText = $row['freeResponseText'];

                $questionsReturned[] = array(
                    'questionId' => $questionId, 'questionText' => $questionText, 'answerTemplateId' => $answerTemplateId, 'answerId' => $answerId, 'answerText' => $answerText, 'selectedAnswerId' => $selectedAnswerId, 'freeResponseText' => $freeResponseText
                );
            }
        }

        echo json_encode($questionsReturned);
        break;
    
        
    case 'getSurveyPages':
        $dbSurveyId = (!empty($_POST['dbSurveyId'])) ? $_POST['dbSurveyId'] : '';
        if (!empty($dbSurveyId)) {
            $surveyId = $_POST['dbSurveyId'];
            $pages = $db->query("select pageId, pageName from page where surveyId = '$surveyId' order by pageOrder");

            $pagesReturned = array();
            while ($row = $pages->fetch_array()) {

                $pageId = $row['pageId'];
                $pageName = $row['pageName'];

                $pagesReturned[] = array(
                    'pageId' => $pageId, 'pageName' => $pageName
                );
            }
        }

        echo json_encode($pagesReturned);
        break;
       
        
}
