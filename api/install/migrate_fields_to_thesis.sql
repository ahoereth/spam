ALTER TABLE `regulations` ADD `fields_to_thesis` VARCHAR(3) NOT NULL AFTER `examination_fields`;
UPDATE `regulations` SET `fields_to_thesis` = '2:1' WHERE `regulations`.`regulation_id` = 1;
UPDATE `regulations` SET `fields_to_thesis` = '3:2' WHERE `regulations`.`regulation_id` = 2;
UPDATE `regulations` SET `fields_to_thesis` = '2:1' WHERE `regulations`.`regulation_id` = 4;
