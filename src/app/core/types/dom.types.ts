export interface FileInputEvent extends Event {
  readonly target: HTMLInputElement & {
    files: FileList | null;
  };
}

export interface FileReaderResultEvent extends ProgressEvent<FileReader> {
  readonly target: FileReader & {
    result: string;
  };
}

export interface CameraOptions {
  readonly quality?: number;
  readonly allowEditing?: boolean;
  readonly resultType?: 'dataUrl' | 'file';
  readonly source?: 'camera' | 'gallery';
}

export interface CameraError extends Error {
  readonly code?: string;
  readonly message: string;
}