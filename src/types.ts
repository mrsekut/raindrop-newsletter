export type Raindrop = {
  _id: number;
  title: string;
  link: string;
  excerpt: string;
  note: string;
  tags: string[];
  created: string;
  domain: string;
  type: string;
};

export type Summary = {
  raindrop: Raindrop;
  summary: string;
};

export type Cluster = {
  theme: string;
  summaryIndices: number[];
};

export type ClusterResult = {
  clusters: Cluster[];
  standalone: number[];
};

export type State = {
  lastRun: string; // ISO 8601
};

export type Config = {
  raindropToken: string;
  outputDir: string;
};
