import type { COLORS } from './const.js';
import type { TupleToUnion } from 'type-fest';
import type { ProtocolWithReturn } from 'webext-bridge';

declare module 'webext-bridge' {
  export type HandshakeRequest = string;
  export type HandshakeResponse = 'Yes' | 'No';
  export type SubmitRequest = Record<string, string | number | boolean | undefined>[];
  export type SubmitResponse = string;
  export interface ProtocolMap {
    Handshake: ProtocolWithReturn<HandshakeRequest, HandshakeResponse>;
    Submit: ProtocolWithReturn<SubmitRequest, SubmitResponse>;
  }
}

export type * from 'type-fest';
export type ColorType = 'success' | 'info' | 'error' | 'warning' | keyof typeof COLORS;
export type ExcludeValuesFromBaseArrayType<B extends string[], E extends (string | number)[]> = Exclude<
  TupleToUnion<B>,
  TupleToUnion<E>
>[];
export type ManifestType = chrome.runtime.ManifestV3;
