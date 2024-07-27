import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Marker {
  id: number;
  title: string;
  description: string;
  color: string;
  enabled: boolean;
}

const SidePanel: React.FC<{
  wordCount: number;
  charCount: number;
  onProcess: () => void;
  loading: boolean;
}> = ({ wordCount, charCount, onProcess, loading }) => {
  const [markers, setMarkers] = useState<Marker[]>([
    { id: 1, title: 'Linguistic errors', description: 'Fix grammar and orthographic errors', color: '#FF0000', enabled: true },
    { id: 2, title: 'Consistency', description: 'Make the document consistent', color: '#00FF00', enabled: true },
  ]);
  const [context, setContext] = useState('');
  const [showNewMarkerForm, setShowNewMarkerForm] = useState(false);
  const [newMarkerTitle, setNewMarkerTitle] = useState('');
  const [newMarkerDescription, setNewMarkerDescription] = useState('');

  const addNewMarker = () => {
    if (newMarkerTitle && newMarkerDescription) {
      const newMarker: Marker = {
        id: markers.length + 1,
        title: newMarkerTitle,
        description: newMarkerDescription,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        enabled: true,
      };
      setMarkers([...markers, newMarker]);
      setNewMarkerTitle('');
      setNewMarkerDescription('');
      setShowNewMarkerForm(false);
    }
  };

  const toggleMarker = (id: number) => {
    setMarkers(markers.map(marker => 
      marker.id === id ? { ...marker, enabled: !marker.enabled } : marker
    ));
  };

  const deleteMarker = (id: number) => {
    setMarkers(markers.filter(marker => marker.id !== id));
  };

  return (
    <div className="w-1/4 bg-gray-50 shadow-lg p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4">Markers</h2>
      <TooltipProvider>
        {markers.map(marker => (
          <div key={marker.id} className="flex items-center mb-2">
            <Checkbox
              checked={marker.enabled}
              onCheckedChange={() => toggleMarker(marker.id)}
              className="mr-2 border-gray-400 text-blue-500"
            />
            <div className="flex-grow mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span 
                    className="cursor-help truncate inline-block"
                    style={{
                      textDecoration: `underline wavy ${marker.color}`,
                      textDecorationThickness: '1px',
                      textUnderlineOffset: '4px',
                    }}
                  >
                    {marker.title}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{marker.description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-6 w-6 text-gray-500 hover:text-gray-700" 
              onClick={() => deleteMarker(marker.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </TooltipProvider>
      
      {!showNewMarkerForm && (
        <Button 
          onClick={() => setShowNewMarkerForm(true)} 
          className="mt-2 text-gray-500 bg-gray-100 hover:bg-gray-200"
          variant="ghost"
        >
          <Plus className="w-4 h-4 mr-2" /> New Marker
        </Button>
      )}
      
      {showNewMarkerForm && (
        <div className="mt-2">
          <Input
            placeholder="Marker Title"
            value={newMarkerTitle}
            onChange={(e) => setNewMarkerTitle(e.target.value)}
            className="mb-2"
          />
          <Textarea
            placeholder="Marker Description"
            value={newMarkerDescription}
            onChange={(e) => setNewMarkerDescription(e.target.value)}
            className="mb-2"
          />
          <Button 
            onClick={addNewMarker}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Add Marker
          </Button>
        </div>
      )}
      
      <h2 className="text-lg font-semibold mt-6 mb-4">Context</h2>
      <Textarea
        className="w-full h-32 resize-none"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Add any additional context or notes here..."
      />

      <div className="mt-auto">
        <div className="text-sm text-gray-500 mb-2">
          <div className="flex justify-between">
            <span>Words:</span>
            <span className="font-bold">{wordCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Characters:</span>
            <span className="font-bold">{charCount}</span>
          </div>
        </div>

        <p className="text-sm text-yellow-600 mb-2">
          <strong>Note:</strong> AI is used to perform the analysis. Results may not always be accurate.
        </p>

        <Button
          className="w-full bg-blue-500 text-white hover:bg-blue-600"
          onClick={onProcess}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Process'}
        </Button>
      </div>
    </div>
  );
};

export default SidePanel;