# Web3 Wallet Functions
> Quick and dirty Web3 wrapper functions around the Zerion Wallet API

  - A quick and dirty wrapper around the Zerion Wallet API
  - Dead simple CORS policy to enable use from any domain for web / expo snack demonstration purposes
  - Not intended for production use

## Quick Start

.env file should contain the following:
```.env
ZERION_API_KEY=YOUR_API_KEY
SUNSET_DATE=DAY_TO_STOP_USING_API
```

```bash
# Development Server
vercel dev
# Deploy to Production
vercel deploy --prod
```

## Usage

```typescript 
const options: RequestInit = {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  };

  const address = "0x0x2eC2..."; // Wallet address
  const testnet = false; // Use testnet or mainnet

  const res = await fetch(
    `http://localhost:3000/api/wallet/${address}${
      testnet ? "?network=testnet" : ""
    }`,
    options
  );
  ```
