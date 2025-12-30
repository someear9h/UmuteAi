# 🎙️ Unmute AI

### 🧐 The Problem

For millions of stroke survivors and people with Aphasia, speaking is a struggle. Their thoughts are clear, but their words come out fragmented, stuttered, or broken. Standard tools like Siri or Google Assistant fail because they transcribe the *error* ("W-w-water... hurt") instead of the *intent*. This leaves users feeling isolated and "muted" by society.

### 💡 The Solution

**Unmute AI** is a smart communication prosthetic. It listens to broken speech, understands the context behind it, and instantly reconstructs it into a fluent, grammatically correct sentence. It then speaks that sentence out loud using a natural, human-sounding voice that carries the right emotion.

### 🚀 Key Features

* **🧠 Intent Reconstruction:** Turns fragmented input (e.g., *"Kitchen... water... fall"*) into clear requests (*"I fell in the kitchen while getting water, please help!"*).
* **🗣️ Non-Robotic TTS:** Uses **ElevenLabs** to generate high-quality, human-like audio. Users can select a "Voice Persona" (e.g., The Professional, The Anchor) that matches their identity.
* **💾 Context Memory:** Remembers personal details (like family names or medical history) to fill in the blanks automatically.

### 🛠️ How It Works (Under the Hood)

1. **Frontend:** A **React** app captures raw audio and handles latency masking.
2. **Backend:** A **Python FastAPI** server acts as the central brain.
3. **Intelligence:** We use **Google Gemini 2.5 Flash-Lite** to reason, fix grammar, and deduce intent.
4. **Voice:** We use the **ElevenLabs API** for low-latency, emotionally responsive speech generation.
5. **Memory:** An **SQLite** database stores user context to make interactions personalized.

### 💜 Social Impact

This project falls under **AI for Social Good** and **Assistive Tech**. By moving beyond simple transcription and focusing on *intent*, we are giving agency and dignity back to those who have lost their voice.