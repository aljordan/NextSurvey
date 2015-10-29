<?php

$iniArray = parse_ini_file("../nextsurvey.ini.php");
$db = new MySqli($iniArray['host'], $iniArray['username'], $iniArray['password'], $iniArray['database']);

$action = (!empty($_POST['action'])) ? $_POST['action'] : '';

switch ($action) {

    case 'insertAnswerTemplate':
        $dbAnswerTemplate = (!empty($_POST['dbAnswerTemplate'])) ? $_POST['dbAnswerTemplate'] : '';

        if (!empty($dbAnswerTemplate)) {
            //note - use of $mysqli->real_escape_string() is to prevent SQL Injection attacks.
            $answerTemplateName = $db->real_escape_string($dbAnswerTemplate);
            $db->query("INSERT INTO answertemplate (answerTemplateName, locked) VALUES ('$answerTemplateName',0)");
            echo $db->insert_id; //last insert id
        }
        break;

    case 'saveAnswers':
        $answersArray = (!empty($_POST['dbAnswersArray'])) ? $_POST['dbAnswersArray'] : '';
        foreach($answersArray as $answer) {
            $answerId = $answer['answerId'];
            $answerOrder = $answer['answerOrder'];
            $answerText = $db->real_escape_string($answer['answerText']);
            $answerTemplateId = $db->real_escape_string($answer['answerTemplateId']);

            $test = $db->query("SELECT COUNT(*) as x, answerId FROM answer WHERE answerId = '$answerId' and answerTemplateId = '$answerTemplateId'");
            $result = $test->fetch_array();

            if($result[0] == 0) {
                $db->query("INSERT INTO answer (answerId, answerText, answerOrder, answerTemplateId) VALUES ('$answerId', '$answerText', '$answerOrder', '$answerTemplateId')");
            } else {
                $db->query("UPDATE answer SET answerOrder = '$answerOrder', answerText = '$answerText' WHERE answerId = '$answerId' and answerTemplateId = '$answerTemplateId'");
            }
        }
        break;
        
        
    case 'insertAnswer':
        $dbTemplateAnswer = (!empty($_POST['dbTemplateAnswer'])) ? $_POST['dbTemplateAnswer'] : '';

        if (!empty($dbTemplateAnswer)) {
            //note - use of $mysqli->real_escape_string() is to prevent SQL Injection attacks.
            $answerId = $db->real_escape_string($dbTemplateAnswer['answerId']);
            $answerText = $db->real_escape_string($dbTemplateAnswer['answerText']);
            $answerOrder = $db->real_escape_string($dbTemplateAnswer['answerOrder']);
            $answerTemplateId = $db->real_escape_string($dbTemplateAnswer['answerTemplateId']);
            $db->query("INSERT INTO answer (answerId, answerText, answerOrder, answerTemplateId) VALUES ('$answerId', '$answerText', '$answerOrder', '$answerTemplateId')");
            echo $db->insert_id; //last insert id
        }
        break;

        
    case 'updateAnswer':
        $dbTemplateAnswer = (!empty($_POST['dbTemplateAnswer'])) ? $_POST['dbTemplateAnswer'] : '';
        if (!empty($dbTemplateAnswer)) {
            $answerId = $db->real_escape_string($dbTemplateAnswer['answerId']);
            $answerText = $db->real_escape_string($dbTemplateAnswer['answerText']);
            $db->query("UPDATE answer SET answerText = '$answerText' WHERE answerId = '$answerId'");
        }
        break;

    case 'updateAnswerTemplate':
        $dbAnswerTemplateId = (!empty($_POST['dbAnswerTemplateId'])) ? $_POST['dbAnswerTemplateId'] : '';
        $dbAnswerTemplateName = (!empty($_POST['dbAnswerTemplateName'])) ? $_POST['dbAnswerTemplateName'] : '';
        if (!empty($dbAnswerTemplateName)) {
            $answerTemplateId = $db->real_escape_string($dbAnswerTemplateId);
            $answerTemplateName = $db->real_escape_string($dbAnswerTemplateName);
            $db->query("UPDATE answertemplate SET answerTemplateName = '$answerTemplateName' WHERE answerTemplateId = '$answerTemplateId'");
        }
        break;

    case 'deleteAnswerTemplate':
        $dbAnswerTemplateId = (!empty($_POST['dbAnswerTemplateId'])) ? $_POST['dbAnswerTemplateId'] : '';
        if (!empty($dbAnswerTemplateId)) {
            $answerTemplateId = $db->real_escape_string($dbAnswerTemplateId);
            $db->query("DELETE FROM answer WHERE answerTemplateId = '$answerTemplateId'");
            $db->query("DELETE FROM answertemplate WHERE answerTemplateId = '$answerTemplateId'");
        }
        break;

        case 'deleteTemplateAnswers':  //delete all answers under a specific answerTemplate
        $dbAnswerTemplateId = (!empty($_POST['dbAnswerTemplateId'])) ? $_POST['dbAnswerTemplateId'] : '';
        if (!empty($dbAnswerTemplateId)) {
            $answerTemplateId = $_POST['dbAnswerTemplateId'];
            $db->query("DELETE FROM answer WHERE answerTemplateId = '$answerTemplateId'");
        }
        break;
    
    case 'deleteAnswer':  //delete single answer
        $id = $_POST['dbAnswerId'];
        $db->query("DELETE FROM answer WHERE answerId = '$id'");
        break;
    
    case 'getTemplateAnswers':
        $answerTemplateId = $_POST['db_answerTemplateId'];
        $answers = $db->query("select answerId, answerText, answerOrder, answerTemplateId from answer where answerTemplateId = '$answerTemplateId' order by answerOrder");
        
        $answersReturned = array();
        while ($row = $answers->fetch_array()) {
            $answerId = $row['answerId'];
            $answerText = $row['answerText'];
            $answerOrder = $row['answerOrder'];
            $answerTemplateId = $row['answerTemplateId'];
            $answersReturned[] = array(
                'answerId' => $answerId, 'answerText' => $answerText, 'answerOrder' => $answerOrder,
                'answerTemplateId' => $answerTemplateId
            );            
        }
        echo json_encode($answersReturned);        
        break;

    default:
        $answerTemplates = $db->query("select answerTemplateID, answerTemplateName, locked from answertemplate where answerTemplateName <> 'Free Text Response' order by answerTemplateName");

        $answerTemplatesReturned = array();
        while ($row = $answerTemplates->fetch_array()) {

            $answerTemplateID = $row['answerTemplateID'];
            $answerTemplateName = $row['answerTemplateName'];
            $locked = $row['locked'];

            $answerTemplatesReturned[] = array(
                'answerTemplateID' => $answerTemplateID, 'answerTemplateName' => $answerTemplateName, 'locked' => $locked
            );
        }

        echo json_encode($answerTemplatesReturned);
        break;
}


