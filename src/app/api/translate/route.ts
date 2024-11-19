import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '@/utils/translationService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, sourceLanguage } = body;
    
    if (!text || !sourceLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await translateText(text, sourceLanguage);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ translation: result.translatedText });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
