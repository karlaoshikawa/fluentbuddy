
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// VAD - Voice Activity Detection
// Detecta se há fala real no áudio (reduz custos)
export function detectVoiceActivity(audioData: Float32Array, threshold: number = 0.02): boolean {
  // Calcular energia do sinal
  let energy = 0;
  for (let i = 0; i < audioData.length; i++) {
    energy += audioData[i] * audioData[i];
  }
  const rms = Math.sqrt(energy / audioData.length);
  
  // Retorna true se energia está acima do threshold (há fala)
  return rms > threshold;
}

// Aplicar noise gate para remover ruído de fundo
export function applyNoiseGate(audioData: Float32Array, threshold: number = 0.01): Float32Array {
  const processed = new Float32Array(audioData.length);
  
  for (let i = 0; i < audioData.length; i++) {
    const amplitude = Math.abs(audioData[i]);
    // Se amplitude é menor que threshold, zerar (remover ruído)
    processed[i] = amplitude > threshold ? audioData[i] : 0;
  }
  
  return processed;
}

// Detecção avançada de atividade de voz com janelamento
export class VoiceActivityDetector {
  private energyHistory: number[] = [];
  private readonly historySize = 10;
  private readonly energyThreshold = 0.015;
  private readonly zeroCrossingThreshold = 0.1;
  
  // Detecta se há voz usando múltiplos critérios
  public isVoicePresent(audioData: Float32Array): boolean {
    // 1. Energia RMS
    const rms = this.calculateRMS(audioData);
    
    // 2. Taxa de cruzamento por zero (zero-crossing rate)
    const zcr = this.calculateZeroCrossingRate(audioData);
    
    // 3. Manter histórico de energia para detecção adaptativa
    this.energyHistory.push(rms);
    if (this.energyHistory.length > this.historySize) {
      this.energyHistory.shift();
    }
    
    // Calcular threshold adaptativo baseado no histórico
    const avgEnergy = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
    const adaptiveThreshold = Math.max(this.energyThreshold, avgEnergy * 1.5);
    
    // Voz detectada se:
    // - RMS acima do threshold adaptativo E
    // - Zero-crossing rate indica frequências de fala
    return rms > adaptiveThreshold && zcr > this.zeroCrossingThreshold && zcr < 0.5;
  }
  
  private calculateRMS(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }
  
  private calculateZeroCrossingRate(data: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < data.length; i++) {
      if ((data[i] >= 0 && data[i - 1] < 0) || (data[i] < 0 && data[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / data.length;
  }
  
  public reset(): void {
    this.energyHistory = [];
  }
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
