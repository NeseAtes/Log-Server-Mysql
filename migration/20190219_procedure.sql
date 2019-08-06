DELIMITER //
CREATE PROCEDURE fetchDataForElastic
(IN currentdate DATETIME)
BEGIN
  SELECT
        a.*
    FROM LOGS a where a.date >= currentdate 
END  //
DELIMITER ;