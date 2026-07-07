const search_btn = document.getElementById("search-button");
const input_text = document.getElementById("input-text");
const div_loading = document.getElementById("loading");
const div_results = document.getElementById("results");

async function toBackend(user_input) {
    try {
        const response = await fetch('/search_song', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user_input)
        });

        if (!response.ok) {
            const errorData = await response.json();
            div_results.innerHTML = `
                <div style="color: #ff4a4a; margin-top: 20px; font-weight: 500;">
                    ⚠️ ${errorData.error}
                </div>
            `;
            return null;
        }

        return await response.json();

    } catch (error) {
        console.error('POST Error:', error);
        div_results.innerHTML = `<div style="color: #ff4a4a; margin-top: 20px;">⚠️ Error de conexión con el servidor.</div>`;
        return null;
    }
}

search_btn.addEventListener("click", async () => {
    const song_lyrics = input_text.value.trim();

    if (!song_lyrics) {
        div_results.innerHTML = `<div style="color: #ff4a4a; margin-top: 20px; font-weight: 500;">⚠️ Escribe algo para buscar.</div>`;
        return;
    }

    const word_count = song_lyrics.split(/\s+/).length;
    
    if (word_count > 15) {
        div_results.innerHTML = `<div style="color: #ff4a4a; margin-top: 20px; font-weight: 500;">⚠️ El límite es de 15 palabras. Sé más breve.</div>`;
        return;
    }

    div_loading.style.display = "block";
    div_results.innerHTML = "";

    const result = await toBackend({ lyrics: song_lyrics });

    div_loading.style.display = "none";

    if (result) {
        const best_match = result[0]; 

        const cardHTML = `
            <div class="song-card">
                <img src="${best_match.thumbnail}" alt="Portada" width="150">
                <h2>${best_match.song_name}</h2>
                <h3>${best_match.artist}</h3>
                <div class="links">
                    <a href="${best_match.youtube}" target="_blank" class="btn-yt">Ver en YouTube</a>
                    <a href="${best_match.spotify}" target="_blank" class="btn-sp">Escuchar en Spotify</a>
                </div>
            </div>
        `;

        div_results.innerHTML = cardHTML;
    }
});
