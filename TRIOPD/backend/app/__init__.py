import sys
import os

# Add the parent directory (TRIOPD) to the path so we can import ml module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))