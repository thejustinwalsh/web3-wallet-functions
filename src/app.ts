import { join } from "path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { fastifyEnv } from "@fastify/env";
import { FastifyPluginAsync, FastifyServerOptions } from "fastify";

export interface AppOptions
  extends FastifyServerOptions,
    Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  await fastify.register(fastifyEnv, {
    dotenv: true,
    schema: {
      type: "object",
      required: ["ZERION_API_KEY"],
      properties: {
        ZERION_API_KEY: {
          type: "string",
          default: "",
        },
      },
    },
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: Object.assign({}, opts, { prefix: "/api" }),
  });
};

export default app;
export { app, options };
