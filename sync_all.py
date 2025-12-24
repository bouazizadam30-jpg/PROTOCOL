import whisper
import json
import os

print("Chargement de l'IA Whisper (Modèle Tiny)...")
model = whisper.load_model("tiny") 

def start_sync():
    root_audio = "audio"
    
    if not os.path.exists(root_audio):
        print(f"Erreur : Le dossier '{root_audio}' est introuvable.")
        return

    # os.walk permet de scanner tous les sous-dossiers (iron mind, capital, etc.)
    for root, dirs, files in os.walk(root_audio):
        for file in files:
            if file.endswith(".mp3"):
                print(f"\n--- Analyse de : {file} ---")
                print(f"Dossier : {root}")
                
                audio_path = os.path.join(root, file)
                
                # L'IA génère la transcription avec les timings
                result = model.transcribe(audio_path)
                
                sync_data = []
                for segment in result['segments']:
                    sync_data.append({
                        "start": round(segment['start'], 2),
                        "text": segment['text'].strip()
                    })
                
                # Crée le fichier .json au même endroit que le .mp3
                output_file = audio_path.replace(".mp3", ".json")
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(sync_data, f, ensure_ascii=False, indent=4)
                
                print(f"✅ Succès : {output_file} généré.")

if __name__ == "__main__":
    start_sync()