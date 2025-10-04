import React, { useState, type ChangeEvent } from 'react';
import { useFitParser } from '../fit-file/useFitParser';
import SpeedChart from './SpeedChart';

const FitFileUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Use the custom hook to parse the file
  const { data, loading, error } = useFitParser(selectedFile);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.fit')) {
      setSelectedFile(file);
    } else if (file) {
      alert('Please select a valid .fit file.');
      setSelectedFile(null);
    } else {
      setSelectedFile(null);
    }
  };

  return (
    <div>
      <h2>.FIT File Parser</h2>
      <input type="file" accept=".fit" onChange={handleFileChange} />

      {loading && <p>⏳ **Loading and Parsing...**</p>}

      {error && <p style={{ color: 'red' }}>🚨 **Error:** {error}</p>}

      {data && (
        <div>
          <h3>Fit Data:</h3>
          <SpeedChart data={data} />
          {/* <JsonView
            data={data}
            clickToExpandNode={true}
            shouldExpandNode={allExpanded}
            style={darkStyles}
          /> */}
        </div>
      )}
    </div>
  );
};

export default FitFileUploader;
