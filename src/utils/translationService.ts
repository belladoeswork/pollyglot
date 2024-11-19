import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface TranslationResponse {
    translatedText: string;
    error?: string;
}
  
export async function translateText(
    text: string,
    sourceLanguage: string
): Promise<TranslationResponse> {
    try {
    if (!text || !sourceLanguage) {
        return {
            translatedText: '',
            error: 'Missing required parameters'
        };

    }
        console.log('Translating:', { text, sourceLanguage });
        
    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                "role": "system",
                "content": `
                    You are a helpful and a professional translator. Translate the following text from ${sourceLanguage} to English
                    in the style of Google translate.
                  `
            
            },
            {
                "role": "user",
                "content": text
            }
        ]
    });

    const translatedText = completion.choices[0].message.content;
    
    if (!translatedText) {
      throw new Error('No translation received');
    }

    return { translatedText };
  } catch (error) {
    console.error('Translation error:', error);
    return { 
      translatedText: '', 
      error: error instanceof Error ? error.message : 'Failed to translate text' 
    };
  }
}