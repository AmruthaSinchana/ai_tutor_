"""
auth.py — SQLite login, register via UI
pip install passlib[bcrypt]
"""
import sqlite3, secrets
from passlib.context import CryptContext

DB_PATH = "users.db"
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            username      TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sessions (
            token    TEXT PRIMARY KEY,
            username TEXT NOT NULL
        );
    """)
    conn.commit()
    conn.close()

def create_user(username, password):
    conn = get_db()
    try:
        conn.execute("INSERT INTO users (username, password_hash) VALUES (?,?)",
                     (username.strip(), pwd_ctx.hash(password)))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False   # username taken
    finally:
        conn.close()

def get_user(username):
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
    conn.close()
    return dict(row) if row else None

def list_users():
    conn = get_db()
    rows = conn.execute("SELECT id, username FROM users ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_user(username):
    conn = get_db()
    cur = conn.execute("DELETE FROM users WHERE username=?", (username,))
    conn.commit()
    conn.close()
    return cur.rowcount > 0

def update_password(username, new_password):
    conn = get_db()
    cur = conn.execute("UPDATE users SET password_hash=? WHERE username=?",
                       (pwd_ctx.hash(new_password), username))
    conn.commit()
    conn.close()
    return cur.rowcount > 0

def verify_password(plain, hashed):
    return pwd_ctx.verify(plain, hashed)

def create_session(username):
    token = secrets.token_hex(32)
    conn = get_db()
    conn.execute("INSERT INTO sessions (token, username) VALUES (?,?)", (token, username))
    conn.commit()
    conn.close()
    return token

def validate_token(token):
    conn = get_db()
    row = conn.execute("SELECT username FROM sessions WHERE token=?", (token,)).fetchone()
    conn.close()
    return row["username"] if row else None

def revoke_token(token):
    conn = get_db()
    conn.execute("DELETE FROM sessions WHERE token=?", (token,))
    conn.commit()
    conn.close()