export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      reject(new Error('Speech synthesis not supported in this browser'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = 0.65;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };
    
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if (!isSpeechSupported()) {
    return false;
  }
  return window.speechSynthesis.speaking;
}
