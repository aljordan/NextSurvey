<?php

$db = new MySqli('localhost', 'nextsurvey', 'wd4040wd', 'nextsurvey');

$action = (!empty($_POST['action'])) ? $_POST['action'] : '';

switch ($action) {
    default:
        $surveys = $db->query("select surveyid, surveyname, surveydescription from survey where archived = 0 and published = 1 order by surveyname");

        $surveysReturned = array();
        while ($row = $surveys->fetch_array()) {

            $surveyId = $row['surveyid'];
            $surveyName = $row['surveyname'];
            $surveyDescription = $row['surveydescription'];            

            $surveysReturned[] = array(
                'surveyId' => $surveyId, 'surveyName' => $surveyName, 'surveyDescription' => $surveyDescription
            );
        }

        echo json_encode($surveysReturned);
        break;
    
}
