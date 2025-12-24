import whisper
import json
import os

# On charge le modèle 'tiny' (le plus rapide et totalement gratuit)
print("Chargement de l'IA Whisper...")
model = whisper.load_model("tiny") 

def start_sync():
    audio_path = "audio"
    
    # On vérifie si le dossier audio existe
    if not os.path.exists(audio_path):
        print(f"Erreur : Le dossier '{audio_path}' est introuvable.")
        return

    for file in os.listdir(audio_path):
        if file.endswith(".mp3"):
            print(f"Analyse de {file}...")
            
            # L'IA transcrit l'audio et note le temps de chaque phrase
            result = model.transcribe(os.path.join(audio_path, file))
            
            # On prépare les données pour ton site
            sync_data = []
            for segment in result['segments']:
                sync_data.append({
                    "start": round(segment['start'], 2),
                    "text": segment['text'].strip()
                })
            
            # On sauvegarde en JSON (ex: school.mp3 -> school.json)
            output_file = os.path.join(audio_path, file.replace(".mp3", ".json"))
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(sync_data, f, ensure_ascii=False, indent=4)
            
            print(f"✅ Terminé ! Fichier créé : {output_file}")

if __name__ == "__main__":
    start_sync()