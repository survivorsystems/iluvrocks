type RegionProperties = {
  id: number
  name: string
  coverage: string
  primaryFinds: string
  geologyNotes: string
  personality: string
  color: string
  labelPoint: [number, number]
}

type RegionFeature = {
  type: 'Feature'
  properties: RegionProperties
  geometry: {
    type: 'Polygon'
    coordinates: [number, number][][]
  }
}

export const washingtonRockhoundingRegions = {
  type: 'FeatureCollection',
  features: [
    region(
      1,
      'North Olympic Coast & Strait',
      'Cape Flattery, Neah Bay, Sekiu, Clallam Bay, Port Angeles, outer coast',
      'Agate, carnelian, chalcedony, jasper, common opal, opalized wood, petrified wood, marine fossils, concretions',
      'Material eroded from marine sedimentary rocks, basalt, altered oceanic crust, beaches, and coastal drainages.',
      'Beachcombing country. Water-worn material.',
      '#355C6B',
      [-124.1, 48.25],
      [
        [-124.8, 47.85],
        [-124.8, 48.5],
        [-123.05, 48.5],
        [-123.05, 47.95],
        [-123.9, 47.82],
        [-124.8, 47.85],
      ],
    ),
    region(
      2,
      'Olympic Foothills & Hood Canal',
      'Eastern and southern Olympic Peninsula, Lake Cushman, Hood Canal, Mason County, eastern Jefferson, western Kitsap',
      'Red jasper, agate, chalcedony, chert, zeolites, quartz, calcite, epidote, manganese minerals, petrified or opalized wood, marine fossils',
      'Sandstone, shale, submarine basalt, manganese mineralization, and collectible zeolites in pillow basalt.',
      'Jasper, altered volcanic rock, and cavity minerals in wet forest geology.',
      '#56644A',
      [-123.35, 47.55],
      [
        [-124.05, 47.05],
        [-123.55, 48.05],
        [-122.7, 48.15],
        [-122.55, 47.25],
        [-123.2, 46.9],
        [-124.05, 47.05],
      ],
    ),
    region(
      3,
      'Willapa Hills & Southwest Coast',
      'Willapa Bay, Long Beach Peninsula, Raymond, South Bend, Grays Harbor, Chehalis Valley, western Lewis County',
      'Agate, carnelian, jasper, petrified wood, zeolites, quartz and calcite crystals, geodes, fossil clams, snails, crabs, lignite',
      'Marine basalt and fossil-bearing shallow-sea sedimentary rocks with documented fossil clams, gastropods, and crabs.',
      'Strong beginner region: river gravel, beach material, petrified wood, fossil-bearing sediment.',
      '#7A9AA8',
      [-123.75, 46.65],
      [
        [-124.25, 45.55],
        [-124.25, 47.1],
        [-123.15, 47.1],
        [-122.85, 46.15],
        [-123.45, 45.55],
        [-124.25, 45.55],
      ],
    ),
    region(
      4,
      'Puget Lowland & Islands',
      'Olympia to Everett, Kitsap Peninsula, Whidbey, Fidalgo, San Juan Islands, western Skagit and Whatcom lowlands',
      'Agate, jasper, quartz, quartzite, chert, granite and granodiorite erratics, basalt, greenstone, serpentinite, petrified wood, glacial erratics',
      'Glacial till and meltwater deposits moved material long distances. Beach and gravel banks can contain a mixed-bag of transported rock.',
      "Washington's mystery-bucket region. Glaciers mixed everything together.",
      '#B7A48A',
      [-122.55, 47.75],
      [
        [-123.15, 46.85],
        [-123.05, 48.85],
        [-121.95, 48.85],
        [-121.75, 47.0],
        [-122.45, 46.75],
        [-123.15, 46.85],
      ],
    ),
    region(
      5,
      'North Cascades & Skagit Highlands',
      'Mount Baker, eastern Whatcom and Skagit, Darrington, Glacier Peak, western North Cascades',
      'Quartz, smoky or amethystine quartz, pyrite, calcite, garnet, agate, geodes, rhodonite, hematite, zeolites, serpentinite, olivine-rich dunite, copper minerals, molybdenite, tourmaline',
      'Hard-rock mineral country with Walker Valley agate and geodes, Vesper-area garnet, French Creek rhodonite, quartz and pyrite near intrusive deposits, and Twin Sisters dunite.',
      'Crystals, garnet, ore minerals, and hard-rock collecting over casual beach finds.',
      '#355C6B',
      [-121.3, 48.35],
      [
        [-122.15, 47.75],
        [-122.0, 49.05],
        [-120.65, 49.05],
        [-120.35, 47.85],
        [-121.25, 47.55],
        [-122.15, 47.75],
      ],
    ),
    region(
      6,
      'Central Cascades & Snoqualmie',
      'Snoqualmie Pass, North Bend, eastern King County, southern Snohomish, Alpine Lakes, central Cascade crest',
      'Clear and smoky quartz, amethyst, pyrite, calcite, epidote, barite, zeolites, tourmaline, agate, jasper, geodes, copper minerals, fossil plants, realgar, orpiment',
      'Quartz pockets, altered volcanic rocks, mineralized mountain veins, and display-only arsenic-bearing minerals in specific districts.',
      'Crystal pockets, altered volcanic rocks, and mineralized mountain veins.',
      '#56644A',
      [-121.25, 47.2],
      [
        [-122.05, 46.55],
        [-121.8, 47.8],
        [-120.35, 47.8],
        [-120.45, 46.5],
        [-121.45, 46.25],
        [-122.05, 46.55],
      ],
    ),
    region(
      7,
      'South Cascades & Lower Columbia',
      'Mount Rainier to Mount Adams, eastern Pierce and Lewis, Cowlitz, Clark, Skamania, western Klickitat',
      'Agate, carnelian, jasper, petrified or opalized wood, quartz and calcite crystals, zeolites, geodes, thunderegg nodules, copper minerals, fossil leaves, wood, shells, basalt, andesite, pumice',
      'Multiple volcanic episodes, older sedimentary beds with plants and wood, fossil material, mercury and sulfide mineralization in historic districts.',
      'Volcanic chaos: lapidary material, cavity minerals, fossil wood, and complicated access.',
      '#7A9AA8',
      [-121.55, 46.05],
      [
        [-122.65, 45.5],
        [-122.45, 46.75],
        [-120.35, 46.75],
        [-120.25, 45.5],
        [-122.65, 45.5],
      ],
    ),
    region(
      8,
      'Kittitas, Teanaway & Yakima Fold Belt',
      'Cle Elum, Roslyn, Teanaway, Ellensburg, Liberty, Blewett Pass, Manastash, northern Yakima ridges',
      'Ellensburg Blue agate, gray, blue, clear, moss and carnelian agate, jasper, quartz, amethyst, calcite, pyrite, geodes, thundereggs, opal, opalized wood, petrified wood, rhodonite, placer gold',
      'Ellensburg Blue forms when silica-bearing groundwater travels through Teanaway Basalt. Publicly known areas include Teanaway, Red Top, First Creek, Reecer Creek, Liberty, Easton and nearby ridges.',
      "Washington's signature agate region. Locals are cagey about precise spots for good reason.",
      '#B7A48A',
      [-120.65, 47.05],
      [
        [-121.0, 46.45],
        [-120.15, 47.65],
        [-119.45, 47.45],
        [-119.55, 46.25],
        [-120.45, 46.1],
        [-121.0, 46.45],
      ],
    ),
    region(
      9,
      'Wenatchee, Chelan, Methow & Western Okanogan',
      'Wenatchee, Lake Chelan, Methow Valley, Lake Wenatchee, Leavenworth, Twisp, Winthrop, western Okanogan County',
      'Actinolite, garnet, quartz, amethyst, pyrite, calcite, beryl, fluorite, tourmaline, thulite, aventurine, agate, jasper, petrified wood, gold, silver, copper minerals',
      'Metamorphic and intrusive-rock collecting with garnet, amphiboles, pegmatite minerals, quartz, feldspar, and historic mining district material.',
      'Metamorphic and intrusive-rock country: garnet, amphiboles, pegmatite minerals, and old mining-district material.',
      '#355C6B',
      [-120.05, 48.15],
      [
        [-120.65, 47.45],
        [-120.75, 49.05],
        [-119.0, 49.05],
        [-118.85, 47.35],
        [-119.55, 47.2],
        [-120.65, 47.45],
      ],
    ),
    region(
      10,
      'Republic & Northeast Mountains',
      'Republic, Ferry County, Colville, Stevens County, Pend Oreille County, Metaline Falls, Newport, north of Spokane',
      'Quartz, amethyst, calcite, pyrite, barite, beryl, garnet, tourmaline, fluorite, agate, geodes, malachite, azurite, chrysocolla, petrified wood, gold, silver, lead-zinc ores, Eocene fossils, Paleozoic trilobites',
      'Republic lake beds, diverse Eocene fossils, gold, silver, lead, zinc, copper mineralization, and Paleozoic fossils in the Metaline area.',
      "Washington's broadest true mineral-collector region: fossils, crystals, ore minerals, and pegmatite all in one area.",
      '#56644A',
      [-118.25, 48.35],
      [
        [-119.1, 47.3],
        [-119.0, 49.05],
        [-116.9, 49.05],
        [-116.9, 47.25],
        [-118.2, 47.15],
        [-119.1, 47.3],
      ],
    ),
    region(
      11,
      'Columbia Basin & Channeled Scablands',
      'Vantage, Moses Lake, Quincy, Coulee City, Ephrata, Saddle Mountains, Hanford Reach, Tri-Cities, central eastern Washington',
      'Petrified wood, opalized wood, common opal, agate, carnelian, jasper, geodes, thundereggs, chalcedony-filled basalt cavities, diatomite, fossil leaves and vertebrates, Ice Age flood erratics',
      'Immense basalt flows, volcanic sediment, Ice Age flood deposits, petrified and opalized wood, agate, jasper, opal, and flood-redistributed material.',
      'Petrified-wood headquarters with silica-filled basalt and flood-redistributed material.',
      '#7A9AA8',
      [-119.25, 46.55],
      [
        [-120.3, 45.5],
        [-120.35, 47.35],
        [-118.2, 47.25],
        [-117.95, 45.7],
        [-119.1, 45.5],
        [-120.3, 45.5],
      ],
    ),
    region(
      12,
      'Palouse & Blue Mountains',
      'Spokane south through Cheney, Palouse, Pullman, Colfax, Walla Walla, Dayton, Pomeroy, Clarkston, Asotin County',
      'Common and precious opal, historic fire opal, opalized or petrified wood, agate, chalcedony, jasper, quartz and calcite crystals, basalt cavity minerals, diatomite, lignite, chert, greenstone, limestone, schist, diorite, fossil plants and mammals',
      'Historic fire opal near Pullman, crystal sites near Wawawai and Tekoa, petrified wood around Asotin Creek, and Blue Mountains basalt, chert, limestone, schist, greenstone, diorite, coal, and diatomite.',
      'Less obvious than Cascades but excellent for basalt geology, opalized wood, old opal occurrences, and deeply exposed terrane rocks.',
      '#B7A48A',
      [-117.45, 46.35],
      [
        [-118.25, 45.5],
        [-118.2, 47.25],
        [-116.9, 47.25],
        [-116.9, 45.5],
        [-118.25, 45.5],
      ],
    ),
  ],
} as const

export const washingtonRegionLabels = {
  type: 'FeatureCollection',
  features: washingtonRockhoundingRegions.features.map((feature) => ({
    type: 'Feature',
    properties: {
      id: feature.properties.id,
      name: feature.properties.name,
    },
    geometry: {
      type: 'Point',
      coordinates: feature.properties.labelPoint,
    },
  })),
} as const

function region(
  id: number,
  name: string,
  coverage: string,
  primaryFinds: string,
  geologyNotes: string,
  personality: string,
  color: string,
  labelPoint: [number, number],
  coordinates: [number, number][],
): RegionFeature {
  return {
    type: 'Feature',
    properties: {
      id,
      name,
      coverage,
      primaryFinds,
      geologyNotes,
      personality,
      color,
      labelPoint,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
  }
}
