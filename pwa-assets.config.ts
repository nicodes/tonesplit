import {
  AssetType,
  defaultAssetName,
  defineConfig,
  minimal2023Preset,
  ResolvedAssetSize
} from '@vite-pwa/assets-generator/config'

const inputImage = 'src/lib/images/tone-split.svg'
const outputDir = '../../../static/'

export default defineConfig({
  headLinkOptions: {
    preset: '2023'
  },
  preset: {
    ...minimal2023Preset,
    // Move icons manually to outputDir, doesn't work for favicon.ico which is handled by package.json script
    assetName: (type: AssetType, size: ResolvedAssetSize) => {
      return `${outputDir}${defaultAssetName(type, size)}`
    }
  },
  images: [inputImage]
})
