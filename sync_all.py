import whisper
import json
import os

print("Initialisation du Master Script v2 (Correction des dossiers)...")
model = whisper.load_model("tiny") 

def start_sync():
    root_audio = "audio"
    library = []
    
    # Mapping flexible : accepte avec ou sans tirets
    mapping = {
        "iron-mind": {"cat": "discipline", "color": "#FF3366"},
        "iron mind": {"cat": "discipline", "color": "#FF3366"},
        "capital": {"cat": "wealth", "color": "#C9A050"},
        "neural": {"cat": "neural", "color": "#00FFFF"}
    }

    for root, dirs, files in os.walk(root_audio):
        folder_name = os.path.basename(root).lower()
        
        if folder_name in mapping:
            for file in files:
                if file.endswith(".mp3"):
                    track_id = file.replace(".mp3", "")
                    audio_path = os.path.join(root, file)
                    json_path = audio_path.replace(".mp3", ".json")

                    # On standardise le nom du dossier pour le HTML (on met un tiret)
                    standard_folder = folder_name.replace(" ", "-")

                    library.append({
                        "id": track_id,
                        "title": track_id.replace("-", " ").replace("_", " ").title(),
                        "folder": standard_folder,
                        "category": mapping[folder_name]["cat"],
                        "color": mapping[folder_name]["color"]
                    })

                    if not os.path.exists(json_path):
                        print(f"🎧 Nouveau son détecté : {file}...")
                        result = model.transcribe(audio_path)
                        sync_data = [{"start": round(s['start'], 2), "text": s['text'].strip()} for s in result['segments']]
                        with open(json_path, "w", encoding="utf-8") as f:
                            json.dump(sync_data, f, ensure_ascii=False, indent=4)

    with open(os.path.join(root_audio, "library.json"), "w", encoding="utf-8") as f:
        json.dump(library, f, ensure_ascii=False, indent=4)
    
    print(f"\n✅ Terminé ! {len(library)} audios indexés dans library.json")

if __name__ == "__main__":
    start_sync()