import { useEffect, useState, type ChangeEvent } from 'react';
import type { FitData } from '../fit-file';
import { useFitParser } from '../fit-file/useFitParser';

export interface FitFileUploaderProps {
  onDataRead?: (data: FitData | null) => void;
}

const FitFileUploader = ({ onDataRead }: FitFileUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Use the custom hook to parse the file
  const { data, loading, error } = useFitParser(selectedFile);

  useEffect(() => {
    onDataRead?.(data);
  }, [data]);

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
      <input type="file" accept=".fit" onChange={handleFileChange} />
      {loading && <p>⏳ Carregando e Analisando...</p>}
      {error && <p style={{ color: 'red' }}>🚨 Erro: {error}</p>}
    </div>
  );
};

export default FitFileUploader;
