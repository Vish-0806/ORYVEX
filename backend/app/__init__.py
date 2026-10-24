import os
import sys

# Ensure repository root is on sys.path regardless of whether uvicorn is launched from root or backend/
repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)
