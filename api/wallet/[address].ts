import type { VercelRequest, VercelResponse } from '@vercel/node';

export const revalidate = 0;
export const fetchCache = 'force-no-store'

// !HACK: Dead simple api expiration check
function isSunset(response: VercelResponse) {
  if (new Date(process.env.SUNSET_DATE ?? "1/1/2025").getTime() < new Date().getTime()) {
    response.status(410).json({ error: 'This service is no longer available' });
    return true;
  }
  return false;
}

// TODO: Validation ⏲️
export default async function (request: VercelRequest, response: VercelResponse) {
  if (isSunset(response)) return;

  // !HACK: Lazy CORS
  response.setHeader('Access-Control-Allow-Methods', 'GET');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', '*');
  if (request.method === 'OPTIONS') {
    console.log(request.method, request.headers.origin);
    response.status(204).send(null);
    return;
  }

  const { address, network } = request.query;
  const isTestnet = network === "testnet";
  
  const chains = isTestnet ? ["ethereum-sepolia", "zero-sepolia"] : ['ethereum', 'optimism', 'polygon', 'arbitrum'];
  const networkHeaders = { "x-env": "testnet" };

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Basic ${Buffer.from(process.env.ZERION_API_KEY+':').toString('base64')}`,
      ...(isTestnet ? networkHeaders : {})
    }
  };
  
  try {
    const res = await fetch(`https://api.zerion.io/v1/wallets/${address}/positions/?filter[positions]=only_simple&currency=usd&filter[position_types]=wallet&filter[chain_ids]=${chains.join(',')}&filter[trash]=only_non_trash&sort=value`, options);
    const data = await res.json();
    response.status(res.status).json(data);
  } catch (error) {
    response.status(500).json({ error: (error as Error).message });
  }
}