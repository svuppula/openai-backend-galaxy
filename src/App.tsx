
import React, { useState } from 'react'
import { Toaster, toast } from 'sonner'

const App = () => {
  const [text, setText] = useState("Once upon a time in a distant land, there lived a wise sage who shared knowledge with all who sought it. The sage's words would transform into vivid stories that captivated listeners and transported them to magical realms of imagination.");
  const [loading, setLoading] = useState({
    tts: false,
    image: false
  });

  const handleTextToSpeech = async () => {
    try {
      setLoading(prev => ({ ...prev, tts: true }));
      const response = await fetch('/api/media/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Text-to-speech failed');
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create an anchor element and simulate a click
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audio.zip';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Text-to-speech audio downloaded successfully');
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error(error.message || 'Failed to generate speech');
    } finally {
      setLoading(prev => ({ ...prev, tts: false }));
    }
  };

  const handleGenerateImage = async () => {
    try {
      setLoading(prev => ({ ...prev, image: true }));
      const response = await fetch('/api/media/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Image generation failed');
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create an anchor element and simulate a click
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images.zip';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Generated images downloaded successfully');
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error(error.message || 'Failed to generate images');
    } finally {
      setLoading(prev => ({ ...prev, image: false }));
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">AI API Service</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Generate Media from Text</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="text" className="block text-sm font-medium mb-1">
              Text Input
            </label>
            <textarea
              id="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[150px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text for generation..."
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              className={`px-4 py-2 rounded-md ${loading.tts 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium transition-colors`}
              onClick={handleTextToSpeech}
              disabled={loading.tts || !text}
            >
              {loading.tts ? 'Generating...' : 'Generate Speech (MP3)'}
            </button>
            
            <button
              className={`px-4 py-2 rounded-md ${loading.image 
                ? 'bg-green-300 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'} text-white font-medium transition-colors`}
              onClick={handleGenerateImage}
              disabled={loading.image || !text}
            >
              {loading.image ? 'Generating...' : 'Generate Images'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h2 className="text-lg font-medium mb-2">API Documentation</h2>
        <p className="mb-2">
          For full API documentation, visit{' '}
          <a 
            href="/api-docs" 
            className="text-blue-500 hover:text-blue-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            /api-docs
          </a>
        </p>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• POST /api/media/text-to-speech - Convert text to speech (MP3)</p>
          <p>• POST /api/media/generate-image - Generate images from text</p>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  )
}

export default App
