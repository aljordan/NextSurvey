-- MySQL dump 10.13  Distrib 5.5.44, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: nextsurvey
-- ------------------------------------------------------
-- Server version	5.5.44-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `answer`
--

DROP TABLE IF EXISTS `answer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answer` (
  `answerId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `answerText` varchar(255) NOT NULL,
  `answerOrder` int(11) NOT NULL,
  `answerTemplateId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`answerId`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1 COMMENT='Answer table.\nContains allowable answers for an answer templ';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answer`
--

LOCK TABLES `answer` WRITE;
/*!40000 ALTER TABLE `answer` DISABLE KEYS */;
INSERT INTO `answer` VALUES (1,'Somewhat Disagree',4,2),(2,'Somewhat Agree',2,2),(3,'Strongly Agree',1,2),(4,'True',1,3),(5,'False',2,3),(6,'Yes',1,4),(7,'No',2,4),(8,'Strongly Disagree',5,2),(9,'Neutral',3,2),(10,'Student',1,5),(11,'Parent / Guardian',2,5),(12,'Staff',3,5);
/*!40000 ALTER TABLE `answer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `answertemplate`
--

DROP TABLE IF EXISTS `answertemplate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answertemplate` (
  `answerTemplateId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `answerTemplateName` varchar(255) NOT NULL,
  `locked` bit(1) DEFAULT NULL,
  PRIMARY KEY (`answerTemplateId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COMMENT='Answer template table.\nDefines a template for allowable answ';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answertemplate`
--

LOCK TABLES `answertemplate` WRITE;
/*!40000 ALTER TABLE `answertemplate` DISABLE KEYS */;
INSERT INTO `answertemplate` VALUES (1,'Free Text Response',''),(2,'Agree / Disagree','\0'),(3,'True / False','\0'),(4,'Yes / No','\0'),(5,'Relationship to Next','\0');
/*!40000 ALTER TABLE `answertemplate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `freeResponse`
--

DROP TABLE IF EXISTS `freeResponse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `freeResponse` (
  `freeResponseId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userId` varchar(36) NOT NULL,
  `surveyId` int(10) unsigned NOT NULL,
  `questionId` int(10) unsigned NOT NULL,
  `responseText` mediumtext,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`freeResponseId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Freeresponse table.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `freeResponse`
--

LOCK TABLES `freeResponse` WRITE;
/*!40000 ALTER TABLE `freeResponse` DISABLE KEYS */;
/*!40000 ALTER TABLE `freeResponse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page`
--

DROP TABLE IF EXISTS `page`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `page` (
  `pageId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `surveyId` int(10) unsigned DEFAULT NULL,
  `pageName` varchar(255) NOT NULL,
  `pageOrder` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`pageId`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1 COMMENT='Category Table\nEach survey can have multiple categories.\nEac';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page`
--

LOCK TABLES `page` WRITE;
/*!40000 ALTER TABLE `page` DISABLE KEYS */;
INSERT INTO `page` VALUES (1,1,'School Culture',2),(2,1,'School Operations',3),(3,1,'Staff',4),(4,1,'Student Achievement',5),(5,1,'Curriculum',6),(7,1,'Relationship to Next',1);
/*!40000 ALTER TABLE `page` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `question` (
  `questionId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `questionText` mediumtext NOT NULL,
  `questionOrder` varchar(10) DEFAULT NULL,
  `answerTemplateId` int(10) unsigned DEFAULT NULL,
  `pageId` int(11) NOT NULL,
  PRIMARY KEY (`questionId`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=latin1 COMMENT='Question table\nContains questionds for a survey.\nEach questi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
INSERT INTO `question` VALUES (1,'Nextâ€™s mission and philosophy are clearly communicated and followed on a day-to-day basis.','1',2,1),(2,'Next provides a culture of mutual respect and relationships between staff and students.','2',2,1),(3,'The culture at Next is motivating and engaging for students.','3',2,1),(4,'The student is at the center of the culture at Next.','4',2,1),(5,'The culture at Next strikes an appropriate balance between group learning and independent learning.','5',2,1),(6,'Next meets the social needs of its students.','6',2,1),(7,'Parents and guardians always feel welcome at Next.','7',2,1),(8,'At Next, positive habits of mind are identified and emphasized.','8',2,1),(9,'Next is flexible enough to meet individual needs and unique learning styles.','9',2,1),(10,'Next supports and encourages parent/guardian and family involvement.','10',2,1),(17,'The school is professionally and efficiently run.','1',2,2),(18,'There is an appropriate staff to student ratio.','2',2,2),(19,'Next provides adequate orientation to new and prospective students and their families.','3',2,2),(20,'The daily schedule promotes student engagement and productivity.','4',2,2),(21,'The schoolâ€™s facilities provide adequate and comfortable space for student learning.','5',2,2),(22,'Next provides instruction and assessment in elective subjects, as well as extended learning opportunities.','6',2,2),(23,'There are adequate tools and supplies provided for staff and students.','7',2,2),(24,'The students feel safe at Next.','8',2,2),(25,'Next monitors and communicates the schoolâ€™s overall performance and uses that information to make improvements.','9',2,2),(26,'Next provides access to extracurricular activities depending on student interest.','10',2,2),(27,'Next participates in the Derry community and strives to enlighten the community on our mission.','11',2,2),(28,'Next has comprehensive policies and procedures that are clearly communicated.','12',2,2),(32,'Staff are qualified and demonstrate competency in their respective fields.','1',2,3),(33,'Staff are professional and organized.','2',2,3),(34,'Staff are committed to the schoolâ€™s mission statement.','3',2,3),(35,'Staff are empathetic to studentsâ€™ specific situations and individual needs.','4',2,3),(36,'Staff identify clear and attainable expectations of the students and properly support studentsâ€™ abilities to meet those expectations.','5',2,3),(37,'Staff regularly communicate with parents and guardians to monitor the individual studentâ€™s progress.','6',2,3),(38,'Staff support and guide students in their pursuit of post-secondary education.','7',2,3),(39,'Staff demonstrates effective teamwork and collaboration.','8',2,3),(40,'Staff pursues ongoing professional development.','9',2,3),(41,'Staff have the respect of the students.','10',2,3),(42,'Staff have the respect and confidence of the parents and guardians.','11',2,3),(50,'Students have high expectations of themselves.','1',2,4),(51,'Students feel adequately challenged.','2',2,4),(52,'Students believe their successes are recognized and supported by the teachers.','3',2,4),(53,'Students are actively engaged in the daily learning process.','4',2,4),(54,'Students enjoy their learning.','5',2,4),(55,'Students have significant input and control in their learning process and path.','6',2,4),(56,'Students are learning independently.','7',2,4),(57,'Students are progressing towards graduation at an acceptable rate.','8',2,4),(58,'All students are pursuing post-secondary education.','9',2,4),(59,'Students are being recognized and accepted at post-secondary schools and colleges.','10',2,4),(61,'The curriculum is sufficiently challenging.','1',2,5),(62,'The curriculum supports student input and meets their different learning needs and styles.','2',2,5),(63,'The curriculum assesses habits of mind and promotes student practice of these skills.','3',2,5),(64,'The curriculum provides opportunity for the student and staff to take learning outside the classroom.','4',2,5),(65,'The curriculum supports group learning experiences.','5',2,5),(66,'Current and applicable technology is used effectively to support student learning.','6',2,5),(67,'The curriculum identifies clear competencies and indicators.','7',2,5),(68,'The curriculum provides the proper balance between the student\'s needs and the standards required for graduation.','8',2,5),(69,'The curriculum emphasizes hands-on learning experiences through which students produce meaningful artifacts.','9',2,5),(75,'My affiliation with Next Charter School is best described as:','1',5,7);
/*!40000 ALTER TABLE `question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `response`
--

DROP TABLE IF EXISTS `response`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `response` (
  `responseId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userId` varchar(36) NOT NULL,
  `surveyId` int(10) unsigned NOT NULL,
  `questionId` int(10) unsigned NOT NULL,
  `answerId` int(10) unsigned NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`responseId`)
) ENGINE=InnoDB AUTO_INCREMENT=2482 DEFAULT CHARSET=latin1 COMMENT='Response table.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `survey`
--

DROP TABLE IF EXISTS `survey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `survey` (
  `surveyid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `surveyname` varchar(255) NOT NULL,
  `surveydescription` mediumtext,
  `locked` bit(1) NOT NULL DEFAULT b'0',
  `archived` bit(1) NOT NULL DEFAULT b'0',
  `published` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`surveyid`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey`
--

LOCK TABLES `survey` WRITE;
/*!40000 ALTER TABLE `survey` DISABLE KEYS */;
INSERT INTO `survey` VALUES (1,'Next Performance Survey',' A questionnaire for Next students, guardians and staff','\0','\0',''),(11,'New survey','description','\0','','\0');
/*!40000 ALTER TABLE `survey` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-10-26 14:33:23
