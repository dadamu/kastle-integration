import { getDefaultConfig, Wallet } from "@rainbow-me/rainbowkit";
import { kairos, mainnet } from "wagmi/chains";
import { injected, createConnector } from "wagmi";

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
  chains: [kairos, mainnet],
  wallets: [
    {
      groupName: "Popular wallets",
      wallets: [kastleWallet],
    },
  ],
  ssr: true,
});
