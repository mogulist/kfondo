declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Map: new (
          container: HTMLElement,
          options: KakaoMapOptions,
        ) => KakaoMapInstance;
        Polyline: new (options: KakaoPolylineOptions) => KakaoPolylineInstance;
      };
    };
  }
}

export type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

export type KakaoMapOptions = {
  center: KakaoLatLng;
  level?: number;
};

export type KakaoMapInstance = Record<string, unknown>;

export type KakaoPolylineOptions = {
  path: KakaoLatLng[];
  strokeWeight?: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeStyle?: string;
};

export type KakaoPolylineInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
};
