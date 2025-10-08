import { type ChangeEvent, type FormEvent, useCallback, useState } from 'react';
import type { TrainningTemplateReader } from '..';
import type { ZeppTrainningTemplate } from './types';
import { convertZeppTrainningTemplateToTrainningTemplate } from './utils';

/**
 * A React component to fetch JSON data from a user-provided URL.
 * It provides an input field for the URL and manages the fetching state.
 */
export const ZeppTrainningTemplateUploader: TrainningTemplateReader = ({
  onDataRead,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    // Clear previous error/data when the URL changes
    setError(null);
    onDataRead(null);
  };

  const fetchData = useCallback(async () => {
    if (!url) {
      setError('Please enter a URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    onDataRead(null); // Clear previous data

    try {
      const response = await fetch(url);

      if (!response.ok) {
        // Handle HTTP error statuses (404, 500, etc.)
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Check Content-Type to ensure it's likely JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not valid JSON (Content-Type mismatch).');
      }

      const zeppData: ZeppTrainningTemplate = await response.json();
      const data = convertZeppTrainningTemplateToTrainningTemplate(zeppData);

      // Send the fetched JSON object back to the parent element
      onDataRead(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Fetch Error:', errorMessage);
      setError(`Failed to fetch data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [url, onDataRead]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    fetchData();
  };

  return (
    <div
      style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
      >
        <label htmlFor="json-url">JSON Endpoint URL:</label>
        <input
          id="json-url"
          type="url"
          value={url}
          onChange={handleUrlChange}
          placeholder="e.g., https://api.example.com/data"
          required
          style={{
            flexGrow: 1,
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        />
        <button type="submit" disabled={isLoading || !url}>
          {isLoading ? 'Downloading...' : 'Fetch JSON'}
        </button>
      </form>

      {error && (
        <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>
          🚨 Error: {error}
        </p>
      )}

      {isLoading && (
        <p style={{ marginTop: '10px', color: '#007bff' }}>
          ⏳ Requesting and parsing data...
        </p>
      )}
    </div>
  );
};


export default ZeppTrainningTemplateUploader;