import { findCoverType } from '~/config/photobook/covers'
import { findLayout } from '~/config/photobook/layouts'
import { photoLibraries } from '~/config/photobook/library'
import { photobookPricing } from '~/config/photobook/pricing'
import { DEFAULT_PRESET, findPreset } from '~/config/photobook/presets'
import { createConfig, ENDPAPER_ID, normalize, withLayout } from '~/lib/photobook'
import type { LayoutId, PhotobookConfig, PresetId, PreviewView } from '~/types/photobook'

/** What the image picker is replacing: a slot of a spread, or the photo of a printed cover. */
export type PickerTarget = { kind: 'slot'; spreadId: string; slot: number } | { kind: 'cover' }

/**
 * The photobook studio state — one object for the whole page (hero, collections, configurator,
 * order modal), shared via useState and updated only through the actions below.
 * Every update goes through `normalize`, so options always stay valid for the chosen format and cover.
 */
export function usePhotobookStudio() {
  const config = useState<PhotobookConfig>('photobook-config', () => createConfig(DEFAULT_PRESET))
  const pickerTarget = useState<PickerTarget | null>('photobook-picker', () => null)
  const orderOpen = useState('photobook-order-open', () => false)
  /** Pose of the closed book in the preview: spine settings turn the book to show the spine. */
  const coverPose = useState<'three-quarter' | 'spine'>('photobook-cover-pose', () => 'three-quarter')

  const preset = computed(() => findPreset(config.value.selectedCollection))
  const library = computed(() => photoLibraries[preset.value.collection])
  const cover = computed(() => findCoverType(config.value.coverType))
  const spreadIndex = computed(() => config.value.spreads.findIndex((s) => s.id === config.value.activeSpreadId))
  const activeSpread = computed(() => config.value.spreads[spreadIndex.value])

  function update(patch: Partial<PhotobookConfig>) {
    config.value = normalize({ ...config.value, ...patch })
  }

  /** Shows the part of the book the visitor is editing (cover settings → cover, paper → spread …). */
  function focusView(view: PreviewView, spreadId?: string) {
    const patch: Partial<PhotobookConfig> = { activeView: view }
    if (spreadId) patch.activeSpreadId = spreadId
    else if (view === 'spread' && config.value.activeSpreadId === ENDPAPER_ID) {
      patch.activeSpreadId = config.value.spreads[0]!.id
    }
    config.value = { ...config.value, ...patch }
  }

  function applyPreset(id: PresetId) {
    config.value = createConfig(id, config.value)
    pickerTarget.value = null
  }

  function setLayout(spreadId: string, layout: LayoutId) {
    config.value = { ...config.value, spreads: withLayout(config.value, spreadId, layout) }
  }

  function setCaption(spreadId: string, caption: string) {
    config.value = {
      ...config.value,
      spreads: config.value.spreads.map((spread) =>
        spread.id === spreadId ? { ...spread, options: { ...spread.options, caption } } : spread,
      ),
    }
  }

  function setImage(target: PickerTarget, imageId: string) {
    if (target.kind === 'cover') {
      update({ coverImageId: imageId })
      return
    }
    config.value = {
      ...config.value,
      spreads: config.value.spreads.map((spread) => {
        if (spread.id !== target.spreadId) return spread
        const images = [...spread.images]
        images[target.slot] = imageId
        return { ...spread, images }
      }),
    }
  }

  /** Step through [endpaper, ...spreads]. */
  const pageSequence = computed(() => [ENDPAPER_ID, ...config.value.spreads.map((s) => s.id)])
  const sequenceIndex = computed(() => pageSequence.value.indexOf(config.value.activeSpreadId))

  function goTo(id: string) {
    config.value = { ...config.value, activeSpreadId: id, activeView: 'spread' }
  }

  function step(delta: number) {
    const target = pageSequence.value[sequenceIndex.value + delta]
    if (target) goTo(target)
  }

  function setQuantity(quantity: number) {
    update({ quantity: Math.min(photobookPricing.maxQuantity, Math.max(1, Math.round(quantity) || 1)) })
  }

  function visibleImages(spreadId: string): string[] {
    const spread = config.value.spreads.find((s) => s.id === spreadId)
    if (!spread) return []
    return spread.images.slice(0, findLayout(spread.layout).slots.length)
  }

  return {
    // Read-only for components: every change goes through an action.
    config: computed(() => config.value),
    preset,
    library,
    cover,
    activeSpread,
    spreadIndex,
    pageSequence,
    sequenceIndex,
    pickerTarget,
    orderOpen,
    coverPose,
    update,
    focusView,
    applyPreset,
    setLayout,
    setCaption,
    setImage,
    goTo,
    step,
    setQuantity,
    visibleImages,
  }
}
