from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__, template_folder='templates', static_folder='static')

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def index():
    """Serve the main HTML file"""
    return render_template('coloradoskyrunner.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files (JS, CSS, images, audio, models, etc.)"""
    return send_from_directory('static', filename)

if __name__ == '__main__':
    print(f"Serving files from: {BASE_DIR}")
    print("Game will be available at: http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)