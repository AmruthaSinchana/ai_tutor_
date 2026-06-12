"""
auth.py — SQLite login, register, PDF storage
pip install passlib[bcrypt]
"""
import sqlite3, secrets, os, shutil
from passlib.context import CryptContext

DB_PATH = "users.db"
UPLOAD_DIR = "uploaded_pdfs"
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
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
        CREATE TABLE IF NOT EXISTS pdfs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT NOT NULL,
            filename    TEXT NOT NULL,
            filepath    TEXT NOT NULL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (username) REFERENCES users(username)
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
        return False
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

# ── PDF functions ─────────────────────────────────────────────────────────────

def save_pdf_record(username, filename, filepath):
    conn = get_db()
    conn.execute(
        "INSERT INTO pdfs (username, filename, filepath) VALUES (?,?,?)",
        (username, filename, filepath)
    )
    conn.commit()
    conn.close()

def get_user_pdfs(username):
    conn = get_db()
    rows = conn.execute(
        "SELECT id, filename, filepath, uploaded_at FROM pdfs WHERE username=? ORDER BY uploaded_at DESC",
        (username,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_pdf_record(pdf_id, username):
    conn = get_db()
    row = conn.execute("SELECT filepath FROM pdfs WHERE id=? AND username=?", (pdf_id, username)).fetchone()
    if row:
        filepath = row["filepath"]
        if os.path.exists(filepath):
            os.remove(filepath)
        conn.execute("DELETE FROM pdfs WHERE id=?", (pdf_id,))
        conn.commit()
    conn.close()
    return row is not None