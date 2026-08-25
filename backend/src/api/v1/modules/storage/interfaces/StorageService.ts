export default interface StorageService {
  upload(file: Buffer, key: string, contentType: string): Promise<void>;

  download(key: string): Promise<Buffer>;

  delete(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;
}
