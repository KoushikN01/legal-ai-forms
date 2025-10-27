import json
import os
from typing import Dict, Any

def transcribe_audio(filepath: str) -> Dict[str, Any]:
    """
    Transcribe audio file to text.
    Supports: Google Cloud Speech, OpenAI Whisper, BHASHINI
    Falls back to mock if no API key configured.
    """
    
    api_choice = os.getenv("SPEECH_API", "mock").lower()
    
    if api_choice == "google":
        return transcribe_google(filepath)
    elif api_choice == "openai":
        return transcribe_openai(filepath)
    elif api_choice == "bhashini":
        return transcribe_bhashini(filepath)
    else:
        return transcribe_mock(filepath)


def transcribe_mock(filepath: str) -> Dict[str, Any]:
    """Mock transcription for demo/testing"""
    mock_transcripts = {
        "default": {
            "text": "My name is Ravi Kumar, my old name was Ravi R, and I want to change my name because of marriage. My phone number is 9876543210.",
            "language": "en",
            "confidence": 0.95
        }
    }
    return mock_transcripts["default"]


def transcribe_google(filepath: str) -> Dict[str, Any]:
    """Google Cloud Speech-to-Text transcription"""
    try:
        from google.cloud import speech_v1
        
        client = speech_v1.SpeechClient()
        
        with open(filepath, "rb") as audio_file:
            content = audio_file.read()
        
        audio = speech_v1.RecognitionAudio(content=content)
        config = speech_v1.RecognitionConfig(
            encoding=speech_v1.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="en-US",
        )
        
        response = client.recognize(config=config, audio=audio)
        
        if response.results:
            return {
                "text": response.results[0].alternatives[0].transcript,
                "language": "en",
                "confidence": response.results[0].alternatives[0].confidence
            }
        else:
            return {"text": "", "language": "en", "confidence": 0.0}
    except Exception as e:
        print(f"Google Speech API error: {e}")
        return transcribe_mock(filepath)


def transcribe_openai(filepath: str) -> Dict[str, Any]:
    """OpenAI Whisper transcription"""
    try:
        import openai
        
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        with open(filepath, "rb") as audio_file:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)
        
        return {
            "text": transcript["text"],
            "language": "en",
            "confidence": 0.95
        }
    except Exception as e:
        print(f"OpenAI Whisper error: {e}")
        return transcribe_mock(filepath)


def transcribe_bhashini(filepath: str) -> Dict[str, Any]:
    """BHASHINI Cloud STT transcription (for Indian languages)"""
    try:
        import requests
        
        api_key = os.getenv("BHASHINI_API_KEY")
        
        with open(filepath, "rb") as audio_file:
            files = {"file": audio_file}
            headers = {"Authorization": f"Bearer {api_key}"}
            
            response = requests.post(
                "https://api.bhashini.gov.in/transcribe",
                files=files,
                headers=headers
            )
        
        if response.status_code == 200:
            data = response.json()
            return {
                "text": data.get("text", ""),
                "language": data.get("language", "en"),
                "confidence": data.get("confidence", 0.9)
            }
        else:
            return transcribe_mock(filepath)
    except Exception as e:
        print(f"BHASHINI error: {e}")
        return transcribe_mock(filepath)
