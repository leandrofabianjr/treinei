import { useFitParser, type FitData } from '@/lib/fit-file';
import { Button, FileUpload } from '@chakra-ui/react';
import { useEffect, useState, type ChangeEvent } from 'react';
import { HiUpload } from 'react-icons/hi';

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
      <FileUpload.Root accept={['.fit', '.FIT']}>
        <FileUpload.HiddenInput onChange={handleFileChange} />
        <FileUpload.Trigger asChild>
          <Button variant="outline" size="sm" width="full">
            <HiUpload /> Enviar arquivo .FIT
          </Button>
        </FileUpload.Trigger>
        <FileUpload.List />
      </FileUpload.Root>
      {loading && <p>⏳ Carregando e Analisando...</p>}
      {error && <p style={{ color: 'red' }}>🚨 Erro: {error}</p>}
    </div>
  );
};

export default FitFileUploader;
