import React, {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useState,
} from 'react';

export interface ZeppTrainningInterval {
  type: string;
}

export interface ZeppTrainningIntervalParent {
  type: 'PARENT';
  children: ZeppTrainningInterval[];
}

export interface ZeppTrainningIntervalCircle {
  type: 'CIRCLE';
  circleTimes: number;
  children: ZeppTrainningInterval[];
}

export interface ZeppTrainningIntervalNode {
  type: 'NODE';
  trainingInterval: ZeppTrainningIntervalNodeData;
}
export interface ZeppTrainningIntervalNodeData {
  intervalType: string;
  intervalUnit: string;
  intervalUnitValue: string;
  alertRule: string;
  alertRuleDetail: string;
  lengthUnit: number;
  intervalDesc: string;
}

export interface ZeppTrainningTemplate {
  title: string;
  description: string;
  trainingIntervals: ZeppTrainningIntervalParent;
}

interface ZeppTrainningTemplateProps {
  /**
   * Callback function that receives the parsed JSON object.
   * @param data The JSON object fetched from the URL.
   */
  onDataRead: (data: ZeppTrainningTemplate | null) => void;
}

/**
 * A React component to fetch JSON data from a user-provided URL.
 * It provides an input field for the URL and manages the fetching state.
 */
const ZeppTrainningTemplate: React.FC<ZeppTrainningTemplateProps> = ({
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

      const data: ZeppTrainningTemplate = await response.json();

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

export default ZeppTrainningTemplate;
