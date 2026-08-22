export interface SearchDoc {
  id: string | number;
  [key: string]: unknown;
}

export interface IndexResult {
  taskID: number;
  objectIDs: string[];
}

export interface SearchHit {
  objectID: string;
  title: string;
}

export interface SearchResult {
  hits: SearchHit[];
  nbHits: number;
  processingTimeMS: number;
}

let taskSeq = 0;

export class SearchClient {
  async index(_indexName: string, docs: SearchDoc[]): Promise<IndexResult> {
    taskSeq += 1;
    return {
      taskID: taskSeq,
      objectIDs: docs.map((d) => String(d.id)),
    };
  }

  async query(q: string): Promise<SearchResult> {
    if (!q) {
      return { hits: [], nbHits: 0, processingTimeMS: 0 };
    }
    return {
      hits: [
        { objectID: '1', title: `Result matching "${q}"` },
        { objectID: '2', title: `Another match for "${q}"` },
      ],
      nbHits: 2,
      processingTimeMS: 0,
    };
  }
}
