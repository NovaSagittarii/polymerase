import { $localStorage, $peer, $peerConnect, $peerId, $status } from './storage';
import { PeerDexieStorage, PeerStorage, UnsetLocalStorage } from './storageAdapter';
import { useStore } from '@nanostores/react';
import { Peer } from 'peerjs';
import { useEffect, useState } from 'react';

export default function StorageManager() {
  const peerConnect = useStore($peerConnect);
  const peerId = useStore($peerId);
  const peer = useStore($peer);
  const status = useStore($status);
  const storage = useStore($localStorage);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const peer = new Peer(peerId);
    $status.set('Connecting to signaling server...');
    peer.on('open', () => $peer.set(peer));
    return () => {
      peer.destroy();
    };
  }, [peerId, attempts]);

  useEffect(() => {
    if (peer) {
      console.log('Connect', peerConnect);
      if (peerConnect === 'leader') {
        // primary
        $status.set('ready');
        $localStorage.set(new PeerDexieStorage(peer));
        peer.on('connection', conn => {
          conn.on('open', () => {
            console.log('open', conn.connectionId);
          });
          conn.on('data', data => {
            console.log('rcv', conn.connectionId, data);
          });
          conn.on('close', () => {
            console.log('close', conn.connectionId);
          });
        });
      } else if (peerConnect) {
        // client
        $status.set('Connecting to primary...');
        const conn = peer.connect(peerConnect, { reliable: true });
        const timeout = setTimeout(() => {
          setAttempts(x => x + 1);
        }, 5000);
        conn.on('open', () => {
          clearTimeout(timeout);
          $status.set('ready');
          $localStorage.set(new PeerStorage(conn));
          // setTimeout(() => {
          //   conn.send('hi!');
          //   console.log('sent');
          // }, 1000);
        });
        conn.on('close', () => {
          $status.set('disconnected');
          setAttempts(x => x + 1);
        });
      }
    }
    return () => {
      $localStorage.set(new UnsetLocalStorage());
    };
  }, [peer, peerConnect]);

  return (
    <div className="flex flex-col items-start text-sm">
      <div className="flex items-center gap-2">
        {'Status: '}
        <div className={`h-2 w-2 rounded-full ${status === 'ready' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
        {status}
      </div>
      <div>
        {'ID: '}
        <code>{peerId}</code>
      </div>
      <button
        onClick={() => {
          let res = prompt('leader id');
          if (res) {
            if (res === peerId) res = 'leader';
            $peerConnect.set(res);
          }
        }}>
        Connect
      </button>
      {!peerConnect ? (
        'Not connected'
      ) : peerConnect === 'leader' ? (
        'Is primary.'
      ) : (
        <div>
          {'To: '}
          <code>{peerConnect}</code>
        </div>
      )}
      <button
        onClick={async () => {
          console.log(await storage.getItem('test', prompt('id?') || 'A'));
        }}>
        Get
      </button>
      <button
        onClick={async () => {
          console.log(await storage.setItem('test', prompt('id?') || 'A', { val: prompt('val?') }));
        }}>
        Set
      </button>
    </div>
  );
}
