<?php
/**
 * Created by IntelliJ IDEA.
 * User: aljordan
 * Date: 10/26/15
 * Time: 8:44 PM
 */

$iniArray = parse_ini_file("../nextsurvey.ini.php");
$db = new MySqli($iniArray['host'], $iniArray['username'], $iniArray['password'], $iniArray['database']);


$allAnswers = $db->query("select question.questionText, answer.answerText, response.answerID,
    count(*) as answerCount FROM response
    inner join question on question.questionId = response.questionId
    inner join answer on answer.answerId = response.answerId
    inner join page on page.pageId = question.pageId
    where response.surveyId = 1
    group by response.questionId, response.answerId
    order by page.pageOrder, question.questionOrder, answer.answerOrder");

$answersReturned = array();
while ($row = $allAnswers->fetch_array()) {
    $questionText = $row['questionText'];
    $answerCount = $row['answerCount'];
    $answerText = $row['answerText'];
    $answersReturned[] = array(
        'questionText' => $questionText, 'answerCount' => $answerCount, 'answerText' => $answerText
    );
}
echo json_encode($answersReturned);