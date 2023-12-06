import urllib.parse

SQLALCHEMY_DATABASE_URI = 'mssql+pyodbc:///?odbc_connect=' + urllib.parse.quote_plus(
    'Driver={ODBC Driver 18 for SQL Server};' +
    'Server=tcp:recruitment-app-sql-db-server.database.windows.net,1433;' +
    'Database=RecruitmentAppSqlDB;' +
    'Uid=mackin153;' +
    'Pwd=Liverpoollfc123;' +
    'Encrypt=yes;' +
    'TrustServerCertificate=no;' +
    'Connection Timeout=30;'
)
