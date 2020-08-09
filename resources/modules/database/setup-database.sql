-- Idempotent script for setting up the scoparella database
if not exists (select top 1
  *
from sys.database_principals
where name = 'scoparella') begin
  CREATE LOGIN scoparella WITH PASSWORD = '<PASSWORD>'
  CREATE USER scoparella FROM login scoparella
end
GO
