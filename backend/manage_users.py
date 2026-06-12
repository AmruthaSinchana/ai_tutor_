#!/usr/bin/env python3
"""
manage_users.py  —  CLI to manage AI Tutor students

Usage:
  python manage_users.py init
  python manage_users.py add   <username> <password>
  python manage_users.py list
  python manage_users.py delete <username>
  python manage_users.py passwd <username> <new_password>

Quick start:
  python manage_users.py init
  python manage_users.py add alice pass123
  python manage_users.py list
"""

import argparse, sys
# FIX: import update_password which now exists in auth.py
# FIX: removed role from imports since auth.py doesn't use roles
from auth import init_db, create_user, list_users, delete_user, update_password

def cmd_init(a):
    init_db()
    print("✅ Database ready at users.db")

def cmd_add(a):
    # FIX: create_user only takes username + password (no role arg)
    ok = create_user(a.username, a.password)
    if ok:
        print(f"✅ Added: {a.username}")
    else:
        print(f"❌ Username '{a.username}' already exists."); sys.exit(1)

def cmd_list(a):
    users = list_users()
    if not users: print("No users yet."); return
    print(f"\n{'ID':<4} {'Username':<20}")
    print("─" * 28)
    for u in users:
        print(f"{u['id']:<4} {u['username']:<20}")
    print(f"\n{len(users)} user(s)\n")

def cmd_delete(a):
    if input(f"Delete '{a.username}'? [y/N]: ").lower() != "y":
        print("Aborted."); return
    print("✅ Deleted." if delete_user(a.username) else f"❌ '{a.username}' not found.")

def cmd_passwd(a):
    # FIX: update_password now exists in auth.py
    print("✅ Password updated." if update_password(a.username, a.new_password)
          else f"❌ '{a.username}' not found.")

def main():
    p = argparse.ArgumentParser(description="AI Tutor user management")
    s = p.add_subparsers(dest="cmd")
    s.add_parser("init")
    pa = s.add_parser("add");    pa.add_argument("username"); pa.add_argument("password")
    s.add_parser("list")
    pd = s.add_parser("delete"); pd.add_argument("username")
    pp = s.add_parser("passwd"); pp.add_argument("username"); pp.add_argument("new_password")
    a = p.parse_args()
    if not a.cmd: p.print_help(); return
    {"init": cmd_init, "add": cmd_add, "list": cmd_list, "delete": cmd_delete, "passwd": cmd_passwd}[a.cmd](a)

if __name__ == "__main__":
    main()