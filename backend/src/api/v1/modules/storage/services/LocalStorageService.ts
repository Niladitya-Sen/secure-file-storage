import fs from "node:fs/promises";
import path from "node:path";
import type StorageService from "../interfaces/StorageService";

export default class LocalStorageService implements StorageService {
  private static readonly rootDir = path.join(process.cwd(), "storage");

  async upload(file: Buffer, key: string, contentType: string): Promise<void> {
    const filePath = path.join(LocalStorageService.rootDir, key);

    await fs.writeFile(filePath, file);
  }

  async download(key: string): Promise<Buffer> {
    const filePath = path.join(LocalStorageService.rootDir, key);

    const exists = await this.exists(filePath);

    if (!exists) {
      throw new Error(`File with key "${key}" does not exist.`);
    }

    return await fs.readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(LocalStorageService.rootDir, key);

    const exists = await this.exists(filePath);

    if (!exists) {
      throw new Error(`File with key "${key}" does not exist.`);
    }

    await fs.unlink(filePath);
  }

  async exists(path: string): Promise<boolean> {
    const childExists = await fs
      .access(path)
      .then(() => true)
      .catch(() => false);

    return childExists;
  }
}
