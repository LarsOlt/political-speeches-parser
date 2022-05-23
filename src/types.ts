export interface Speech {
  Speaker: string;
  Topic: string;
  Date: string;
  Words: number;
}

export interface DownloadFilesResponse {
  errors: null | string[];
  data: {
    fileLocations: string[];
  } | null;
}
