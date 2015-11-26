<?php
/**
 * Created by IntelliJ IDEA.
 * User: aljordan
 * Date: 10/26/15
 * Time: 8:44 PM
 */

function validateDate($date)
{
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') == $date;
}

$iniArray = parse_ini_file("../nextsurvey.ini.php");
$db = new MySqli($iniArray['host'], $iniArray['username'], $iniArray['password'], $iniArray['database']);

$action = (!empty($_POST['action'])) ? $_POST['action'] : '';

switch ($action) {
    case 'loadSurveyResults':
        $surveyId = $_POST['surveyId'];
        $pageId = $_POST['pageId'];
        $beginDate = $_POST['beginDate'];
        $endDate = $_POST['endDate'];
        $pageFilter = "";
        $beginDateFilter = "";
        $endDateFilter = "";

        if ($pageId !== "all") {
            $pageFilter = " and question.pageId = $pageId";
        }

        if (validateDate($beginDate)) {
            $beginDateFilter = " and response.datetime >= '$beginDate'";
        }

        if (validateDate($endDate)) {
            $endDateFilter = " and response.datetime <= '$endDate'";
        }

        $allAnswers = $db->query("select question.questionId, question.questionText, answer.answerText, response.answerID,
            count(*) as answerCount FROM response
            inner join question on question.questionId = response.questionId
            inner join answer on answer.answerId = response.answerId
            inner join page on page.pageId = question.pageId
            where response.surveyId = '$surveyId' $pageFilter $beginDateFilter $endDateFilter
            group by response.questionId, response.answerId
            order by page.pageOrder, question.questionOrder, answer.answerOrder");

        $answersReturned = array();
        while ($row = $allAnswers->fetch_array()) {
            $questionId = $row['questionId'];
            $questionText = $row['questionText'];
            $answerCount = $row['answerCount'];
            $answerText = $row['answerText'];
            $answersReturned[] = array(
                'questionId' => $questionId, 'questionText' => $questionText, 'answerCount' => $answerCount, 'answerText' => $answerText
            );
        }
        echo json_encode($answersReturned);
        break;

    case 'loadFreeResponseResults':
        $surveyId = $_POST['surveyId'];
        $pageId = $_POST['pageId'];
        $beginDate = $_POST['beginDate'];
        $endDate = $_POST['endDate'];
        $pageFilter = "";
        $beginDateFilter = "";
        $endDateFilter = "";

        if ($pageId !== "all") {
            $pageFilter = " and question.pageId = $pageId";
        }

        if (validateDate($beginDate)) {
            $beginDateFilter = " and response.datetime >= '$beginDate'";
        }

        if (validateDate($endDate)) {
            $endDateFilter = " and response.datetime <= '$endDate'";
        }

        $freeResponseAnswers = $db->query("select question.questionId, question.questionText, freeResponse.responseText
	      from freeResponse
	      inner join question on question.questionId = freeResponse.questionId
	      inner join page on page.pageId = question.pageId
	      where freeResponse.surveyId = '$surveyId' $pageFilter $beginDateFilter $endDateFilter
          order by page.pageOrder, question.questionOrder");

        $answersReturned = array();
        while ($row = $freeResponseAnswers->fetch_array()) {
            $questionId = $row['questionId'];
            $questionText = $row['questionText'];
            $answerText = $row['responseText'];
            $answersReturned[] = array(
                'questionId' => $questionId, 'questionText' => $questionText, 'answerText' => $answerText
            );
        }
        echo json_encode($answersReturned);
        break;


    case 'loadSurveys':
        $surveys = $db->query("select surveyid, surveyname from survey where archived = 0 order by surveyname");

        $surveysReturned = array();
        while ($row = $surveys->fetch_array()) {

            $surveyId = $row['surveyid'];
            $surveyName = $row['surveyname'];

            $surveysReturned[] = array(
                'surveyId' => $surveyId, 'surveyName' => $surveyName
            );
        }

        echo json_encode($surveysReturned);
        break;

    case 'getPages':
        $surveyId = $_POST['surveyId'];
        $pages = $db->query("select pageId, surveyId, pageName from page where surveyId = '$surveyId' order by CAST(pageOrder AS SIGNED)");

        $pagesReturned = array();
        while ($row = $pages->fetch_array()) {
            $pageId = $row['pageId'];
            $surveyId = $row['surveyId'];
            $pageName = $row['pageName'];
            $pagesReturned[] = array(
                'pageId' => $pageId, 'surveyId' => $surveyId, 'pageName' => $pageName
            );
        }
        echo json_encode($pagesReturned);
        break;
}

