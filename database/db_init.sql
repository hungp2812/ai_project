DROP DATABASE IF EXISTS db;
SET autocommit = 0;
CREATE DATABASE IF NOT EXISTS db;
-- SHOW DATABASES;
USE db;
-- SHOW TABLES;

CREATE TABLE _User(
	UserID					INT 				    PRIMARY KEY AUTO_INCREMENT,
    UserName			    VARCHAR(20)			    NOT NULL,
    UserPassword			VARCHAR(20),
    UserEmail			    VARCHAR(20),
    UserRole				ENUM('admin', 'user')   DEFAULT 'user',
    UserCreatedDate			DATETIME			    NOT NULL DEFAULT CURRENT_TIMESTAMP
);