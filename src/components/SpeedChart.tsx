import { useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  HorizontalCoordinatesGenerator,
  VerticalCoordinatesGenerator,
} from 'recharts/types/cartesian/CartesianGrid';
import { type FitData, type FitDataRecord } from '../fit-file';

interface ChartDataPoint {
  timestamp: Date;
  speed: number;
  upperBound?: number;
  lowerBound?: number;
}

const CustomizedTooltip = ({ active, payload }: any) => {
  const isVisible = active && payload && payload.length;
  return (
    <div
      className="custom-tooltip"
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      {isVisible && (
        <>
          <p>{payload?.[0]?.payload?.formattedPace}</p>
          <pre>{JSON.stringify(payload?.[0]?.payload, null, 2)}</pre>
        </>
      )}
    </div>
  );
};

const SpeedChart = ({ data }: { data: FitData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartData, setDisplayedRecords] = useState<ChartDataPoint[]>([]);

  const pointsPerPixel = 0.5;
  const renderTime = (value: Date) => {
    const initialDate = data.activity.timestamp;
    const currentTime = new Date(value.getTime() - initialDate.getTime());
    // print currentTime in format 00m00s
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    const time =
      (hours ? `${hours.toString().padStart(2, '0')}h` : '') +
      (minutes ? `${minutes.toString().padStart(2, '0')}m` : '') +
      (seconds ? `${seconds.toString().padStart(2, '0')}s` : '');
    return time;
  };

  /**
   * Interpolates the given records with a specified interpolation length.
   * Calculates the interpolated speed between each records in a block.
   * Adds pace in decimal minutes per kilometer and formatted pace string to each record.
   *
   * @param records The list of FitDataRecords to interpolate.
   * @param interpolationLength The length of each interpolation block.
   * @returns The list of interpolated FitDataRecords with pace.
   */
  const createChartDataArray = (
    records: FitDataRecord[],
    interpolationLength: number
  ): ChartDataPoint[] => {
    const chartData: ChartDataPoint[] = [];
    let speedSum = 0;
    records.forEach((record, i) => {
      speedSum += record.speed;
      if ((i + 1) % interpolationLength === 0) {
        const timestamp = record.timestamp;
        const speed = speedSum / interpolationLength;
        chartData.push({
          timestamp,
          speed,
          lowerBound: 1,
          ...(i > 3 && i < 200
            ? {
                upperBound: 5,
              }
            : {}),
        });
        speedSum = 0;
      }
    });

    return chartData;
  };

  useEffect(() => {
    if (data?.records?.length) {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const interpolationLength = Math.floor(
        data.records.length / containerWidth / pointsPerPixel
      );

      const displayedRecords = createChartDataArray(
        data.records,
        interpolationLength
      );
      setDisplayedRecords(displayedRecords);
      console.log(displayedRecords.length);
      console.log(displayedRecords.slice(0, 10));
    }
  }, [data, containerRef.current?.offsetWidth]);

  const generateVerticalGridCoordinates: VerticalCoordinatesGenerator = ({
    width,
  }) => {
    return [width * 0.3, width * 0.8];
  };

  const generateHorizontalGridCoordinates: HorizontalCoordinatesGenerator = ({
    height,
  }) => {
    return [height * 0.3, height * 0.8];
  };
  return (
    <ResponsiveContainer ref={containerRef} height={300} width="100%">
      <AreaChart
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        data={chartData}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="timestamp" tick={false} />
        <YAxis />
        <CartesianGrid
          verticalCoordinatesGenerator={generateVerticalGridCoordinates}
          horizontalCoordinatesGenerator={generateHorizontalGridCoordinates}
        />
        <Tooltip content={CustomizedTooltip} />
        <Area
          type="monotone"
          dataKey="speed"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorUv)"
        />
        <Line
          dataKey="upperBound"
          stroke="#ff000033"
          dot={false}
        />
        <Line
          dataKey="lowerBound"
          stroke="#ff000033"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SpeedChart;
