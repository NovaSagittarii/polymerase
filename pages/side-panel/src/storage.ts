import { persistentAtom } from '@nanostores/persistent';
import { atom } from 'nanostores';
import { v4 as uuidv4 } from 'uuid';
import type { Peer } from 'peerjs';

const $peerId = persistentAtom<string>('peer-id', uuidv4());

if (!$peerId.get()) $peerId.set(uuidv4());

export { $peerId };

/**
 * Values:
 * - "" unset
 * - "leader" leader
 * - <leaderPeerId> primary peerId
 */
export const $peerConnect = persistentAtom<string>('peer-connect', '');

export const $peer = atom<Peer | null>(null);

export const $status = atom<string>('not ready');
