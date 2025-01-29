import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleImageRecognition = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/image-recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResult(data);
        toast({
          title: "Success",
          description: "Image recognition completed",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const handleSpeechToText = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/speech-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResult(data);
        toast({
          title: "Success",
          description: "Speech to text completed",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process audio",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">AI Services Demo</h1>
      
      <div className="space-y-8">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Image Recognition</h2>
          <div className="space-y-4">
            <Input
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Button onClick={handleImageRecognition}>
              Analyze Image
            </Button>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Speech to Text</h2>
          <div className="space-y-4">
            <Input
              placeholder="Enter audio URL"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
            />
            <Button onClick={handleSpeechToText}>
              Convert Speech
            </Button>
          </div>
        </div>

        {result && (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;