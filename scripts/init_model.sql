-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema p2p_wazobia_db
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `p2p_wazobia_db` ;

-- -----------------------------------------------------
-- Schema p2p_wazobia_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `p2p_wazobia_db` DEFAULT CHARACTER SET utf8mb3 ;
SHOW WARNINGS;
USE `p2p_wazobia_db` ;

-- -----------------------------------------------------
-- Table `entitytype`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `entitytype` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `entitytype` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb3;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `entity`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `entity` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `entity` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `entity_type_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL,
  `last_updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `entity_entity_type_fk_idx` (`entity_type_id` ASC) VISIBLE,
  CONSTRAINT `entity_entity_type_fk`
    FOREIGN KEY (`entity_type_id`)
    REFERENCES `entitytype` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 44
DEFAULT CHARACTER SET = utf8mb3;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `card`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `card` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `card` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entity_id` INT NOT NULL,
  `owner_entity_id` INT NOT NULL,
  `last4` CHAR(4) NOT NULL,
  `ext_token` CHAR(36) NOT NULL,
  `disabled_date` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `card_entity_id_idx` (`entity_id` ASC) VISIBLE,
  INDEX `card_owner_entity_fk_idx` (`owner_entity_id` ASC) VISIBLE,
  CONSTRAINT `card_entity_fk`
    FOREIGN KEY (`entity_id`)
    REFERENCES `entity` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `card_owner_entity_fk`
    FOREIGN KEY (`owner_entity_id`)
    REFERENCES `entity` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 10
DEFAULT CHARACTER SET = utf8mb3;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `entity_id` INT NOT NULL DEFAULT '0',
  `first_name` VARCHAR(45) NULL DEFAULT 'null',
  `last_name` VARCHAR(45) NULL DEFAULT 'null',
  `email` VARCHAR(45) NOT NULL,
  `password` VARCHAR(120) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `last_updated_at` DATETIME NOT NULL,
  `disabled_date` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `user_entity_fk_idx` (`entity_id` ASC) VISIBLE,
  CONSTRAINT `user_entity_fk`
    FOREIGN KEY (`entity_id`)
    REFERENCES `entity` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb3;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `wallet`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `wallet` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `wallet` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `balance` INT NOT NULL DEFAULT '0',
  `entity_id` INT NOT NULL,
  `owner_entity_id` INT NOT NULL,
  `last_updated_at` DATETIME NOT NULL,
  `disabled_date` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `wallet_entity_fk_idx` (`owner_entity_id` ASC) VISIBLE,
  INDEX `wallet_entity_fk_idx1` (`entity_id` ASC) VISIBLE,
  CONSTRAINT `wallet_entity_fk`
    FOREIGN KEY (`entity_id`)
    REFERENCES `entity` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `wallet_owner_entity_fk`
    FOREIGN KEY (`owner_entity_id`)
    REFERENCES `entity` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb3;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `charge`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `charge` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `charge` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `source` CHAR(36) NOT NULL,
  `amount` INT NOT NULL,
  `created_at` DATETIME NOT NULL,
  `last_updated_at` DATETIME NOT NULL,
  `status` ENUM("pending", "completed", "returned") NOT NULL,
  `user_entity_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `charge_user_entity_fk_idx` (`user_entity_id` ASC) VISIBLE,
  CONSTRAINT `charge_user_entity_fk`
    FOREIGN KEY (`user_entity_id`)
    REFERENCES `entity` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `transfer`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `transfer` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `transfer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `source_wallet_id` INT NOT NULL,
  `destination_wallet_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `created_at` DATETIME NOT NULL,
  `last_updated_at` DATETIME NOT NULL,
  `status` ENUM("pending", "completed", "returned") NOT NULL,
  `user_entity_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `transfer_wallet_fk_idx` (`source_wallet_id` ASC) VISIBLE,
  INDEX `transfer_dest_wallet_fk_idx` (`destination_wallet_id` ASC) VISIBLE,
  INDEX `transfer_user_entity_fk_idx` (`user_entity_id` ASC) VISIBLE,
  CONSTRAINT `transfer_source_wallet_fk`
    FOREIGN KEY (`source_wallet_id`)
    REFERENCES `wallet` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `transfer_dest_wallet_fk`
    FOREIGN KEY (`destination_wallet_id`)
    REFERENCES `wallet` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `transfer_user_entity_fk`
    FOREIGN KEY (`user_entity_id`)
    REFERENCES `entity` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `payout`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `payout` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `payout` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `amount` INT NOT NULL,
  `destination` CHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `last_updated_at` DATETIME NOT NULL,
  `status` ENUM("pending", "completed", "returned") NOT NULL,
  `user_entity_id` INT NOT NULL COMMENT 'This is the entity id of the user that made the request',
  PRIMARY KEY (`id`),
  INDEX `payout_user_entity_fk_idx` (`user_entity_id` ASC) VISIBLE,
  CONSTRAINT `payout_user_entity_fk`
    FOREIGN KEY (`user_entity_id`)
    REFERENCES `entity` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `bankaccount`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bankaccount` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `bankaccount` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entity_id` INT NOT NULL,
  `owner_entity_id` INT NOT NULL,
  `last4` CHAR(4) NOT NULL,
  `ext_token` CHAR(36) NOT NULL,
  `disabled_date` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `bankaccount_entity_fk_idx` (`entity_id` ASC) VISIBLE,
  INDEX `bankaccount_owner_entity_fk_idx` (`owner_entity_id` ASC) VISIBLE,
  CONSTRAINT `bankaccount_entity_fk`
    FOREIGN KEY (`entity_id`)
    REFERENCES `entity` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `bankaccount_owner_entity_fk`
    FOREIGN KEY (`owner_entity_id`)
    REFERENCES `entity` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT);

SHOW WARNINGS;
USE `p2p_wazobia_db`;

DELIMITER $$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `entity_BEFORE_UPDATE` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`entity_BEFORE_UPDATE` BEFORE UPDATE ON `entity` FOR EACH ROW
BEGIN
 SET NEW.last_updated_at = current_timestamp();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `card_BEFORE_INSERT` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`card_BEFORE_INSERT` BEFORE INSERT ON `card` FOR EACH ROW
BEGIN
	INSERT INTO `p2p_wazobia_db`.`entity` (`id`, `entity_type_id`, `uuid`, `created_at`, `last_updated_at`) VALUES (DEFAULT, 3, NEW.ext_token, current_timestamp(), current_timestamp());
        
	SET NEW.entity_id =  LAST_INSERT_ID();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `user_BEFORE_INSERT` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`user_BEFORE_INSERT` BEFORE INSERT ON `user` FOR EACH ROW
BEGIN
	INSERT INTO `p2p_wazobia_db`.`entity` (`id`, `entity_type_id`, `uuid`, `created_at`, `last_updated_at`) VALUES (DEFAULT, 1, new.uuid, current_timestamp(), current_timestamp());
        
	SET NEW.entity_id =  LAST_INSERT_ID();
    SET NEW.created_at = current_timestamp();
    SET NEW.last_updated_at = current_timestamp();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `user_BEFORE_UPDATE` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`user_BEFORE_UPDATE` BEFORE UPDATE ON `user` FOR EACH ROW
BEGIN
    SET NEW.last_updated_at = current_timestamp();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `wallet_BEFORE_INSERT` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`wallet_BEFORE_INSERT` BEFORE INSERT ON `wallet` FOR EACH ROW
BEGIN
	INSERT INTO `p2p_wazobia_db`.`entity` (`id`, `entity_type_id`, `uuid`, `created_at`, `last_updated_at`) VALUES (DEFAULT, 2, new.uuid, current_timestamp(), current_timestamp());
        
	SET NEW.entity_id =  LAST_INSERT_ID();
    SET NEW.last_updated_at = current_timestamp();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `wallet_BEFORE_UPDATE` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`wallet_BEFORE_UPDATE` BEFORE UPDATE ON `wallet` FOR EACH ROW
BEGIN	
    SET NEW.last_updated_at = current_timestamp();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `charge_BEFORE_INSERT` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`charge_BEFORE_INSERT` BEFORE INSERT ON `charge` FOR EACH ROW
BEGIN
    SET NEW.created_at = current_timestamp();
    SET NEW.last_updated_at = current_timestamp();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `charge_BEFORE_UPDATE` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`charge_BEFORE_UPDATE` BEFORE UPDATE ON `charge` FOR EACH ROW
BEGIN
    SET NEW.last_updated_at = current_timestamp();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `transfer_BEFORE_INSERT` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`transfer_BEFORE_INSERT` BEFORE INSERT ON `transfer` FOR EACH ROW
BEGIN
    SET NEW.created_at = current_timestamp();
    SET NEW.last_updated_at = current_timestamp();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `transfer_BEFORE_UPDATE` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`transfer_BEFORE_UPDATE` BEFORE UPDATE ON `transfer` FOR EACH ROW
BEGIN
    SET NEW.last_updated_at = current_timestamp();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `payout_BEFORE_INSERT` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`payout_BEFORE_INSERT` BEFORE INSERT ON `payout` FOR EACH ROW
BEGIN
    SET NEW.created_at = current_timestamp();
    SET NEW.last_updated_at = current_timestamp();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `payout_BEFORE_UPDATE` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`payout_BEFORE_UPDATE` BEFORE UPDATE ON `payout` FOR EACH ROW
BEGIN
    SET NEW.last_updated_at = current_timestamp();
END$$

SHOW WARNINGS$$

USE `p2p_wazobia_db`$$
DROP TRIGGER IF EXISTS `bankaccount_BEFORE_INSERT` $$
SHOW WARNINGS$$
USE `p2p_wazobia_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `p2p_wazobia_db`.`bankaccount_BEFORE_INSERT` BEFORE INSERT ON `bankaccount` FOR EACH ROW
BEGIN
	INSERT INTO `p2p_wazobia_db`.`entity` (`id`, `entity_type_id`, `uuid`, `created_at`, `last_updated_at`) VALUES (DEFAULT, 4, NEW.ext_token, current_timestamp(), current_timestamp());
        
	SET NEW.entity_id =  LAST_INSERT_ID();
END$$

SHOW WARNINGS$$

DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
