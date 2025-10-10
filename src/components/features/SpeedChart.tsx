import {
  calculatePaceDecimal,
  formatPace,
  type FitDataRecordWithPace,
} from '@/lib/fit-file';
import {
  type TrainningData,
  type TrainningInterval,
} from '@/lib/trainning/types';
import { getColorForIntensity } from '@/lib/trainning/utils';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { VerticalCoordinatesGenerator } from 'recharts/types/cartesian/CartesianGrid';
import type { ContentType } from 'recharts/types/component/Tooltip';

interface ChartPointData extends FitDataRecordWithPace {
  upperBound?: number;
  lowerBound?: number;
  time: number;
  speedBoundMin?: number;
  speedBoundMax?: number;
}

const CustomizedTooltip: ContentType<number, string> = (props) => {
  const { active, payload, coordinate } = props;
  const isVisible = active && payload && payload.length;

  const renderTime = (totalSeconds: number) => {
    const currentTime = new Date(totalSeconds * 1000);
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    const time =
      (hours ? `${hours.toString().padStart(2, '0')}h` : '') +
      (minutes ? `${minutes.toString().padStart(2, '0')}m` : '') +
      (seconds ? `${seconds.toString().padStart(2, '0')}s` : '');
    return time;
  };

  const pointData: ChartPointData = payload?.[0]?.payload;

  if (!pointData) return <></>;

  return (
    <div
      className="custom-tooltip"
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      {isVisible && (
        <>
          <p>{pointData.formattedPace}</p>
          <p>{renderTime(pointData.time)}</p>
          <p>{pointData.time}</p>
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

interface ChartTickData {
  value: number;
  label: string;
}

interface ChartData {
  points: ChartPointData[];
  intervals: ChartIntervalData[];
  ticksSecondsAxis: ChartTickData[];
  ticksSpeedAxis: ChartTickData[];
  ticksAltitudeAxis: ChartTickData[];
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
const createChartPointsDataArray = (
  records: FitDataRecordWithPace[],
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
  const [chartData, setChartData] = useState<ChartData>({
    points: [],
    intervals: [],
    ticksSecondsAxis: [],
    ticksSpeedAxis: [],
    ticksAltitudeAxis: [],
  });

  const pointsPerPixel = 0.5;

  useEffect(() => {
    if (data.data.records?.length) {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const interpolationLength = Math.floor(
        data.data.records.length / containerWidth / pointsPerPixel
      );

      const points = createChartPointsDataArray(
        data.data.records,
        interpolationLength,
        data.intervals
      );

      const totalTimeInSeconds = data.data.activity.total_timer_time;

      let currentTimeInSeconds = 0;
      const intervals = data.intervals.map((interval) => {
        const intervalData: ChartIntervalData = {
          startRate: currentTimeInSeconds / totalTimeInSeconds,
          color: getColorForIntensity(interval.intensity),
        };
        currentTimeInSeconds += interval.durationInSeconds;
        return intervalData;
      });

      const ticksSecondsAxis = data.kmTimesInSeconds.map((seconds, i) => ({
        value: seconds,
        label: `${i + 1}km`,
      }));

      const maxSpeed = Math.max(...data.data.records.map((p) => p.speed));
      const averageSpeed = Number(data.statistics.averageSpeed.toFixed(2));
      const minSpeed = Math.min(...data.data.records.map((p) => p.speed));
      const ticksSpeedAxis = [minSpeed, averageSpeed, maxSpeed].map(
        (speed) => ({
          value: speed,
          label: formatPace(calculatePaceDecimal(speed)),
        })
      );

      const maxAltitude = Math.max(...data.data.records.map((p) => p.altitude));
      const minAltitude = Math.min(...data.data.records.map((p) => p.altitude));
      const ticksAltitudeAxis = [minAltitude, maxAltitude].map((altitude) => ({
        value: Math.round(altitude),
        label: `${altitude.toFixed(0)} m`,
      }));

      setChartData({
        points,
        intervals,
        ticksSecondsAxis,
        ticksSpeedAxis,
        ticksAltitudeAxis,
      });
    }
  }, [data, containerRef.current?.offsetWidth]);

  const generateVerticalGridCoordinates: VerticalCoordinatesGenerator =
    useCallback(
      ({ offset: { left, width } }) => {
        if (!chartData.intervals.length) return [];
        const totalTimeInSeconds = data.data.activity.total_timer_time;
        const gridCoordinates = chartData.ticksSecondsAxis.map((seconds) => {
          const rate = seconds.value / totalTimeInSeconds;
          return left + rate * width;
        });
        return gridCoordinates;
      },
      [data.data.activity.total_timer_time, chartData]
    );

  return (
    <>
      <ResponsiveContainer ref={containerRef} height={150} width="100%">
        <AreaChart
          margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
          data={chartData.points}
          syncId="syncronized-graphs"
        >
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="1" y2="0">
              {chartData.intervals.map((intervalData, i, intervalsData) => {
                const start = intervalData.startRate;
                const end =
                  i == intervalsData.length - 1
                    ? 1
                    : intervalsData[i + 1].startRate;
                const color = intervalData.color;
                return (
                  <Fragment key={`stop-grad-speed-${i}`}>
                    <stop offset={start} stopColor={color} />
                    <stop offset={end} stopColor={color} />
                  </Fragment>
                );
              })}
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={false} height={0} />

          <Label value="Velocidade" offset={0} position="insideTop" />
          <YAxis
            padding={{ top: 25, bottom: 10 }}
            strokeOpacity={0}
            ticks={chartData.ticksSpeedAxis.map((tick) => tick.value)}
            tickFormatter={(value) => formatPace(calculatePaceDecimal(value))}
          />
          <Tooltip content={CustomizedTooltip} />
          <Area
            type="monotone"
            dataKey="speed"
            strokeOpacity={0}
            fillOpacity={1}
            fill="url(#splitColor)"
          />
          <Line dataKey="speedBoundMin" stroke="#000000" dot={false} />
          <Line dataKey="speedBoundMax" stroke="#000000" dot={false} />
          <CartesianGrid
            verticalCoordinatesGenerator={generateVerticalGridCoordinates}
            horizontal={false}
          />
          <ReferenceLine y={data.statistics.averageSpeed} stroke="#ffff00" />
        </AreaChart>
      </ResponsiveContainer>
      <ResponsiveContainer ref={containerRef} height={150} width="100%">
        <AreaChart
          margin={{ top: 0, right: 30, left: 20, bottom: 15 }}
          data={chartData.points}
          syncId="syncronized-graphs"
        >
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="1" y2="0">
              {chartData.intervals.map((intervalData, i, intervalsData) => {
                const start = intervalData.startRate;
                const end =
                  i == intervalsData.length - 1
                    ? 1
                    : intervalsData[i + 1].startRate;
                const color = intervalData.color;
                return (
                  <Fragment key={`stop-gradient-${i}-min`}>
                    <stop offset={start} stopColor={color} />
                    <stop offset={end} stopColor={color} />
                  </Fragment>
                );
              })}
            </linearGradient>
          </defs>
          <Label value="Altitude" offset={15} position="insideTop" />
          <XAxis dataKey="time" tick={false} height={0} />
          <YAxis
            padding={{ top: 25 }}
            domain={[
              (dataMin) => Math.floor(dataMin),
              (dataMax) => Math.ceil(dataMax),
            ]}
            strokeOpacity={0}
            tickFormatter={(value) =>
              chartData.ticksAltitudeAxis.find((tick) => tick.value === value)
                ?.label || ''
            }
            ticks={chartData.ticksAltitudeAxis.map((tick) => tick.value)}
          />
          <CartesianGrid
            verticalCoordinatesGenerator={generateVerticalGridCoordinates}
            horizontal={false}
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
