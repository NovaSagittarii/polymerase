import Dexie from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import type { EntityTable } from 'dexie';
import type { Peer, DataConnection } from 'peerjs';

type StoredType = Record<string, string | number | boolean>;

export interface IObjectStorage {
  setItem(type: string, id: string, value: StoredType): Promise<void>;
  getItem(type: string, id: string): Promise<StoredType | undefined>;
  removeItem(type: string, id: string): Promise<void>;
}

export class UnsetLocalStorage implements IObjectStorage {
  async setItem(_type: string, _id: string, _value: StoredType) {}
  async getItem(_type: string, _id: string) {
    return { notice: 'Storage is not implemented.' };
  }
  async removeItem(_type: string, _id: string) {}
}

export class DexieStorage implements IObjectStorage {
  private db;
  constructor() {
    this.db = new Dexie('db') as Dexie & {
      obj: EntityTable<StoredType, '[type+id]'>;
    };
    this.db.version(1).stores({
      obj: '[type+id]',
    });
  }
  async setItem(type: string, id: string, value: StoredType) {
    this.db.obj.put({ ...value, type, id });
  }
  async getItem(type: string, id: string) {
    return await this.db.obj.get([type, id]);
  }
  async removeItem(type: string, id: string) {
    this.db.obj.delete([type, id]);
  }
}

/**
 * localStorage interface backed by dexieJS, setup budget RPC server over webRTC
 */
export class PeerDexieStorage extends DexieStorage {
  private peer;
  constructor(peer: Peer) {
    super();
    this.peer = peer;
    this.peer.on('connection', conn => {
      conn.on('data', async data => {
        try {
          const d = JSON.parse(data as string);
          if (d.req) {
            console.warn('Missing request id.', d);
            return;
          }
          let ret = {};
          switch (d.type) {
            case 'get': {
              ret = { ...(await this.getItem(d.payload.type, d.payload.id)) };
              break;
            }
            case 'set': {
              await this.setItem(d.payload.type, d.payload.id, d.payload);
              break;
            }
            case 'del': {
              await this.removeItem(d.payload.type, d.payload.id);
              break;
            }
            default:
              console.warn(`Unsupported RPC packet type ${d.type}`, d);
              return;
          }
          const msg = {
            id: d.id,
            res: ret,
          };
          // console.log('response', msg);
          conn.send(JSON.stringify(msg), true);
        } catch (e) {
          console.warn('invalid data', e);
        }
      });
    });
  }
}

/**
 * webRTC client connection to a localStorage-like primary db
 */
export class PeerStorage implements IObjectStorage {
  private conn;
  private cb: Record<string, (arg0: StoredType) => void> = {};
  constructor(conn: DataConnection) {
    this.conn = conn;
    this.conn.on('data', data => {
      try {
        const d = JSON.parse(data as string);
        // console.log('rcv', d);
        if (!d.id) console.warn('Received message without rpc-id', d);
        else if (this.cb[d.id]) this.cb[d.id](d.res);
      } catch (e) {
        console.warn('invalid data', e);
      }
    });
  }
  private async rpc(type: 'get' | 'set' | 'del', payload: StoredType): Promise<StoredType> {
    const msg = {
      id: uuidv4(),
      type,
      payload,
    };
    // console.log('rpc', msg);
    return new Promise(res => {
      this.cb[msg.id] = res;
      this.conn.send(JSON.stringify(msg), true);
    });
  }
  async setItem(type: string, id: string, value: StoredType) {
    if (value.type != type) throw new Error('type does not match');
    if (value.id != id) throw new Error('id does not match');
    await this.rpc('set', value);
  }
  async getItem(type: string, id: string) {
    return await this.rpc('get', { type, id });
  }
  async removeItem(type: string, id: string) {
    await this.rpc('del', { type, id });
  }
}
