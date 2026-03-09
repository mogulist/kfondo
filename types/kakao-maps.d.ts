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
        CustomOverlay: new (options: KakaoCustomOverlayOptions) => KakaoCustomOverlayInstance;
        Size: new (width: number, height: number) => KakaoSize;
        Point: new (x: number, y: number) => KakaoPoint;
        MarkerImage: new (
          src: string,
          size: KakaoSize,
          options?: KakaoMarkerImageOptions,
        ) => KakaoMarkerImage;
        Marker: new (options: KakaoMarkerOptions) => KakaoMarkerInstance;
        InfoWindow: new (options: KakaoInfoWindowOptions) => KakaoInfoWindowInstance;
        event: {
          addListener: (
            target: unknown,
            type: string,
            handler: () => void,
          ) => void;
        };
      };
    };
  }
}

export type KakaoSize = { width: number; height: number };
export type KakaoPoint = { x: number; y: number };

export type KakaoMarkerImageOptions = {
  offset?: KakaoPoint;
  spriteOrigin?: KakaoPoint;
  spriteSize?: KakaoSize;
};

export type KakaoMarkerImage = unknown;

export type KakaoMarkerOptions = {
  position: KakaoLatLng;
  image?: KakaoMarkerImage;
  map?: KakaoMapInstance | null;
};

export type KakaoMarkerInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
};

export type KakaoInfoWindowOptions = {
  position: KakaoLatLng;
  content: string | HTMLElement;
};

export type KakaoInfoWindowInstance = {
  open: (map: KakaoMapInstance, marker?: KakaoMarkerInstance) => void;
  close: () => void;
};

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

export type KakaoCustomOverlayOptions = {
  position: KakaoLatLng;
  content: string | HTMLElement;
  xAnchor?: number;
  yAnchor?: number;
};

export type KakaoCustomOverlayInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
};
