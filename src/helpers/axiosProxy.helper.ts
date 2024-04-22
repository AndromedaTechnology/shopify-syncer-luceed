import url from "url";
import config from "../config";
import { AxiosProxyConfig } from "axios";

export class AxiosProxyHelper {
  static getProxy(): AxiosProxyConfig | undefined {
    if (!config.fixie_url) return undefined;

    const fixieUrl = url.parse(config.fixie_url);
    if (!fixieUrl || !fixieUrl.auth || !fixieUrl.hostname || !fixieUrl.port)
      return undefined;

    const fixieAuth = fixieUrl.auth.split(":");
    return {
      protocol: "http",
      host: fixieUrl.hostname,
      port: parseInt(fixieUrl.port),
      auth: { username: fixieAuth[0], password: fixieAuth[1] },
    };
  }
}
