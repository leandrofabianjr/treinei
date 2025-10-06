
import { useEffect, useState } from 'react';
import { type FitData } from './FitData';
import { readFitFile } from './utils';

/**
 * Parses a .fit file using fit-file-parser.
 *
 * @param file The File object selected by the user.
 * @returns An object containing the parsed FitData, loading state, and any error.
 */
export const useFitParser = (file: File | null) => {
  const [data, setData] = useState<FitData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    if (!file) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;

        readFitFile(
          buffer,
          (err: Error | null, data: unknown) => {
            console.log('Iniciou a leitura do fit');
            if (err) {
              console.error('FitParser error:', err);
              setError(`Parsing failed: ${err.message}`);
              setData(null);
            } else if (data) {
              setData(data as FitData);
            }
            setLoading(false);
          },
        );
      } catch (e) {
        const parseError = e as Error;
        console.error('File reading error:', parseError);
        setError(`File read failed: ${parseError.message}`);
        setData(null);
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading the file.');
      setData(null);
      setLoading(false);
    };

    // Read the file as an ArrayBuffer, which is required by fit-file-parser
    reader.readAsArrayBuffer(file);

    // Cleanup function for when the component unmounts or file changes
    return () => {
      reader.abort();
    };

  }, [file]); // Re-run effect when the file object changes

  return { data, loading, error };
};