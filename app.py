import os
from flask import Flask, render_template, request, jsonify
import requests
import google.generativeai as genai

app = Flask(__name__)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/search_song", methods=["POST"])
def search():
    info = request.get_json()
    lyrics = info.get("lyrics", "").lower()

    prompt = f"The user remembers this lyric or sound: '{lyrics}'. Tell me the song name and artist in format 'Song Name - Artist'. If unsure, give the most probable name. Do not write anything else."
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        ai_response = model.generate_content(prompt)
        search_query = ai_response.text.strip()
    except:
        search_query = lyrics

    URL = 'https://api.genius.com/search'
    genius_token = os.environ.get("GENIUS_ACCESS_TOKEN", "")
    headers = {
        'Authorization': f'Bearer {genius_token}'
    }
    parameters = {
        'q': search_query,
        'per_page': 20,
        'type': 'song'
    }

    response = requests.get(URL, headers=headers, params=parameters)
    response_data = response.json() 
        
    hits = response_data.get('response', {}).get('hits', [])

    if not hits:
        return jsonify({"error": "No encontramos la canción. ¡Prueba escribiendola diferente!"}), 404
    
    songs = []
    for hit in hits:
        result = hit['result']
        
        title = result['title'].lower()
        if "theme" in title or "intro" in title or "show" in title:
            continue 
            
        song_name = result['title']
        artist = result['primary_artist']['name']
        url_thumbnail = result['song_art_image_thumbnail_url']

        clean_search = f"{song_name} {artist}".replace(" ", "+")
        link_youtube = f"https://www.youtube.com/results?search_query={clean_search}"
        link_spotify = f"https://open.spotify.com/search/{clean_search}"

        songs.append({
            "song_name": song_name,
            "artist": artist,
            "thumbnail": url_thumbnail,
            "youtube": link_youtube,
            "spotify": link_spotify
        })

    return jsonify(songs)

if __name__ == "__main__":
    app.run(debug=True)
