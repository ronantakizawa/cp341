from flask import Flask, send_file, send_from_directory
import os

app = Flask(__name__)

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def index():
    """Serve the main HTML file"""
    return send_file(os.path.join(BASE_DIR, 'coloradoskyrunner.html'))

@app.route('/<path:filename>')
def serve_files(filename):
    """Serve static files (JS, CSS, images, audio, models, etc.)"""
    return send_from_directory(BASE_DIR, filename)

if __name__ == '__main__':
    print(f"Serving files from: {BASE_DIR}")
    print("Game will be available at: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)