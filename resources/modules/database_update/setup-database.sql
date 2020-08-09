-- Idempotent script for the scoparella database
if not exists(select top 1
  *
from sys.schemas
where name ='scopa') BEGIN
  EXEC('CREATE SCHEMA scopa')
  GRANT SELECT, INSERT, UPDATE ON SCHEMA :: scopa TO scoparella
END
GO

IF OBJECT_ID('scopa.statuses', 'U') IS NULL
  CREATE TABLE [scopa].[statuses]
(
  [id] NVARCHAR(32) PRIMARY KEY NOT NULL
)
  GO

IF OBJECT_ID('scopa.games', 'U') IS NULL
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
IF NOT EXISTS (select top 1
  *
from scopa.statuses
where id = 'waiting') INSERT [scopa].[statuses]
  (id)
VALUES
  ('waiting')
IF NOT EXISTS (select top 1
  *
from scopa.statuses
where id = 'inProgress') INSERT [scopa].[statuses]
  (id)
VALUES
  ('inProgress')
IF NOT EXISTS (select top 1
  *
from scopa.statuses
where id = 'completed') INSERT [scopa].[statuses]
  (id)
VALUES
  ('completed')
IF NOT EXISTS (select top 1
  *
from scopa.statuses
where id = 'cancelled') INSERT [scopa].[statuses]
  (id)
VALUES
  ('cancelled')
