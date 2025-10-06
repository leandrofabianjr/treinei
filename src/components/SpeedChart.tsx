import { useCallback, useEffect, useRef, useState } from 'react';
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
import type { TrainningData } from '../App';
import { type FitDataRecord } from '../fit-file';

interface ChartDataPoint extends FitDataRecord {
  upperBound?: number;
  lowerBound?: number;
}

const CustomizedTooltip = (props) => {
  const { active, payload, coordinate } = props;
  const isVisible = active && payload && payload.length;
  // started at: 10/03/2025 10:49:49
  const currentTime =
    (payload?.[0]?.payload?.timestamp.getTime() -
      new Date('2025-10-03 07:49:49').getTime()) /
    1000;
  return (
    <div
      className="custom-tooltip"
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      {isVisible && (
        <>
          <p>{payload?.[0]?.payload?.formattedPace}</p>
          <p>{currentTime}</p>
          <p>
            x:{coordinate?.x - 80}, y:{coordinate?.y}
          </p>
          <pre>{JSON.stringify(payload?.[0]?.payload, null, 2)}</pre>
        </>
      )}
    </div>
  );
};

const SpeedChart = ({ data }: { data: TrainningData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const pointsPerPixel = 0.5;
  const renderTime = (value: Date) => {
    const initialDate = data.data.activity.timestamp;
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
        const speed = speedSum / interpolationLength;
        chartData.push({ ...record, speed });
        speedSum = 0;
      }
    });

    return chartData;
  };

  useEffect(() => {
    if (data.data.records?.length) {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const interpolationLength = Math.floor(
        data.data.records.length / containerWidth / pointsPerPixel
      );

      const chartData = createChartDataArray(
        data.data.records,
        interpolationLength
      );
      setChartData(chartData);
    }
  }, [data, containerRef.current?.offsetWidth]);

  const generateVerticalGridCoordinates: VerticalCoordinatesGenerator =
    useCallback(
      ({ offset: { left, width } }) => {
        if (!data) return [];

        const totalTimeInSeconds = data.data.activity.total_timer_time;

        let currentTimeInSeconds = 0;
        const gridCoordinates = data.intervals.map((interval) => {
          const seconds = interval.durationInSeconds;
          currentTimeInSeconds += seconds;
          const rate = currentTimeInSeconds / totalTimeInSeconds;
          return left + rate * width;
        });

        return gridCoordinates;
      },
      [data]
    );

  const generateHorizontalGridCoordinates: HorizontalCoordinatesGenerator = (
    props
  ) => {
    const {
      height,
      yAxis: { niceTicks, range },
    } = props;
    const lastTick = Number(niceTicks?.[niceTicks.length - 1]);
    const lastRange = Number(range?.[range.length - 1]);
    return [(1 - data.statistics.averageSpeed / lastTick) * height - lastRange];
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
        <Line dataKey="upperBound" stroke="#ff000033" dot={false} />
        <Line dataKey="lowerBound" stroke="#ff000033" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SpeedChart;
