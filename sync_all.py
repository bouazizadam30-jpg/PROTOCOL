import whisper
import json
import os

print("Initialisation du Master Script...")
model = whisper.load_model("tiny") 

def start_sync():
    root_audio = "audio"
    library = []
    
    # Mapping des dossiers vers les catégories et couleurs
    categories = {
        "iron-mind": {"cat": "discipline", "color": "#FF3366"},
        "capital": {"cat": "wealth", "color": "#C9A050"},
        "neural": {"cat": "neural", "color": "#00FFFF"}
    }

    for root, dirs, files in os.walk(root_audio):
        folder_name = os.path.basename(root)
        if folder_name in categories:
            for file in files:
                if file.endswith(".mp3"):
                    track_id = file.replace(".mp3", "")
                    audio_path = os.path.join(root, file)
                    json_path = audio_path.replace(".mp3", ".json")

                    # 1. On ajoute à la bibliothèque automatique
                    library.append({
                        "id": track_id,
                        "title": track_id.replace("-", " ").replace("_", " ").title(),
                        "folder": folder_name,
                        "category": categories[folder_name]["cat"],
                        "color": categories[folder_name]["color"]
                    })

                    # 2. On synchronise si le JSON n'existe pas encore
                    if not os.path.exists(json_path):
                        print(f"🎧 Transcription de : {file}...")
                        result = model.transcribe(audio_path)
                        sync_data = [{"start": round(s['start'], 2), "text": s['text'].strip()} for s in result['segments']]
                        with open(json_path, "w", encoding="utf-8") as f:
                            json.dump(sync_data, f, ensure_ascii=False, indent=4)

    # 3. On sauvegarde la bibliothèque globale
    with open(os.path.join(root_audio, "library.json"), "w", encoding="utf-8") as f:
        json.dump(library, f, ensure_ascii=False, indent=4)
    
    print(f"\n✅ Bibliothèque mise à jour : {len(library)} audios détectés.")

if __name__ == "__main__":
    start_sync()