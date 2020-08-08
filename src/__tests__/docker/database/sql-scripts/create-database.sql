CREATE DATABASE scoparella
GO

USE scoparella
GO

CREATE SCHEMA [scopa]
GO

CREATE TABLE [scopa].[statuses]
(
  [id] NVARCHAR(32) PRIMARY KEY NOT NULL
)
GO

CREATE TABLE [scopa].[games]
(
  [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  [player1] NVARCHAR(64) DEFAULT NULL,
  [player1Added] DATETIME2 DEFAULT NULL,
  [player2] NVARCHAR(64) DEFAULT NULL,
  [player2Added] DATETIME2 DEFAULT NULL,
  [gameState] NVARCHAR(max) DEFAULT NULL,
  [lastUpdate] DATETIME2 NOT NULL,
  [statusId] NVARCHAR(32) NOT NULL FOREIGN KEY REFERENCES [scopa].[statuses]([id])
)
GO

-- Populate meta data tables
INSERT [scopa].[statuses]
  (id)
VALUES
  ('waiting'),
  ('inProgress'),
  ('completed'),
  ('cancelled')

CREATE LOGIN scoparella WITH PASSWORD = 'P@ss55w0rd'
GO

CREATE USER scoparella FROM login scoparella
GO

GRANT SELECT, INSERT, UPDATE ON SCHEMA :: scopa TO scoparella
GO
