import { Config } from "@stencil/core";
import { reactOutputTarget } from "@stencil/react-output-target";

export const config: Config = {
  namespace: "stencil",
  outputTargets: [
    reactOutputTarget({
      componentCorePackage: "stencil",
      proxiesFile: "../react/src/components/stencil/index.ts",
      includeDefineCustomElements: true,
    }),
    {
      type: "dist",
      esmLoaderPath: "../loader",
    },
    {
      type: "dist-custom-elements",
      dir: "./dist/components"
    },
    // {
    //   type: 'docs-readme',
    // },
    // {
    //   type: 'www',
    //   serviceWorker: null, // disable service workers
    // },
  ],
};
