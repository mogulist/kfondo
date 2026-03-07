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
        LatLngBounds: new () => KakaoLatLngBounds;
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

export type KakaoMapInstance = {
  setBounds?: (bounds: KakaoLatLngBounds) => void;
} & Record<string, unknown>;

export type KakaoLatLngBounds = {
  extend: (latlng: KakaoLatLng) => void;
};

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
