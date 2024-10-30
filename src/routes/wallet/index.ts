import { FastifyPluginAsyncZod, validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";
import { isAddress } from "viem";
import { z } from "zod";

const wallet: FastifyPluginAsyncZod = async (fastify, opts): Promise<void> => {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // TODO: CORS preflight, filter allowed origins that match expo-snack, localhost, and native user-agents
  fastify.options("/*", async function (_, reply) {
    reply.status(204)
      .header('Content-Length', '0')
      .header('Access-Control-Allow-Origin', '*')
      .header("Access-Control-Allow-Headers", "*")
      .header('Access-Control-Allow-Methods', 'GET')
      .send()
  });

  // GET /wallet/health
  fastify.get("/health", async function (request, reply) {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.status(200).send({ status: "ok" });
  });

  // GET /wallet/:address?network=testnet
  fastify.get(
    "/:address",
    {
      schema: {
        params: z.object({
          address: z.custom<string>(isAddress, "Invalid Address"),
        }),
        querystring: z.object({
          network: z.string().optional(),
        }),
      },
    },
    async function (request, reply) {
      reply.header('Access-Control-Allow-Origin', '*');

      const { ZERION_API_KEY } = fastify.getEnvs<{
        ZERION_API_KEY: string;
      }>();
      const { address } = request.params;
      const { network } = request.query;

      const isTestnet = network === "testnet";
      const chains = isTestnet
        ? ["ethereum-sepolia", "zero-sepolia"]
        : ["ethereum", "optimism", "polygon", "arbitrum"];
      const networkHeaders = { "x-env": "testnet" };

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: `Basic ${Buffer.from(
            ZERION_API_KEY + ":"
          ).toString("base64")}`,
          ...(isTestnet ? networkHeaders : {}),
        },
      };

      try {
        const res = await fetch(
          `https://api.zerion.io/v1/wallets/${address}/positions/?filter[positions]=only_simple&currency=usd&filter[position_types]=wallet&filter[chain_ids]=${chains.join(
            ","
          )}&filter[trash]=only_non_trash&sort=value`,
          options
        );
        const data = await res.json();
        reply.status(res.status).send(data);
      } catch (error) {
        reply.status(500).send({ error: (error as Error).message });
      }
    }
  );
};

export default wallet;
