import psycopg2
from psycopg2.extras import RealDictCursor

DB_HOST = "localhost"
DB_NAME = "siglapan"
DB_USER = "postgres"
DB_PASS = "ISI_PASSWORD_KAMU"
DB_PORT = "5432"

def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT,
        cursor_factory=RealDictCursor
    )
    return conn