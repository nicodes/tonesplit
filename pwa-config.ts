import {
    AssetType,
    defaultAssetName,
    defineConfig,
    minimal2023Preset as preset,
    ResolvedAssetSize
  } from '@vite-pwa/assets-generator/config'
  
const inputImage = 'src/lib/images/tone-split.svg'
const outputDir = '../../../static/'

  export default defineConfig({
    headLinkOptions: {
      preset: '2023'
    },
    preset: {
        ...preset,
        assetName: (type: AssetType, size: ResolvedAssetSize) => {
            return `${outputDir}${defaultAssetName(type, size)}`;
          }
    },
    images: [inputImage],
  })