import { useState, useCallback } from 'react';

export interface SavedPDF {
  id: string;
  name: string;
  uploadedAt: string;
  extractedContent: string; // Texto extraído via Gemini
  topics: string[];         // Tópicos principais identificados
  vocabulary: string[];     // Vocabulário-chave encontrado
}

const STORAGE_KEY = 'fluency_pdfs';

function loadFromStorage(): SavedPDF[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(pdfs: SavedPDF[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pdfs));
}

export function usePDFManager() {
  const [pdfs, setPdfs] = useState<SavedPDF[]>(loadFromStorage);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const uploadPDF = useCallback(async (file: File, displayName?: string): Promise<SavedPDF | null> => {
    setIsProcessing(true);
    setProcessingError(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API key não configurada');
      }

      // Ler PDF como base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remover prefixo "data:application/pdf;base64,"
          resolve(result.split(',')[1]);
        };
        reader.onerror = () => reject(new Error('Falha ao ler o PDF'));
        reader.readAsDataURL(file);
      });

      // Enviar para Gemini extrair conteúdo
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: 'application/pdf',
                      data: base64,
                    },
                  },
                  {
                    text: `You are analyzing an English lesson PDF. Extract and organize the content to help a student prepare for their English conversation class.

Return ONLY valid JSON (no markdown, no code fences):
{
  "summary": "Detailed summary of the lesson content (2-3 paragraphs in English)",
  "mainTopics": ["topic1", "topic2", "topic3"],
  "keyVocabulary": ["word/phrase 1", "word/phrase 2", "word/phrase 3", "word/phrase 4", "word/phrase 5", "word/phrase 6", "word/phrase 7", "word/phrase 8"],
  "conversationThemes": ["theme1", "theme2", "theme3"],
  "grammarPoints": ["grammar point 1", "grammar point 2"],
  "fullContent": "Full extracted text content of the PDF, preserving all important information, examples, dialogues, and exercises"
}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Resposta inválida da API');
      }

      const rawText = data.candidates[0].content.parts[0].text;
      const cleanText = rawText.replace(/^```json\n?/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanText);

      const newPDF: SavedPDF = {
        id: `pdf_${Date.now()}`,
        name: displayName ?? file.name.replace(/\.pdf$/i, ''),
        uploadedAt: new Date().toISOString(),
        extractedContent: `${parsed.summary}\n\n${parsed.fullContent}`,
        topics: parsed.mainTopics || [],
        vocabulary: parsed.keyVocabulary || [],
      };

      const updated = [...loadFromStorage(), newPDF];
      saveToStorage(updated);
      setPdfs(updated);
      return newPDF;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setProcessingError(msg);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const deletePDF = useCallback((id: string) => {
    const updated = loadFromStorage().filter((p) => p.id !== id);
    saveToStorage(updated);
    setPdfs(updated);
  }, []);

  return { pdfs, isProcessing, processingError, uploadPDF, deletePDF };
}
