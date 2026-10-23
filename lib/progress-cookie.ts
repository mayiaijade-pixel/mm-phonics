import {deflateRawSync,inflateRawSync} from 'node:zlib';
// Versioned compression keeps all twelve units within a single browser cookie.
// Existing base64 JSON cookies remain readable after the upgrade.
export function encodeProgress(value:unknown){return 'z1.'+deflateRawSync(Buffer.from(JSON.stringify(value))).toString('base64url')}
export function decodeProgress(value:string){const raw=value.startsWith('z1.')?inflateRawSync(Buffer.from(value.slice(3),'base64url'),{maxOutputLength:32768}):Buffer.from(value,'base64url');return JSON.parse(raw.toString('utf8'))}
