import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'XB0fDUnXU5powFXDhCwa';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    const headers = new Headers();
    headers.set('Content-Type', 'audio/mpeg');
    
    return new NextResponse(response.data, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error('Text to speech error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to convert text to speech' },
      { status: 500 }
    );
  }
}