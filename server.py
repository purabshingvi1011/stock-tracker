from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='.', static_url_path='')

# 1) Serve the index page at root
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# 2) Serve any file from the same folder
@app.route('/<path:path>')
def serve_file(path):
    # For example: /styles.css, /scripts.js, /images/something.jpg
    return send_from_directory('.', path)

if __name__ == '__main__':
    # Optional: read PORT from environment if deploying
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port)
