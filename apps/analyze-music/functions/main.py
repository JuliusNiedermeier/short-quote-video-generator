from typing import Dict
from firebase_functions import pubsub_fn, options
from firebase_admin import initialize_app
from firebase_admin import credentials, firestore, storage
import numpy as np
import librosa
# import json

# Initialize app
cred = credentials.Certificate("service-account.json")
app = initialize_app(credential=cred)

@pubsub_fn.on_message_published(topic="music-uploaded", memory=options.MemoryOption.GB_1)
def analyze_music(
    event: pubsub_fn.CloudEvent[pubsub_fn.MessagePublishedData[Dict[str, str]]],
) -> None:
  if event.data.message.json == None:
    return

  # Download music
  storage.bucket().blob(event.data.message.json.get("storage")).download_to_filename("music.mp3")

  # Load music file
  y, sr = librosa.load("music.mp3", mono=True)

  # Beat detection
  bpm, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
  beat_times = librosa.frames_to_time(beat_frames, sr=sr)

  # Onset detection
  onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
  onset_time = librosa.frames_to_time(onset_frames)

  # Detect climax
  intensity = librosa.feature.rms(y=y)[0]
  intensity_diff = np.diff(intensity)
  max_change_position = np.argmax(intensity_diff)
  time_of_max_change = librosa.frames_to_time(max_change_position, sr=sr)

  # Save data
  docRef = firestore.client().document(event.data.message.json.get("documentPath"))
  docRef.update({"bpm": bpm, "beats": beat_times.tolist(), "onsets": onset_time.tolist(), "maxChange": time_of_max_change, "analyzed": True})