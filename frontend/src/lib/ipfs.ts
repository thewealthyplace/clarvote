// IPFS upload utility using nft.storage API
// Stores proposal metadata and returns the CID

const NFT_STORAGE_API = 'https://api.nft.storage/upload';

export interface ProposalMetadata {
  title: string;
  category: string;
  body: string;
  author: string;
  created: string;
  actions: { contract: string; function: string; args: string }[];
}

export async function uploadToIPFS(metadata: ProposalMetadata): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY;
  if (!apiKey) throw new Error('NFT_STORAGE_API_KEY not set');

  const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });

  const response = await fetch(NFT_STORAGE_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: blob,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`IPFS upload failed: ${response.status} ${text}`);
  }

  const json = await response.json();
  const cid: string = json.value?.cid;

  if (!cid) throw new Error('No CID returned from nft.storage');

  return cid;
}

export function cidToBytes32(cid: string): string {
  // Encode CID as a hex string for on-chain storage
  const encoder = new TextEncoder();
  const bytes = encoder.encode(cid);
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
