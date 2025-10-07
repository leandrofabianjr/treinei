import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  HorizontalCoordinatesGenerator,
  VerticalCoordinatesGenerator,
} from 'recharts/types/cartesian/CartesianGrid';
import {
  TrainningIntervalIntensity,
  type TrainningData,
  type TrainningInterval,
} from '../App';
import { type FitDataRecord } from '../fit-file';

interface ChartPointData extends FitDataRecord {
  upperBound?: number;
  lowerBound?: number;
  time: number;
  speedBoundMin?: number;
  speedBoundMax?: number;
}

const getColorForInterval = (interval: TrainningInterval): string => {
  switch (interval.intensity) {
    case TrainningIntervalIntensity.Walking:
      return '#3366AAaa';
    case TrainningIntervalIntensity.Jogging:
      return '#4499CCaa';
    case TrainningIntervalIntensity.Z1:
      return '#66CCCCaa';
    case TrainningIntervalIntensity.Z2:
      return '#FF9966aa';
    case TrainningIntervalIntensity.Z3:
      return '#CC3333aa';
    case TrainningIntervalIntensity.Z4:
      return '#990000aa';
    default:
      return 'white';
  }
};

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
          <p>{payload?.[0]?.payload?.time}</p>
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

interface ChartIntervalData {
  startRate: number;
  color: string;
}

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
  interpolationLength: number,
  intervals: TrainningInterval[]
): ChartPointData[] => {
  const chartData: ChartPointData[] = [];
  let speedSum = 0;
  const startTime = records[0].timestamp;
  records.forEach((record, i) => {
    speedSum += record.speed;
    if ((i + 1) % interpolationLength === 0) {
      const speed = speedSum / interpolationLength;
      const time = Math.floor(
        (record.timestamp.getTime() - startTime.getTime()) / 1000
      );
      const interval = intervals.find(
        (interval) =>
          interval.startTime.getTime() <= record.timestamp.getTime() &&
          interval.endTime.getTime() > record.timestamp.getTime()
      );
      const speedBoundMin = interval?.speedBounds?.min;
      const speedBoundMax = interval?.speedBounds?.max;

      chartData.push({
        ...record,
        speed,
        time,
        speedBoundMin,
        speedBoundMax,
      });
      speedSum = 0;
    }
  });

  return chartData;
};

const SpeedChart = ({ data }: { data: TrainningData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<ChartPointData[]>([]);
  const [intervalsData, setIntervalsData] = useState<ChartIntervalData[]>([]);

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

  useEffect(() => {
    if (data.data.records?.length) {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const interpolationLength = Math.floor(
        data.data.records.length / containerWidth / pointsPerPixel
      );

      const chartData = createChartDataArray(
        data.data.records,
        interpolationLength,
        data.intervals
      );
      setChartData(chartData);

      const totalTimeInSeconds = data.data.activity.total_timer_time;

      let currentTimeInSeconds = 0;
      const intervalsData = data.intervals.map((interval) => {
        const intervalData: ChartIntervalData = {
          startRate: currentTimeInSeconds / totalTimeInSeconds,
          color: getColorForInterval(interval),
        };
        currentTimeInSeconds += interval.durationInSeconds;
        return intervalData;
      });

      console.log(intervalsData);
      setIntervalsData(intervalsData);
    }
  }, [data, containerRef.current?.offsetWidth]);

  const generateVerticalGridCoordinates: VerticalCoordinatesGenerator =
    useCallback(
      ({ offset: { left, width } }) => {
        if (!intervalsData?.length) return [];
        const totalTimeInSeconds = data.data.activity.total_timer_time;
        let currentTimeInSeconds = 0;
        const gridCoordinates = data.kmTimesInSeconds.map((seconds) => {
          currentTimeInSeconds += seconds;
          const rate = currentTimeInSeconds / totalTimeInSeconds;
          return left + rate * width;
        });
        return gridCoordinates;
      },
      [
        data.data.activity.total_timer_time,
        data.kmTimesInSeconds,
        intervalsData?.length,
      ]
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
    <>
      <ResponsiveContainer ref={containerRef} height={150} width="100%">
        <AreaChart
          margin={{ top: 5, right: 30, left: 20, bottom: 0 }}
          data={chartData}
          syncId="syncronized-graphs"
        >
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="1" y2="0">
              {intervalsData.map((intervalData, i, intervalsData) => {
                const start = intervalData.startRate;
                const end =
                  i == intervalsData.length - 1
                    ? 1
                    : intervalsData[i + 1].startRate;
                const color = intervalData.color;
                return (
                  <>
                    <stop offset={start} stopColor={color} />
                    <stop offset={end} stopColor={color} />
                  </>
                );
              })}
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={false} />
          <YAxis
            domain={[0, (dataMax) => Math.ceil(dataMax)]}
            tickCount={2}
            tickFormatter={(value) => `${value} m/s`}
          />
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
            fill="url(#splitColor)"
          />
          <Line dataKey="speedBoundMin" stroke="#00ff73aa" dot={false} />
          <Line dataKey="speedBoundMax" stroke="#00ff73aa" dot={false} />
          <ReferenceArea
            x1={data.intervals[1].startTime.toString()}
            x2={data.intervals[1].endTime.toString()}
            y1={data.template.intervals[1].speedBounds?.min}
            y2={data.template.intervals[1].speedBounds?.max}
            stroke="red"
            strokeOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
      <ResponsiveContainer ref={containerRef} height={150} width="100%">
        <AreaChart
          margin={{ top: 0, right: 30, left: 20, bottom: 5 }}
          data={chartData}
          syncId="syncronized-graphs"
        >
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="1" y2="0">
              {intervalsData.map((intervalData, i, intervalsData) => {
                const start = intervalData.startRate;
                const end =
                  i == intervalsData.length - 1
                    ? 1
                    : intervalsData[i + 1].startRate;
                const color = intervalData.color;
                return (
                  <>
                    <stop offset={start} stopColor={color} />
                    <stop offset={end} stopColor={color} />
                  </>
                );
              })}
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={false} />
          <YAxis
            domain={[
              (dataMin) => Math.floor(dataMin),
              (dataMax) => Math.ceil(dataMax),
            ]}
            tickCount={2}
            tickFormatter={(value) => `${value} m`}
          />
          <CartesianGrid
            verticalCoordinatesGenerator={generateVerticalGridCoordinates}
            horizontalCoordinatesGenerator={generateHorizontalGridCoordinates}
          />
          {/* <Tooltip content={CustomizedTooltip} /> */}
          <Area
            type="monotone"
            dataKey="altitude"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#splitColor)"
          />
          <Line dataKey="upperBound" stroke="#ff000033" dot={false} />
          <Line dataKey="lowerBound" stroke="#ff000033" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default SpeedChart;
