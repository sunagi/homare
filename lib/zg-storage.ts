import { ZgFile, Indexer, Batcher, KvClient } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import fs from 'fs';
import { Readable } from 'stream';

// Network Constants from .env.local
const RPC_URL = process.env.NEXT_PUBLIC_OG_CHAIN_RPC_URL || 'https://evmrpc-testnet.0g.ai';
const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai';
const FLOW_CONTRACT = process.env.NEXT_PUBLIC_TASK_REGISTRY_ADDRESS || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : undefined;
const indexer = new Indexer(INDEXER_RPC);

// File Upload
export async function uploadFile(filePath: string) {
  const file = await ZgFile.fromFilePath(filePath);
  const [tree, treeErr] = await file.merkleTree();
  if (treeErr !== null) throw new Error(`Error generating Merkle tree: ${treeErr}`);
  console.log('File Root Hash:', tree?.rootHash());
  if (!signer) throw new Error('Signer not initialized. Set PRIVATE_KEY in .env.local');
  const [tx, uploadErr] = await indexer.upload(file, RPC_URL, signer);
  if (uploadErr !== null) throw new Error(`Upload error: ${uploadErr}`);
  console.log('Upload successful! Transaction:', tx);
  await file.close();
  return { rootHash: tree?.rootHash(), txHash: tx };
}

// File Download
export async function downloadFile(rootHash: string, outputPath: string) {
  const err = await indexer.download(rootHash, outputPath, true);
  if (err !== null) throw new Error(`Download error: ${err}`);
  console.log('Download successful!');
}

// KV Upload
export async function uploadToKV(streamId: string, key: string, value: string) {
  const [nodes, err] = await indexer.selectNodes(1);
  if (err !== null) throw new Error(`Error selecting nodes: ${err}`);
  const batcher = new Batcher(1, nodes, FLOW_CONTRACT, RPC_URL);
  const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
  const valueBytes = Uint8Array.from(Buffer.from(value, 'utf-8'));
  batcher.streamDataBuilder.set(streamId, keyBytes, valueBytes);
  const [tx, batchErr] = await batcher.exec();
  if (batchErr !== null) throw new Error(`Batch execution error: ${batchErr}`);
  console.log('KV upload successful! TX:', tx);
}

// KV Download
export async function downloadFromKV(streamId: string, key: string) {
  const kvClient = new KvClient('http://3.101.147.150:6789');
  const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
  const value = await kvClient.getValue(streamId, ethers.encodeBase64(keyBytes));
  return value;
}

/**
 * 数値をKVストレージに保存
 */
export async function setNumber(streamId: string, key: string, value: number) {
  await uploadToKV(streamId, key, value.toString());
}

/**
 * KVストレージから数値を取得
 */
export async function getNumber(streamId: string, key: string): Promise<number> {
  const val = await downloadFromKV(streamId, key);
  if (val === null || val === undefined) throw new Error('No value found for key');
  return Number(val);
}

/**
 * 任意のJSONデータをKVストレージに保存
 */
export async function setJson(streamId: string, key: string, obj: any) {
  await uploadToKV(streamId, key, JSON.stringify(obj));
}

/**
 * KVストレージからJSONデータを取得
 */
export async function getJson<T>(streamId: string, key: string): Promise<T> {
  const val = await downloadFromKV(streamId, key);
  if (val === null || val === undefined) throw new Error('No value found for key');
  return JSON.parse(val) as T;
}

// Upload from stream
export async function uploadStream(data: string, filename: string) {
  const stream = new Readable();
  stream.push(data);
  stream.push(null);
  const file = await ZgFile.fromStream(stream, filename);
  if (!signer) throw new Error('Signer not initialized. Set PRIVATE_KEY in .env.local');
  const [tx, err] = await indexer.upload(file, RPC_URL, signer);
  if (err === null) {
    console.log('Stream uploaded!');
  }
  await file.close();
  return tx;
}

// Download as stream
export async function downloadStream(rootHash: string, outputPath: string) {
  const stream = await indexer.downloadFileAsStream(rootHash);
  stream.pipe(fs.createWriteStream(outputPath));
}
