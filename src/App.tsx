
import React, { useState, useEffect } from 'react'
import { Toaster, toast } from 'sonner'

const App = () => {
  const [text, setText] = useState("Create an engaging YouTube thumbnail for a tech review video about the latest smartphones");
  const [loading, setLoading] = useState({
    tts: false,
    image: false,
    video: false,
    animation: false
  });
  const [voiceType, setVoiceType] = useState('free'); // 'free' or 'premium'
  const [selectedVoice, setSelectedVoice] = useState('en-US'); // Default free voice
  const [imageCount, setImageCount] = useState(4); // Number of images to generate
  const [availableVoices, setAvailableVoices] = useState<{
    free: string[];
    premium: Record<string, string>;
    cloned?: Record<string, string>;
  }>({
    free: ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES'],  // Default values in case API fails
    premium: {
      'American Male': 'en-us-male',
      'American Female': 'en-us-female',
    },
    cloned: {}
  });

  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/media/available-voices');
        if (response.ok) {
          const voices = await response.json();
          setAvailableVoices(voices);
        } else {
          console.error('Failed to fetch voices');
          toast.error('Failed to load voices. Using default options.');
        }
      } catch (error) {
        console.error('Error fetching voices:', error);
        toast.error('Could not connect to voice service. Using default options.');
      }
    };

    fetchVoices();
  }, []);

  const handleApiRequest = async (endpoint: string, data: Record<string, any>, type: 'tts' | 'image' | 'video' | 'animation') => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      const response = await fetch(`/api/media/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If parsing JSON fails, use the status text
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create an anchor element and simulate a click
      const a = document.createElement('a');
      a.href = url;
      a.download = `collaborators-world-${endpoint}.zip`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${capitalizeFirstLetter(endpoint.replace(/-/g, ' '))} downloaded successfully`);
    } catch (error) {
      console.error(`${endpoint} error:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to generate ${endpoint.replace(/-/g, ' ')}`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleTextToSpeech = () => {
    // We'll make the API key optional
    const ttsData: { text: string; voice: string } = { 
      text,
      voice: selectedVoice
    };
    
    handleApiRequest('text-to-speech', ttsData, 'tts');
  };
  
  const handleGenerateImage = () => handleApiRequest('generate-image', { prompt: text, count: imageCount }, 'image');
  const handleGenerateVideo = () => handleApiRequest('generate-video', { prompt: text }, 'video');
  const handleGenerateAnimation = () => handleApiRequest('generate-animation', { prompt: text }, 'animation');

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Collaborators World Media Tools</h1>
      
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
              placeholder="Enter text for thumbnail generation or text-to-speech..."
            />
          </div>
          
          {/* Voice selection section */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-lg font-medium mb-3">Text-to-Speech Options</h3>
            
            <div className="flex gap-4 mb-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="free-voice"
                  name="voice-type"
                  value="free"
                  checked={voiceType === 'free'}
                  onChange={() => setVoiceType('free')}
                  className="mr-2"
                />
                <label htmlFor="free-voice">Free Voices (Local Model)</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="premium-voice"
                  name="voice-type"
                  value="premium"
                  checked={voiceType === 'premium'}
                  onChange={() => setVoiceType('premium')}
                  className="mr-2"
                />
                <label htmlFor="premium-voice">Premium Voices (No API Key Required)</label>
              </div>
              
              {availableVoices.cloned && Object.keys(availableVoices.cloned).length > 0 && (
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cloned-voice"
                    name="voice-type"
                    value="cloned"
                    checked={voiceType === 'cloned'}
                    onChange={() => setVoiceType('cloned')}
                    className="mr-2"
                  />
                  <label htmlFor="cloned-voice">Cloned Voices</label>
                </div>
              )}
            </div>
            
            {/* Conditional inputs based on voice type */}
            {voiceType === 'free' ? (
              <div className="mb-3">
                <label htmlFor="free-voice-select" className="block text-sm font-medium mb-1">
                  Select Language
                </label>
                <select
                  id="free-voice-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  {availableVoices.free.map((voice) => (
                    <option key={voice} value={voice}>{voice}</option>
                  ))}
                </select>
              </div>
            ) : voiceType === 'premium' ? (
              <div className="mb-3">
                <label htmlFor="premium-voice-select" className="block text-sm font-medium mb-1">
                  Select Voice
                </label>
                <select
                  id="premium-voice-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  {Object.entries(availableVoices.premium).map(([name, id]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-3">
                <label htmlFor="cloned-voice-select" className="block text-sm font-medium mb-1">
                  Select Cloned Voice
                </label>
                <select
                  id="cloned-voice-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  {availableVoices.cloned && Object.entries(availableVoices.cloned).map(([name, id]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Image generation options */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-lg font-medium mb-3">Image Generation Options</h3>
            <div className="mb-3">
              <label htmlFor="image-count" className="block text-sm font-medium mb-1">
                Number of Images (1-10)
              </label>
              <input
                id="image-count"
                type="number"
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={imageCount}
                onChange={(e) => setImageCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </div>
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
              {loading.image ? 'Generating...' : `Generate ${imageCount} Images`}
            </button>

            <button
              className={`px-4 py-2 rounded-md ${loading.video 
                ? 'bg-purple-300 cursor-not-allowed' 
                : 'bg-purple-500 hover:bg-purple-600'} text-white font-medium transition-colors`}
              onClick={handleGenerateVideo}
              disabled={loading.video || !text}
            >
              {loading.video ? 'Generating...' : 'Generate Video'}
            </button>

            <button
              className={`px-4 py-2 rounded-md ${loading.animation 
                ? 'bg-orange-300 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600'} text-white font-medium transition-colors`}
              onClick={handleGenerateAnimation}
              disabled={loading.animation || !text}
            >
              {loading.animation ? 'Generating...' : 'Generate Animation'}
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
          <p>• POST /api/media/generate-video - Generate video content</p>
          <p>• POST /api/media/generate-animation - Generate animation content</p>
          <p>• POST /api/media/clone-voice - Clone a voice using local models</p>
          <p>• GET /api/media/available-voices - Get list of available voices</p>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  )
}

export default App
