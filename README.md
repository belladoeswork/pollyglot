# PollyGlot Translation App

A Next.js-based real-time translation application that supports speech-to-text, text-to-speech, and file uploads. The app uses OpenAI's model for translations and features a modern, responsive UI built with shadcn/ui components.

![PollyGlot Translation App Demo](https://magical-nasturtium-d3aa79.netlify.app/)

## Features

- Real-time translation to English from multiple languages
- Speech-to-text input capability
- Text-to-speech output for translations
- File upload support (.txt files, with PDF/DOC support coming soon)
- Modern, responsive UI with dark mode support
- Language selection
- Toast notifications for user feedback

## Prerequisites

- Node.js 16.x or later
- npm or yarn package manager
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pollyglot-translation.git
cd pollyglot-translation
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```
OPENAI_API_KEY=your_api_key_here
ELEVENLABS_API_KEY=your_api_key_here
```

## Running the Application

Development mode:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Tech Stack

- Next.js 14
- React
- TypeScript
- OpenAI API
- shadcn/ui components
- Tailwind CSS
- Lucide React Icons
- Sonner (Toast notifications)

## Important Notes

1. **File Upload Limitations**:
   - Maximum file size: 5MB
   - Supported formats: .txt (PDF/DOC support coming soon)
   - Implementation is coming up (cooking something special)

3. **Browser Compatibility**:
   - Speech-to-text requires browser permissions for microphone access
   - Text-to-speech requires modern browser support

4. **Rate Limiting**:
   - Be mindful of LLM API usage limits
   - Implement appropriate rate limiting for production use

![Same app other code here](https://github.com/belladoeswork/polly_flask.git)