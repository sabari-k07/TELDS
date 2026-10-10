declare namespace JSX {
  interface Element {
    [elemName: string]: any;
  }
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare global {
  namespace JSX {
    interface Element {
      [elemName: string]: any;
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }

  namespace React {
    type ReactNode = any;
    type FC<P = {}> = (props: P) => any;
    type ReactElement<P = any, T = any> = any;
    type ComponentType<P = {}> = (props: P) => any;
    interface ChangeEvent<T = any> {
      target: T & { value: string; files?: FileList | null };
    }
    interface FormEvent<T = any> {
      preventDefault: () => void;
    }
    interface MouseEvent<T = any> {
      preventDefault: () => void;
    }
    interface CSSProperties {
      [key: string]: any;
    }
    interface Context<T> {
      Provider: any;
      Consumer: any;
    }
    const useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prev: T) => T)) => void];
    const useEffect: (effect: () => void | (() => void), deps?: any[]) => void;
    const useContext: <T>(context: Context<T> | any) => T;
    const createContext: <T>(defaultValue: T) => Context<T>;
    const useMemo: <T>(factory: () => T, deps?: any[]) => T;
    const useCallback: <T extends (...args: any[]) => any>(callback: T, deps?: any[]) => T;
    const useRef: <T>(initial?: T) => { current: T };
    const StrictMode: any;
    const Fragment: any;
  }
}

declare namespace React {
  type ReactNode = any;
  type FC<P = {}> = (props: P) => any;
  type ReactElement<P = any, T = any> = any;
  type ComponentType<P = {}> = (props: P) => any;
  interface ChangeEvent<T = any> {
    target: T & { value: string; files?: FileList | null };
  }
  interface FormEvent<T = any> {
    preventDefault: () => void;
  }
  interface MouseEvent<T = any> {
    preventDefault: () => void;
  }
  interface CSSProperties {
    [key: string]: any;
  }
  interface Context<T> {
    Provider: any;
    Consumer: any;
  }
  const useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prev: T) => T)) => void];
  const useEffect: (effect: () => void | (() => void), deps?: any[]) => void;
  const useContext: <T>(context: Context<T> | any) => T;
  const createContext: <T>(defaultValue: T) => Context<T>;
  const useMemo: <T>(factory: () => T, deps?: any[]) => T;
  const useCallback: <T extends (...args: any[]) => any>(callback: T, deps?: any[]) => T;
  const useRef: <T>(initial?: T) => { current: T };
  const StrictMode: any;
  const Fragment: any;
}

declare const React: {
  useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prev: T) => T)) => void];
  useEffect: (effect: () => void | (() => void), deps?: any[]) => void;
  useContext: <T>(context: React.Context<T> | any) => T;
  createContext: <T>(defaultValue: T) => React.Context<T>;
  useMemo: <T>(factory: () => T, deps?: any[]) => T;
  useCallback: <T extends (...args: any[]) => any>(callback: T, deps?: any[]) => T;
  useRef: <T>(initial?: T) => { current: T };
  StrictMode: any;
  Fragment: any;
  [key: string]: any;
};

declare module 'react' {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P) => any;
  export type ReactElement<P = any, T = any> = any;
  export type ComponentType<P = {}> = (props: P) => any;
  export interface ChangeEvent<T = any> {
    target: T & { value: string; files?: FileList | null };
  }
  export interface FormEvent<T = any> {
    preventDefault: () => void;
  }
  export interface MouseEvent<T = any> {
    preventDefault: () => void;
  }
  export interface CSSProperties {
    [key: string]: any;
  }
  export interface Context<T> {
    Provider: any;
    Consumer: any;
  }

  export const useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prev: T) => T)) => void];
  export const useEffect: (effect: () => void | (() => void), deps?: any[]) => void;
  export const useContext: <T>(context: Context<T> | any) => T;
  export const createContext: <T>(defaultValue: T) => Context<T>;
  export const useMemo: <T>(factory: () => T, deps?: any[]) => T;
  export const useCallback: <T extends (...args: any[]) => any>(callback: T, deps?: any[]) => T;
  export const useRef: <T>(initial?: T) => { current: T };
  export const StrictMode: any;
  export const Fragment: any;

  export namespace React {
    export type ReactNode = any;
    export type FC<P = {}> = (props: P) => any;
    export type ReactElement<P = any, T = any> = any;
    export type ComponentType<P = {}> = (props: P) => any;
    interface ChangeEvent<T = any> {
      target: T & { value: string; files?: FileList | null };
    }
    interface FormEvent<T = any> {
      preventDefault: () => void;
    }
    interface MouseEvent<T = any> {
      preventDefault: () => void;
    }
    interface CSSProperties {
      [key: string]: any;
    }
    interface Context<T> {
      Provider: any;
      Consumer: any;
    }
  }

  export default React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
  export namespace JSX {
    interface Element {
      [elemName: string]: any;
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react/jsx-dev-runtime' {
  export const jsxDEV: any;
  export const Fragment: any;
  export namespace JSX {
    interface Element {
      [elemName: string]: any;
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(children: any): void;
    unmount(): void;
  };
}

declare module 'lucide-react' {
  export const LayoutDashboard: any;
  export const Cpu: any;
  export const UploadCloud: any;
  export const AlertTriangle: any;
  export const FileSpreadsheet: any;
  export const HelpCircle: any;
  export const Zap: any;
  export const Gauge: any;
  export const TrendingUp: any;
  export const AlertOctagon: any;
  export const Clock: any;
  export const ShieldAlert: any;
  export const ShieldCheck: any;
  export const Activity: any;
  export const User: any;
  export const RefreshCw: any;
  export const RefreshCcw: any;
  export const AlertCircle: any;
  export const ChevronRight: any;
  export const CheckCircle2: any;
  export const FileText: any;
  export const Download: any;
  export const Sparkles: any;
  export const MessageSquare: any;
  export const ArrowRight: any;
  export const Filter: any;
  export const Calendar: any;
  export const MapPin: any;
  export const Users: any;
  export const PlusCircle: any;
  export const Check: any;
  export const X: any;
  export const Search: any;
  export const Info: any;
  export const Eye: any;
  export const Wifi: any;
  export const Radio: any;
  const icons: { [key: string]: any };
  export default icons;
}

declare module 'recharts' {
  export const ResponsiveContainer: any;
  export const ComposedChart: any;
  export const AreaChart: any;
  export const LineChart: any;
  export const BarChart: any;
  export const Area: any;
  export const Line: any;
  export const Bar: any;
  export const XAxis: any;
  export const YAxis: any;
  export const Tooltip: any;
  export const Legend: any;
  export const CartesianGrid: any;
  export const ReferenceLine: any;
}

declare module 'axios' {
  const axios: any;
  export default axios;
}

interface ImportMetaEnv {
  VITE_API_URL?: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
