export type CrawlerRecord = {
  BIB_NO: number;
  Gender: string;
  Event: string;
  Time: string;
  Status: string;
  StartTime?: string;
  FinishTime?: string;
};

export type CrawlerType = "sptc" | "smartchip";

export type CrawlerConfig = {
  eventName: string;
  eventId: string;
  startBib: number;
  endBib: number;
  period: number;
  outputFile: string;
};

export type CrawlerFunction = (
  config: CrawlerConfig
) => Promise<CrawlerRecord[]>;
