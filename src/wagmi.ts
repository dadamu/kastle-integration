import { getDefaultConfig, Wallet } from "@rainbow-me/rainbowkit";
import { kairos, mainnet } from "wagmi/chains";
import { injected, createConnector } from "wagmi";
import { custom } from "viem";

const IGRA_DEV_NET_RPC_URL =
  "http://devnet.igralabs.com:8545/a2e19f37d58648c9b71c3a5f902d140e/";

const createCustomTransport = (url: string) =>
  custom({
    async request({ method, params }) {
      const body = JSON.stringify({
        jsonrpc: "2.0",
        id: Math.floor(Math.random() * 1000000),
        method,
        params: params || [],
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "RPC Error");
      }

      return data.result;
    },
  });

const kastleWallet = (): Wallet => ({
  id: "kastle",
  name: "Kastle",
  iconUrl:
    "https://cms.forbole.com/uploads/Kastle_logo_Symbolic_square_f12f4365c8.svg",
  downloadUrls: {
    chrome:
      "https://chromewebstore.google.com/detail/kastle/oambclflhjfppdmkghokjmpppmaebego?authuser=0&hl=en",
  },
  iconBackground: "#FFFFFF",
  createConnector: createKastleConnector(),
});

function getWindowProviderNamespace(namespace: string) {
  const providerSearch = (provider: any, namespace: string): any => {
    const [property, ...path] = namespace.split(".");
    const _provider = provider[property];
    if (_provider) {
      if (path.length === 0) return _provider;
      return providerSearch(_provider, path.join("."));
    }
  };
  if (typeof window === "undefined") return;
  const provider = providerSearch(window, namespace);
  if (provider) return provider;
}

function createKastleConnector() {
  return (walletDetails: any) => {
    const injectedConfig = {
      target: () => ({
        id: walletDetails.rkDetails.id,
        name: walletDetails.rkDetails.name,
        provider: getWindowProviderNamespace("kastle.ethereum"),
      }),
    };

    return createConnector((config) => ({
      ...injected(injectedConfig)(config),
      ...walletDetails,
    }));
  };
}

export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "YOUR_PROJECT_ID",
  chains: [
    {
      id: 2600,
      name: "Igra Devnet",
      rpcUrls: {
        default: {
          http: [IGRA_DEV_NET_RPC_URL],
        },
      },
      blockExplorers: {
        default: {
          name: "Igra Explorer",
          url: "https://brash-brash-grandmother.tryethernal.com",
        },
      },
      nativeCurrency: {
        decimals: 18,
        name: "Igra Devnet",
        symbol: "iKas",
      },
      transport: createCustomTransport(IGRA_DEV_NET_RPC_URL),
    },
    kairos,
    mainnet,
  ],
  wallets: [
    {
      groupName: "Popular wallets",
      wallets: [kastleWallet],
    },
  ],
  ssr: true,
});
