import whisper
import json
import os

print("Chargement de l'IA Whisper...")
model = whisper.load_model("tiny") 

def start_sync():
    root_audio = "audio"
    
    # os.walk permet de scanner tous les sous-dossiers
    for root, dirs, files in os.walk(root_audio):
        for file in files:
            if file.endswith(".mp3"):
                print(f"Analyse de : {file} dans {root}...")
                
                audio_path = os.path.join(root, file)
                result = model.transcribe(audio_path)
                
                sync_data = []
                for segment in result['segments']:
                    sync_data.append({
                        "start": round(segment['start'], 2),
                        "text": segment['text'].strip()
                    })
                
                # Sauvegarde le JSON au même endroit que le MP3
                output_file = audio_path.replace(".mp3", ".json")
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(sync_data, f, ensure_ascii=False, indent=4)
                
                print(f"✅ Terminé : {output_file}")

if __name__ == "__main__":
    start_sync()