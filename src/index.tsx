import React, {
  useState,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
  Component,
} from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  NativeTouchEvent,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';
import Bezier from './bezier';
import Point from './point';
import { Brush, SoftBrush, HardBrush } from './brush';

export { Brush, SoftBrush, HardBrush };

export type SketchpadProps = {
  style?: ViewStyle;
  children?: React.ReactNode;
  brush?: Brush;
  minDistance?: number;
  backgroundColor?: string;
};
export type PathData = {
  brush: Brush;
  points: Array<{ x: number; y: number; time: number }>;
};
export type SketchpadRef = {
  clear: () => void;
  undo: () => void;
  toDataURL: (callback: (image: string) => void) => void;
  getData: () => PathData[];
  setData: (value: PathData[]) => void;
};
interface SvgRef extends Component {
  toDataURL: (callback: (image: string) => void) => void;
}

const Sketchpad = forwardRef<SketchpadRef, SketchpadProps>(
  (
    {
      style = null,
      children = null,
      brush = new SoftBrush('#000', 3, 5),
      minDistance = 5,
      backgroundColor = null,
    },
    ref
  ) => {
    const [size, setSize] = useState({
      width: 0,
      height: 0,
    });
    const [data, setData] = useState<PathData[]>([]);
    const [counter, update] = useState(0);
    const [touching, setTouching] = useState(false);
    const lastPath = useRef<PathData>({
      brush: brush,
      points: [],
    });
    const svg = useRef<SvgRef>(null);

    const doUpdate = () => {
      update((counter + 1) % 999999999);
    };
    const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
      const { width, height } = nativeEvent.layout;
      setSize({ width, height });
    };
    const strokeUpdate = (e: NativeTouchEvent) => {
      const point = new Point(e.locationX, e.locationY);
      const { points } = lastPath.current;
      const last = points[points.length - 1];
      const tooClose = last ? point.distanceTo(last) <= minDistance : false;
      // Skip this point if it's too close to the previous one
      if (!last || !(last && tooClose)) {
        points.push({
          time: point.time,
          x: point.x,
          y: point.y,
        });
        doUpdate();
      }
    };
    const strokeBegin = (e: NativeTouchEvent) => {
      lastPath.current = {
        brush: brush,
        points: [],
      };
      strokeUpdate(e);
    };
    const strokeEnd = (e: NativeTouchEvent) => {
      strokeUpdate(e);
      setData((prev) => [...prev, lastPath.current]);
    };
    const onTouchStart = ({ nativeEvent }: GestureResponderEvent) => {
      if (nativeEvent.touches.length === 1) {
        strokeBegin(nativeEvent.changedTouches[0]);
        setTouching(true);
      }
    };
    const onTouchMove = ({ nativeEvent }: GestureResponderEvent) => {
      strokeUpdate(nativeEvent.touches[0]);
    };
    const onTouchEnd = ({ nativeEvent }: GestureResponderEvent) => {
      strokeEnd(nativeEvent.changedTouches[0]);
      setTouching(false);
    };
    const renderPaths = (list: PathData[]) => {
      const paths: Array<Element> = [];
      let index = 0;
      list.forEach(({ brush: b, points }) => {
        if (points.length === 0) return;
        if (points.length === 1) {
          const p0 = points[0];
          paths.push(
            <Circle
              key={index++}
              r={b.dotSize() / 2}
              cx={p0.x}
              cy={p0.y}
              fill={b.color}
            />
          );
          return;
        }
        const lastPoints: Point[] = [];
        b.reset();
        points.forEach((p) => {
          lastPoints.push(new Point(p.x, p.y, p.time));
          if (lastPoints.length > 2) {
            if (lastPoints.length === 3) {
              lastPoints.unshift(lastPoints[0]);
            }
            const curve = Bezier.fromPoints(lastPoints);
            // Remove the first element from the list, so that there are no more than 4 points.
            lastPoints.shift();
            if (curve.isValid()) {
              const w = b.calcWidth(lastPoints[1], lastPoints[2]);
              paths.push(
                <Path
                  key={index++}
                  d={curve.toPath()}
                  stroke={b.color}
                  strokeWidth={w}
                  strokeLinecap="round"
                />
              );
            }
          }
        });
      });
      return paths;
    };
    useImperativeHandle(ref, () => ({
      clear: () => {
        setData([]);
      },
      undo: () => {
        const tmp = [...data];
        tmp.pop();
        setData(tmp);
      },
      toDataURL: (callback) => {
        svg.current?.toDataURL(callback);
      },
      getData: () => {
        return data;
      },
      setData: (value: PathData[]) => {
        setData(value);
      },
    }));
    const pathList = useMemo(() => renderPaths(data), [data]);
    return (
      <View
        style={style}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onStartShouldSetResponderCapture={() => true}
        onMoveShouldSetResponder={() => true}
        onMoveShouldSetResponderCapture={() => true}
        onResponderGrant={onTouchStart}
        onResponderMove={onTouchMove}
        onResponderRelease={onTouchEnd}
      >
        <Svg width={size.width} height={size.height} ref={svg}>
          {backgroundColor ? (
            <Rect
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              fill={backgroundColor}
            />
          ) : null}
          {children}
          <G>{pathList}</G>
          {touching ? <G>{renderPaths([lastPath.current])}</G> : null}
        </Svg>
      </View>
    );
  }
);

export default Sketchpad;
