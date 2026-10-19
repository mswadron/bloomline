/* foliage-data.js
   Northeast Foliage tab data for Bloomline.

   Timing windows are for the NJ / NYC / Long Island / Philadelphia lowlands.
   Each window is [month, day]:  s = first color, p = peak, e = mostly bare.
   Other zones shift earlier by ZONES[].shift days (north turns first).
   Windows are typical-year estimates; a dry summer pulls them earlier,
   a warm wet fall pushes them later.

   colors = the sequence a leaf runs through on its way down, left to right.
   That sequence is what draws each card's color line.
   only = zones where the species is common; omitted means all zones.
   inat = extra iNaturalist names (a genus name means the whole genus) used to
   match live color reports to this card.
   zones[].bbox = [swlat, swlng, nelat, nelng] for the live iNaturalist query.
   stageWords / winText = optional wording overrides for plants that do not
   "turn and drop" in the usual way (evergreens, shrubs that hold leaves).
   noLive = skip the "no color reports" line (people rarely tag these). */

window.FOLIAGE_DATA = {

  zones: [
    { id: "north", label: "VT · NH · ME", bbox: [42.7, -75.8, 47.5, -66.9], shift: -18,
      note: "Northern New England, the Adirondacks and high Catskills. Peak usually early to mid October." },
    { id: "mid",   label: "CT · MA · Hudson", bbox: [40.9, -75.8, 42.9, -69.9], shift: -9,
      note: "Southern New England, the Hudson Valley and the Poconos. Peak usually mid to late October." },
    { id: "west",  label: "PA · Upstate NY", bbox: [39.7, -80.6, 43.4, -75.8], shift: -6,
      note: "Central and western Pennsylvania, the Finger Lakes and western New York. The Allegheny ridges and plateau peak mid to late October; the river valleys about a week later." },
    { id: "south", label: "NJ · NYC · LI", bbox: [38.9, -75.6, 41.4, -71.8], shift: 0,
      note: "Lowland coastal plain and Piedmont. Peak usually the last week of October into early November." },
    { id: "mdva",  label: "MD · DE · DC · VA", bbox: [37.5, -79.5, 39.8, -75.0], shift: 8,
      note: "Maryland, Delaware, DC and northern Virginia. The Blue Ridge and Shenandoah turn around the third week of October, a week or two ahead of the lowlands; the Chesapeake shore peaks into early November." }
  ],

  /* the season's overall color line, Sep 1 to Nov 30 (south zone) */
  seasonLine: [
    { md: [9, 1],   c: "#4d6b2f" },
    { md: [9, 25],  c: "#7a8a2c" },
    { md: [10, 8],  c: "#c9a227" },
    { md: [10, 18], c: "#d9781e" },
    { md: [10, 28], c: "#c0391b" },
    { md: [11, 8],  c: "#8a3a1e" },
    { md: [11, 20], c: "#7a5a3a" },
    { md: [11, 30], c: "#8c7d6a" }
  ],

  /* "How a leaf changes color": four chapters in the order the colors
     appear. green first, yellow next, red after, brown always last. */
  greenStory: {
    title: "Why green comes first",
    sub: "All spring and summer the leaf is a solar power plant. Green is the color of the machinery running.",
    parts: [
      { h: "Every leaf cell is full of solar panels",
        pts: [
          "Zoom into a leaf and you find millions of tiny cells.",
          "Each cell holds dozens of chloroplasts. Think of them as the cell's solar panels.",
          "Inside each panel is chlorophyll, the green pigment. It catches sunlight and the leaf turns that energy into sugar."
        ] },
      { h: "Why it looks green",
        pts: [
          "Chlorophyll soaks up the red and blue parts of sunlight to run the panels.",
          "It cannot use green light, so it bounces it back. That bounced green is what reaches your eye."
        ] },
      { h: "The yellow is already in there",
        pts: [
          "The same panels also hold yellow and orange pigments (carotenoids). They help catch light and work like built-in sunscreen.",
          "There is far more green than yellow, and the tree keeps rebuilding the green all summer as it wears out.",
          "So the green covers the yellow completely. It is there from day one; you just cannot see it yet."
        ] }
    ]
  },

  yellowStory: {
    title: "Why yellow comes next",
    sub: "Yellow is not painted on in fall. It is uncovered when the green is taken apart.",
    parts: [
      { h: "The shutdown signal",
        pts: [
          "Shorter days and cooler nights tell the tree winter is coming.",
          "A leaf would freeze and be useless in winter, so the tree gets ready to drop it. But first it saves what it can."
        ] },
      { h: "Recycling from the inside",
        pts: [
          "The chloroplasts are not peeled off or washed away. The cell takes them apart chemically, from within.",
          "The green chlorophyll and its proteins hold much of the leaf's nitrogen, a nutrient the tree works hard to get.",
          "The tree breaks them down and ships the nitrogen back through the stalk into the twigs and roots, stored for next spring.",
          "And the tree stops rebuilding the green. Once it is dismantled, it is gone."
        ] },
      { h: "The yellow is left standing",
        pts: [
          "The yellow pigments break down much more slowly than the green.",
          "So as the green disappears, the yellow that was hiding all year shows through.",
          "That is why yellow trees (birch, hickory, tulip tree, ginkgo) look about the same every year. The color was already there; weather barely changes it."
        ] }
    ]
  },

  redStory: {
    title: "Why red comes after",
    sub: "Red is the only fall color the tree makes new. Here is how, and why it keeps building right up to leaf drop.",
    parts: [
      { h: "The sugar trap",
        pts: [
          "Every sunny day, the leaf still makes sugar. That is its job.",
          "All summer, that sugar flows out through the leaf stalk to feed the tree.",
          "In fall the tree starts sealing the stalk where it meets the twig. A layer of cork-like cells grows across it.",
          "The exit closes. The sugar has nowhere to go. It piles up inside the leaf."
        ] },
      { h: "Sugar plus light makes red",
        pts: [
          "The leaf uses sunlight's energy to turn that trapped sugar into a brand-new red pigment (anthocyanin).",
          "Sugar does not turn red by itself in the sun. The leaf has to build the red, and building takes light.",
          "So the red is made fresh, in the last weeks. Yellow was there all year; red was not."
        ] },
      { h: "Why the red builds toward the end",
        pts: [
          "Each week the seal closes tighter, so more sugar stays trapped.",
          "Each week the green is thinner, so more light reaches the red-making machinery.",
          "Cool nights slow the sugar from leaking out and help the red form. That is why the last two weeks are the reddest.",
          "The red also works as fresh sunscreen. It shades the leaf while the tree finishes pulling the last nutrients out.",
          "What spoils it: cloudy, rainy weeks (less sugar) or a hard freeze (kills the leaf before the red forms)."
        ] },
      { h: "Next year's leaf is already there",
        pts: [
          "Look at where any leaf stalk meets the twig. Just above it sits a small bud.",
          "Inside that bud, next spring's leaves are already formed, tiny and folded. On many trees the flowers are in there too.",
          "The tree built that bud over the summer. The seal forms below it, so the old leaf falls and the bud stays on the twig for winter.",
          "The mark left behind is a leaf scar. Each bud sits right above one."
        ] }
    ],
    prune: {
      h: "Side note: when to trim",
      pts: [
        "Because next year's buds are already on the twig, a fall cut removes leaves (and often flowers) that were ready for spring.",
        "Fall cuts can also push out new shoots that do not harden before the freeze, so they die back.",
        "Best time for most trees: after the leaves are down and the tree is dormant, through late winter.",
        "Oaks: winter only. Cuts in the growing season draw the beetles that spread oak wilt.",
        "Spring-flowering shrubs (lilac, forsythia, azalea): trim right after they bloom, before they set next year's buds.",
        "Dead, broken or dangerous limbs: anytime."
      ]
    }
  },

  brownStory: {
    title: "Why brown is always last",
    sub: "Every leaf ends brown, whatever color it turned first. Brown is what is left when nothing else is.",
    parts: [
      { h: "Everything else breaks down first",
        pts: [
          "The green is dismantled and shipped out. The yellow fades. The red breaks down too once the leaf stops making it.",
          "When the cells finally die, nothing is left working inside the leaf."
        ] },
      { h: "What remains is brown",
        pts: [
          "Tannins, bitter compounds stored in the leaf all along, darken as they react with air.",
          "Add the dead cell walls and you get brown, tan and russet. No new pigment is made; brown is the leftovers.",
          "That is why it always comes last: it needs everything else to be gone."
        ] },
      { h: "Who stays brown longest",
        pts: [
          "Oaks and beeches are loaded with tannin, so they spend more of the season in russet and tan.",
          "Many young beeches and oaks hold their dry brown leaves all winter, the rattling leaves in a bare January woods.",
          "On the ground every leaf goes brown, and then it becomes soil for next year."
        ] }
    ]
  },

  pigments: [
    { name: "Chlorophyll", c: "#4d6b2f",
      text: "The green. Trees make it all summer and break it down in fall to salvage its nitrogen. Once it is gone, whatever else was in the leaf shows through." },
    { name: "Carotenoids", c: "#d9a521",
      text: "The yellows and oranges. They were in the leaf all summer, hidden under the green. That is why yellow trees look about the same every year: the color is already there." },
    { name: "Anthocyanins", c: "#b3261e",
      text: "The reds and purples. These are made new in fall, from sugar trapped in the leaf. Sunny days and cool nights (not freezing) make the most, which is why some years are red years." },
    { name: "Tannins", c: "#7a5a3a",
      text: "The browns. What is left when everything else breaks down. Oaks and beeches lean on these, so they finish in russet and tan." }
  ],

  whereFirst: [
    { h: "Wet ground first",
      t: "Swamp edges, stream banks and low wet spots color first. Red maple and black gum in a wet hollow can be scarlet while the hillside above is still green." },
    { h: "Stressed trees first",
      t: "A tree on a road shoulder, in a parking lot island, or with damaged roots often turns weeks early. A single red branch on a green maple usually means a girdled root or a wound on that limb." },
    { h: "Top and outside of the crown first",
      t: "The sunny, exposed outer shell of a tree turns before the shaded interior. On a sugar maple the sun side goes red or orange while the inside stays yellow longer." },
    { h: "North and high first",
      t: "Hilltops, north-facing slopes and cold air pockets in valleys turn before warm south-facing slopes at the same latitude." },
    { h: "Vines and shrubs before their trees",
      t: "Virginia creeper and poison ivy climbing a trunk go scarlet while the host tree is still green. Look at the trunk, not the canopy." },
    { h: "Oaks and beeches last",
      t: "They hold green into November, then go russet and tan. Young beeches and many oaks keep their dead leaves all winter (marcescence)." }
  ],

  species: [
    {
      common: "Sourwood", aka: ["sorrel tree", "lily of the valley tree"], only: ["west", "mdva"], sci: "Oxydendrum arboreum", fam: "Ericaceae", type: "tree", status: "native",
      win: { s: [9, 10], p: [9, 30], e: [10, 20] },
      colors: ["#4d6b2f", "#c0391b", "#9a1f2a", "#6b2a4a"],
      colorWords: "Brilliant scarlet to maroon, among the first",
      where: "Ridges and dry mountain slopes, especially the Blue Ridge. It goes scarlet early while the forest around it is still green, and the pale seed strands hang on among the red leaves.",
      id: "Long, finely toothed, glossy leaves that taste sour if you chew a leaf. Drooping one-sided strands of tiny pale seed capsules at the branch tips. Often a leaning small tree.",
      also: "Its summer flowers make the prized sourwood honey of the southern Appalachians. Rare in New Jersey and north."
    },
    {
      common: "Black Gum", aka: ["tupelo", "sour gum", "black tupelo"], sci: "Nyssa sylvatica", fam: "Nyssaceae", type: "tree", status: "native",
      win: { s: [9, 15], p: [10, 5], e: [10, 25] },
      colors: ["#4d6b2f", "#b3261e", "#7a1e2c", "#5a2a3a"],
      colorWords: "Scarlet to deep wine red, sometimes purple",
      where: "Often the first tree in the woods to turn. It colors branch by branch, a few scarlet leaves scattered on a still-green tree, starting in late summer.",
      id: "Glossy oval leaves with smooth edges, crowded at twig tips. Branches stick out at right angles. Grows in swamps and wet woods.",
      also: "Also called tupelo or sour gum. Wood is so interlocked it was used for mallets and wheel hubs."
    },
    {
      common: "Smooth & Staghorn Sumac", aka: ["sumac", "staghorn", "smooth sumac"], sci: "Rhus glabra, R. typhina", fam: "Anacardiaceae", type: "shrub", status: "native",
      win: { s: [9, 12], p: [10, 2], e: [10, 22] },
      colors: ["#4d6b2f", "#d9781e", "#c0391b", "#8a2a1e"],
      colorWords: "Orange through flaming scarlet",
      where: "Grows in clonal patches on road cuts and field edges. The sunny outer edge of the patch turns first and the color sweeps inward.",
      id: "Long compound leaves with 11 to 31 toothed leaflets. Upright fuzzy red seed clusters. Staghorn twigs are velvety like deer antler.",
      also: "The red berries make a lemony drink. Not the poison sumac of swamps, which has white berries and smooth-edged leaflets."
    },
    {
      common: "Tree of Heaven", aka: ["ailanthus", "heaven tree", "stink tree", "chinese sumac"], sci: "Ailanthus altissima", fam: "Simaroubaceae", type: "tree", status: "invasive",
      win: { s: [10, 1], p: [10, 16], e: [11, 1] },
      colors: ["#4d6b2f", "#8a9a2c", "#c9b521", "#a8862a"],
      colorWords: "Dull greenish yellow; the seed clusters are the real show",
      where: "Highway shoulders, rail lines, vacant lots and sidewalk cracks. The leaflets yellow and fall first, then the long bare leaf stalks drop like sticks. Female trees keep big hanging clusters of tan to reddish twisted seeds all winter, the easiest way to spot it from the road.",
      id: "Very long compound leaves, 1 to 3 feet, with 11 to 41 leaflets. Each leaflet has a small notch or tooth near its base with a gland underneath. Smooth tan-gray bark. A crushed leaf smells like rancid peanut butter. Often mistaken for sumac, which has teeth all along its leaflets.",
      also: "Brought from China in the 1780s. It spreads by seed and root sprouts, poisons the soil around it to keep competitors out, and is the favorite host of the spotted lanternfly. Cutting it without treating the roots triggers dozens of new sprouts."
    },
    {
      common: "Black Locust", aka: ["locust", "yellow locust", "false acacia", "robinia"], sci: "Robinia pseudoacacia", fam: "Fabaceae", type: "tree", status: "naturalized",
      win: { s: [9, 25], p: [10, 12], e: [10, 28] },
      colors: ["#4d6b2f", "#8a9a2c", "#d9c22a", "#8a6a2a"],
      colorWords: "Pale yellow, often only briefly before the leaflets drop",
      where: "Road cuts, old fields, fence rows and woods edges. Many trees turn brown in late summer, weeks before fall, because the locust leaf miner (a small beetle) eats the inside of the leaves. Healthy trees go pale yellow in early October and shed fast, leaving dark flat seed pods hanging into winter.",
      id: "Compound leaves of 7 to 19 small, rounded, smooth-edged leaflets. A pair of short sharp thorns at the base of each leaf on young twigs. Deeply furrowed, rope-like dark bark. Flat brown pea-style pods 2 to 4 inches long.",
      also: "Native to the Appalachians and Ozarks, planted and spread across the Northeast. A legume: it fixes its own nitrogen, so it thrives on poor road-cut soil. The wood resists rot for decades, the classic fence-post tree. White, sweet-scented flower clusters in late May."
    },
    {
      common: "Black Walnut", aka: ["walnut"], sci: "Juglans nigra", fam: "Juglandaceae", type: "tree", status: "native",
      win: { s: [9, 15], p: [9, 30], e: [10, 15] },
      colors: ["#4d6b2f", "#a8a82c", "#d9b521", "#8a7a3a"],
      colorWords: "Yellow, briefly, then among the first trees bare",
      where: "Fence rows, farm edges and yards. The leaflets yellow and fall in late September and early October, so a bare walnut stands out among green neighbors. Green tennis-ball nuts litter the ground below.",
      id: "Long compound leaves with 15 to 23 narrow toothed leaflets, the end leaflet often missing. Dark, deeply ridged bark. Round green husked nuts that stain hands brown.",
      also: "Its roots release juglone, a compound that stunts tomatoes and many other plants growing nearby. The wood is among the most valuable in North America."
    },
    {
      common: "Black Cherry", aka: ["cherry", "wild cherry", "wild black cherry"], sci: "Prunus serotina", fam: "Rosaceae", type: "tree", status: "native",
      win: { s: [9, 25], p: [10, 12], e: [10, 30] },
      colors: ["#4d6b2f", "#c9a227", "#d9781e", "#b3261e"],
      colorWords: "Yellow to orange, some trees red",
      where: "Fence rows and roadsides, often in straight lines, because birds eat the cherries and drop the seeds where they perch. Colors from the outer crown in.",
      id: "Narrow, glossy, finely toothed leaves with tiny incurved teeth and a line of rusty hairs along the midrib underneath. Young bark smooth with horizontal lines; old bark dark and flaky like burnt potato chips.",
      also: "Wilted leaves and broken branches carry cyanide compounds that are toxic to livestock. The wood is prized for furniture."
    },
    {
      common: "Honey Locust", aka: ["honeylocust", "locust", "thornless honey locust"], sci: "Gleditsia triacanthos", fam: "Fabaceae", type: "tree", status: "planted",
      win: { s: [10, 1], p: [10, 15], e: [10, 30] },
      colors: ["#4d6b2f", "#a8a82c", "#e0c22a", "#c9a227"],
      colorWords: "Clear small-leaf yellow",
      where: "Planted everywhere as a street and parking-lot tree. The tiny leaflets turn yellow together and fall through the grass, so there is almost nothing to rake.",
      id: "Feathery twice-compound leaves with dozens of tiny leaflets. Wild trees carry huge branched thorns on the trunk; planted ones are usually thornless. Long twisted brown pods.",
      also: "Not closely related to black locust despite the name, though both are legumes. The pods have a sweet pulp, the source of the name."
    },
    {
      common: "Quaking & Bigtooth Aspen", inat: ["Populus tremuloides", "Populus grandidentata"], only: ["north", "mid", "west"], aka: ["aspen", "poplar", "popple", "trembling aspen"], sci: "Populus tremuloides, P. grandidentata", fam: "Salicaceae", type: "tree", status: "native",
      win: { s: [10, 1], p: [10, 15], e: [10, 30] },
      colors: ["#4d6b2f", "#a8a82c", "#e0c22a", "#d9a521"],
      colorWords: "Bright gold that shimmers in the wind",
      where: "Clear-cuts, burned ground, road edges and old fields up north. Whole groves turn at once because a grove is often a single plant, connected by its roots.",
      id: "Round leaves on flattened stalks, so they flutter in the slightest breeze. Quaking aspen has fine teeth; bigtooth has large, coarse teeth. Smooth pale greenish-white bark.",
      also: "One aspen clone in Utah is among the largest living things on Earth. In the Northeast they are the first trees back after logging or fire."
    },
    {
      common: "Silver Maple", aka: ["maple", "silver-leaf maple"], sci: "Acer saccharinum", fam: "Sapindaceae", type: "tree", status: "native",
      win: { s: [10, 10], p: [10, 28], e: [11, 12] },
      colors: ["#4d6b2f", "#a8a82c", "#d9b521", "#a8862a"],
      colorWords: "Pale yellow, often dull; silver undersides flash in the wind",
      where: "River floodplains and older neighborhood streets. Colors late and modestly, often going straight from green to pale yellow-brown.",
      id: "Deeply cut five-lobed leaves, the notches reaching almost to the center, bright silver-white underneath. Shaggy gray bark in strips on older trees. Large brittle limbs.",
      also: "Planted heavily in the 1900s because it grows fast. The weak wood drops branches in storms, and the roots crack sidewalks and sewer lines."
    },
    {
      common: "Sycamore & London Plane", inat: ["Platanus hispanica"], only: ["mid", "west", "south", "mdva"], aka: ["sycamore", "plane tree", "london planetree", "buttonwood"], sci: "Platanus occidentalis, P. × acerifolia", fam: "Platanaceae", type: "tree", status: "native",
      win: { s: [10, 5], p: [10, 25], e: [11, 15] },
      colors: ["#4d6b2f", "#8a8a3a", "#b8862a", "#c9a87a"],
      colorWords: "Yellow-brown to tan; color is not the point",
      where: "Stream banks (sycamore) and city streets (London plane). The leaves go tan and crunchy rather than bright. In winter, the white upper limbs and hanging seed balls give it away from far off.",
      id: "Big maple-like leaves, but set one at a time along the twig (maples are in pairs). Bark peels in patches of tan, olive and cream; upper limbs are bright white. Round bristly seed balls on long stalks.",
      also: "The London plane is a cross between the American sycamore and an Asian plane, and it lines more city streets than any other tree in New York. Old sycamores can be hollow enough to stand in."
    },
    {
      common: "Pin Oak", only: ["mid", "west", "south", "mdva"], aka: ["oak"], sci: "Quercus palustris", fam: "Fagaceae", type: "tree", status: "native",
      win: { s: [10, 25], p: [11, 10], e: [11, 30] },
      colors: ["#4d6b2f", "#8a5a2a", "#a0341e", "#7a4a2a"],
      colorWords: "Bronze to russet red, very late",
      where: "Street trees, parking lots and wet ground. Among the last trees to color. The lower branches droop, the middle ones stick straight out, and many hold dry brown leaves all winter.",
      id: "Small leaves with deep C-shaped notches and bristle-tipped lobes. A straight central trunk with a pyramid shape and drooping lower limbs. Small round acorns with thin caps.",
      also: "Its leaves yellow in summer on alkaline soil, a sign of iron shortage that is common in planted streets and lawns."
    },
    {
      common: "White Oak", aka: ["oak"], sci: "Quercus alba", fam: "Fagaceae", type: "tree", status: "native",
      win: { s: [10, 28], p: [11, 10], e: [11, 30] },
      colors: ["#4d6b2f", "#7a3a3a", "#6b2a3a", "#7a5a3a"],
      colorWords: "Burgundy to purple-brown, the last color of the season",
      where: "Upland woods and old fields. It turns after nearly everything else, the deep wine color holding into late November. Young trees keep dry tan leaves through winter.",
      id: "Rounded finger-like lobes with no bristle tips. Light gray, scaly bark. Acorns with warty bowl-shaped caps that sprout the same fall they drop.",
      also: "White oak acorns are less bitter than red oak acorns, so squirrels and deer eat them first. The wood is watertight, which is why it is used for wine and whiskey barrels."
    },
    {
      common: "Callery Pear", only: ["mid", "west", "south", "mdva"], aka: ["bradford pear", "pear", "cleveland pear"], sci: "Pyrus calleryana", fam: "Rosaceae", type: "tree", status: "invasive",
      win: { s: [10, 28], p: [11, 10], e: [11, 28] },
      colors: ["#4d6b2f", "#a0341e", "#7a1e3a", "#5a2a3a"],
      colorWords: "Glossy maroon, purple and orange, very late",
      where: "Highway interchanges, medians and abandoned fields. In April the thickets are solid white; in November they are wine-red long after the maples are bare. Street trees hold their leaves into December.",
      id: "Glossy, rounded, finely wavy-toothed leaves on long stalks. Wild seedlings carry long thorns. Tiny brown pear fruits that birds spread.",
      also: "Planted as a sterile, thornless street tree, but varieties cross-pollinate and the offspring revert to thorny wild trees. New Jersey's 2026 invasive species law puts it on the prohibited list, with sales ending in 2030."
    },
    {
      common: "Eastern White Pine", aka: ["white pine", "pine"], sci: "Pinus strobus", fam: "Pinaceae", type: "tree", status: "native", noLive: true,
      stageWords: { coming: "All green", turning: "Inner needles yellowing", peak: "Inner needle drop", dropping: "Needle drop ending", bare: "Green again" },
      winText: ["Inner needles yellow around", "needle drop peaks around", "done by"],
      win: { s: [9, 25], p: [10, 12], e: [10, 30] },
      colors: ["#2f5a3a", "#4d6b2f", "#c9a227", "#a8862a"],
      colorWords: "Green outside, yellow inside: normal fall needle drop",
      where: "It is not dying. Each fall the oldest needles, deep inside the branches, turn yellow and drop, while the newer needles at the tips stay green. Whole stands look golden inside for a week or two.",
      id: "Soft, flexible needles in bundles of 5 (count the letters in W-H-I-T-E). Long curved cones. Branches grow in level whorls, one ring per year.",
      also: "The largest conifer in the Northeast. The Crown reserved the biggest ones for ship masts in colonial times, marking them with the King's broad arrow."
    },
    {
      common: "Japanese Barberry", aka: ["barberry"], sci: "Berberis thunbergii", fam: "Berberidaceae", type: "shrub", status: "invasive",
      win: { s: [10, 10], p: [10, 30], e: [11, 20] },
      colors: ["#4d6b2f", "#d9781e", "#c0391b", "#8a2a3a"],
      colorWords: "Orange, scarlet and purple, low in the woods",
      where: "Forest understory, especially in shade where little else grows. Leafs out early and colors late, so it stands out as a red carpet under bare or turning trees.",
      id: "Small spoon-shaped leaves in clusters. A single sharp spine at each node. Bright red oblong berries that hang on into winter. Cut stems are bright yellow inside.",
      also: "Dense barberry thickets hold humidity that helps deer ticks survive, and studies link it to higher Lyme disease risk. It is on New Jersey's prohibited invasive plant list (sales end in 2030), and several other Northeast states already ban it."
    },
    {
      common: "Autumn Olive", aka: ["autumn-olive", "olive"], sci: "Elaeagnus umbellata", fam: "Elaeagnaceae", type: "shrub", status: "invasive", noLive: true,
      stageWords: { coming: "Green, like everything else", turning: "Green while others turn", peak: "Stands out: still in leaf", dropping: "Finally dropping", bare: "Bare" },
      winText: ["Still green when neighbors turn, around", "most noticeable around", "finally bare by"],
      win: { s: [10, 30], p: [11, 15], e: [12, 1] },
      colors: ["#5a7a5a", "#8a9a7a", "#a8a87a", "#a8946a"],
      colorWords: "Stays silvery green after almost everything else is bare",
      where: "Highway banks, old fields and power lines. In November it is the shrub still full of leaves, silvery when the wind turns them over, loaded with small red berries.",
      id: "Narrow oval leaves, dull green on top and silvery underneath with tiny scales. Red berries speckled with silver dots. Often a little thorny.",
      also: "Planted for erosion control and wildlife food decades ago. Like black locust it fixes its own nitrogen, so it takes over poor soil. The berries are edible and tart."
    },
    {
      common: "Pawpaw", aka: ["paw paw", "asimina"], sci: "Asimina triloba", fam: "Annonaceae", type: "tree", status: "native",
      win: { s: [10, 5], p: [10, 20], e: [11, 5] },
      colors: ["#4d6b2f", "#a8a82c", "#e0c22a", "#c9a227"],
      colorWords: "Clear butter yellow, big tropical-looking leaves",
      where: "Stream banks and moist bottomland woods, often in patches because it spreads by root suckers. The large leaves turn yellow all at once and hang on for a week or two.",
      id: "Huge drooping oval leaves, up to a foot long, widest near the tip, that smell like green pepper when crushed. Small understory tree. Green, lumpy, mango-sized fruit in September.",
      also: "The largest edible fruit native to North America, with custard-like flesh that tastes of banana and mango. The only host plant for the zebra swallowtail butterfly."
    },
    {
      common: "Shining Sumac", aka: ["winged sumac", "dwarf sumac", "flameleaf sumac", "sumac"], sci: "Rhus copallinum", fam: "Anacardiaceae", type: "shrub", status: "native",
      win: { s: [9, 25], p: [10, 12], e: [10, 30] },
      colors: ["#4d6b2f", "#c0391b", "#8a1e1e", "#5a2a3a"],
      colorWords: "Deep glossy red to maroon",
      where: "Dry sandy roadsides, pine barrens edges and old fields, especially in South Jersey. Colors a little later than staghorn sumac and goes darker red.",
      id: "Glossy compound leaves with a narrow leafy wing running along the stalk between the leaflets. Leaflet edges smooth (staghorn's are toothed). Upright red fuzzy berry clusters.",
      also: "The wings on the leaf stalk are the giveaway. Like staghorn sumac the berries make a tart lemonade. Not poison sumac, which grows in swamps with white berries."
    },
    {
      common: "Spicebush", aka: ["northern spicebush", "lindera"], sci: "Lindera benzoin", fam: "Lauraceae", type: "shrub", status: "native",
      win: { s: [10, 8], p: [10, 22], e: [11, 5] },
      colors: ["#4d6b2f", "#a8a82c", "#e0c22a", "#d9b521"],
      colorWords: "Clear lemon yellow lighting up the understory",
      where: "Moist woods and stream sides, often the dominant shrub under the trees. In mid October the whole understory goes yellow at once, with bright red berries on the female plants.",
      id: "Smooth oval leaves that smell spicy-citrus when crushed; twigs smell the same. Small red oval berries in fall. Yellow flowers on bare twigs in early April.",
      also: "A sassafras relative, same family. Host plant for the spicebush swallowtail. The dried berries were used as an allspice substitute."
    },
    {
      common: "Mapleleaf Viburnum", aka: ["viburnum", "maple-leaved viburnum", "dockmackie"], sci: "Viburnum acerifolium", fam: "Adoxaceae", type: "shrub", status: "native",
      win: { s: [10, 8], p: [10, 25], e: [11, 10] },
      colors: ["#4d6b2f", "#c9a0a8", "#a8607a", "#6b2a4a"],
      colorWords: "Pink to dusty purple, unlike anything else in the woods",
      where: "Dry upland woods, in the deep shade under oaks. The pale pink-purple of its leaves is one of the few shrub colors that reads clearly from a trail in late October.",
      id: "Opposite, three-lobed leaves that look like a small red maple leaf, but on a thin knee-high to waist-high shrub. Flat clusters of black berries.",
      also: "Mapleleaf viburnum and red maple leaves are easy to confuse until you look at the plant: the viburnum is a low shrub with opposite leaves and black berries."
    },
    {
      common: "Box Elder", aka: ["boxelder", "ash-leaved maple", "manitoba maple", "maple"], sci: "Acer negundo", fam: "Sapindaceae", type: "tree", status: "native",
      win: { s: [9, 28], p: [10, 12], e: [10, 28] },
      colors: ["#4d6b2f", "#8a9a2c", "#c9b521", "#a8862a"],
      colorWords: "Dull yellow, early and brief",
      where: "Floodplains, ditches, fence rows and vacant lots. A weedy fast-growing maple that colors early and drops fast; often half bare while other maples are still green.",
      id: "The only maple with compound leaves: 3 to 7 leaflets, so it is often mistaken for ash or poison ivy. Twigs are smooth and green, sometimes with a white bloom. Paired winged seeds hang all winter.",
      also: "Box elder bugs, the black and red insects that gather on sunny walls in fall, feed on its seeds. The sap can be tapped for a weak syrup."
    },
    {
      common: "Virginia Creeper", sci: "Parthenocissus quinquefolia", fam: "Vitaceae", type: "vine", status: "native",
      win: { s: [9, 12], p: [10, 3], e: [10, 25] },
      colors: ["#4d6b2f", "#c0391b", "#9a1f2a", "#6b2a4a"],
      colorWords: "Crimson to burgundy",
      where: "Look at tree trunks and fences, not canopies. It goes red while the host tree is still fully green, often from the bottom of the vine up.",
      id: "Five leaflets radiating from a single point, toothed. Dark blue berries on red stalks. Climbs with sticky disc-tipped tendrils.",
      also: "Easily confused with poison ivy. Count the leaflets: five is creeper, three is ivy."
    },
    {
      common: "Poison Ivy", inat: ["Toxicodendron rydbergii"], sci: "Toxicodendron radicans", fam: "Anacardiaceae", type: "vine", status: "native",
      win: { s: [9, 18], p: [10, 8], e: [10, 28] },
      colors: ["#4d6b2f", "#c9a227", "#d9781e", "#b3261e"],
      colorWords: "Yellow, orange and red, often all on the same vine",
      where: "Hairy vines on trunks and sprawling patches along trail and road edges. Turns early, a few leaves at a time.",
      id: "Three leaflets, the middle leaflet on a longer stalk. Edges smooth or with a few irregular teeth. Waxy white berries. Old vines are thick and hairy.",
      also: "The oil (urushiol) stays active on dead leaves and vines all winter. Never burn it."
    },
    {
      common: "Burning Bush", aka: ["winged euonymus", "euonymus"], sci: "Euonymus alatus", fam: "Celastraceae", type: "shrub", status: "invasive",
      win: { s: [9, 25], p: [10, 15], e: [11, 1] },
      colors: ["#4d6b2f", "#d14a5a", "#d9264a", "#b3263a"],
      colorWords: "Hot pinkish red, almost fluorescent",
      where: "Escaped from yards into woodland understory. In the woods it still turns vivid pink in deep shade, which no native shrub does that brightly.",
      id: "Opposite small elliptic leaves. Twigs carry corky wings along their sides. Small orange-red berries in pairs.",
      also: "Banned from sale in several Northeast states and on New Jersey's prohibited list (sales end in 2030). Birds spread the seeds into forests, where it shades out native seedlings."
    },
    {
      common: "Red Maple", aka: ["maple", "swamp maple", "soft maple"], sci: "Acer rubrum", fam: "Sapindaceae", type: "tree", status: "native",
      win: { s: [9, 25], p: [10, 15], e: [11, 1] },
      colors: ["#4d6b2f", "#d9781e", "#c0391b", "#8a1e1e"],
      colorWords: "Scarlet, sometimes orange or yellow",
      where: "Wet ground turns first, so swamps and highway medians light up before uplands. Single early-red branches on a green tree are a stress signal. Individual trees vary: the first tree may turn scarlet every year while the next tree over turns yellow.",
      id: "Three main lobes with V-shaped notches and sharp teeth. Leaf stalks are red. Smooth gray bark on younger trees.",
      also: "The most common tree in the eastern U.S. Red flowers in March and red seeds in spring, then green leaves all summer like any other tree; the red comes back only when the green breaks down in fall."
    },
    {
      common: "Flowering Dogwood", aka: ["dogwood"], sci: "Cornus florida", fam: "Cornaceae", type: "tree", status: "native",
      win: { s: [9, 25], p: [10, 15], e: [11, 2] },
      colors: ["#4d6b2f", "#9a3a3a", "#7a1e3a", "#5a2a3a"],
      colorWords: "Burgundy to purple-red",
      where: "An understory tree that colors well even in shade. Leaves at the top and outer branch tips turn first. Look for clusters of shiny red berries at the same time.",
      id: "Opposite oval leaves whose veins curve toward the tip, following the leaf edge. Gently tear a leaf and stretchy threads hold the halves together. Bark like alligator skin.",
      also: "The berries are a key fall food for migrating thrushes. Already setting gray button-shaped flower buds for spring."
    },
    {
      common: "White Ash", aka: ["ash", "american ash"], sci: "Fraxinus americana", fam: "Oleaceae", type: "tree", status: "native",
      win: { s: [9, 25], p: [10, 12], e: [10, 28] },
      colors: ["#4d6b2f", "#c9a227", "#7a3a5a", "#5a2a4a"],
      colorWords: "Purple, maroon or bronze; some trees yellow",
      where: "Turns early and drops fast. The whole crown colors at once, then sheds in a few days. Purple ash among yellow trees is among the best ID tells of the season.",
      id: "Opposite compound leaves, usually 7 leaflets. Diamond-patterned furrowed bark. Paddle-shaped seeds in clusters.",
      also: "Emerald ash borer has killed most ash in the region. A dead or thin-crowned ash with D-shaped exit holes is a common roadside sight."
    },
    {
      common: "Sassafras", sci: "Sassafras albidum", fam: "Lauraceae", type: "tree", status: "native",
      win: { s: [10, 1], p: [10, 18], e: [11, 2] },
      colors: ["#4d6b2f", "#c9a227", "#d9781e", "#c0391b"],
      colorWords: "Orange, red, yellow and salmon, mixed on the same tree",
      where: "Field edges and young woods. Colors from the outer crown in, and a single small tree often carries every color at once.",
      id: "Three leaf shapes on the same tree: oval, mitten (two lobes) and three-lobed. Twigs are green. A crushed leaf or twig smells like root beer.",
      also: "The root bark was the original root beer flavor."
    },
    {
      common: "Sugar Maple", aka: ["maple", "hard maple", "rock maple"], sci: "Acer saccharum", fam: "Sapindaceae", type: "tree", status: "native",
      win: { s: [10, 1], p: [10, 20], e: [11, 5] },
      colors: ["#4d6b2f", "#c9a227", "#d9781e", "#c0391b"],
      colorWords: "Brilliant orange, with yellow and red",
      where: "The top and sunny outer crown turn first and go the reddest; the shaded interior stays yellow-orange longer. That outside-in gradient is the classic sugar maple look.",
      id: "Five lobes separated by rounded U-shaped notches, few teeth. Stalks have clear sap, not milky. Bark gray, in long plates on older trees.",
      also: "The tree behind maple syrup and the New England postcard. Commoner north of NJ; in the south zone mostly planted along roads and in towns."
    },
    {
      common: "Sweetgum", aka: ["sweet gum", "gumball tree", "liquidambar"], only: ["south", "mid", "mdva"], sci: "Liquidambar styraciflua", fam: "Altingiaceae", type: "tree", status: "native",
      win: { s: [10, 10], p: [10, 28], e: [11, 15] },
      colors: ["#4d6b2f", "#c9a227", "#c0391b", "#5a2a4a"],
      colorWords: "Every color on the same tree: yellow, orange, red and deep purple",
      where: "Colors late and slowly, crown top and south side first. A tree can hold green, yellow and purple at once for weeks.",
      id: "Five-pointed star leaves. Spiky ball seed pods (gumballs) hang on the tree and litter sidewalks. Some twigs have corky ridges.",
      also: "Native to South Jersey; widely planted farther north as a street tree."
    },
    {
      common: "Tulip Tree", aka: ["tulip poplar", "yellow poplar", "poplar", "tuliptree"], only: ["south", "mid", "west", "mdva"], sci: "Liriodendron tulipifera", fam: "Magnoliaceae", type: "tree", status: "native",
      win: { s: [10, 5], p: [10, 22], e: [11, 5] },
      colors: ["#4d6b2f", "#a8a82c", "#d9b521", "#c99a3a"],
      colorWords: "Clear butter yellow",
      where: "Inner, older leaves yellow and drop first, sometimes as early as a dry August, while the outer shell stays green. Then the whole tall crown goes gold.",
      id: "Four-lobed leaf with a squared-off notched tip, like a tulip in outline or a cat's face. Very tall, straight trunk.",
      also: "Among the tallest trees in eastern forests. A magnolia relative, not a poplar despite the name yellow poplar."
    },
    {
      common: "Hickories", inat: ["Carya"], aka: ["hickory", "shagbark", "pignut"], sci: "Carya ovata, C. glabra", fam: "Juglandaceae", type: "tree", status: "native",
      win: { s: [9, 28], p: [10, 14], e: [10, 31] },
      colors: ["#4d6b2f", "#c9a227", "#b8862a", "#8a6a2a"],
      colorWords: "Clear golden yellow, then bronze",
      where: "Turns as a whole crown rather than branch by branch, and among the earlier yellows in the woods: a pignut can be solid gold while the oaks around it are still green. Leaflets drop individually, then the bare stalks follow.",
      id: "Compound leaves of 5 leaflets (shagbark) or 5 to 7 (pignut), the end ones largest. Shagbark has long peeling bark strips. Hard round nuts in husks.",
      also: "Shagbark hickory nuts were a major food for Native peoples; pecan is a hickory."
    },
    {
      common: "Birches", aka: ["birch", "gray birch", "paper birch", "white birch", "black birch", "yellow birch"], sci: "Betula spp.", fam: "Betulaceae", type: "tree", status: "native",
      win: { s: [10, 1], p: [10, 18], e: [11, 2] },
      colors: ["#4d6b2f", "#a8a82c", "#d9b521", "#c99a3a"],
      colorWords: "Bright yellow",
      where: "Gray birch on road cuts and old fields, black and yellow birch in woods. Small leaves turn and fall quickly.",
      id: "Toothed oval to triangular leaves. Bark: chalky white with black triangles (gray birch), peeling white (paper), shiny dark with a wintergreen smell when scratched (black).",
      also: "Gray birch is among the first trees to colonize abandoned fields and roadsides."
    },
    {
      common: "Witch Hazel", sci: "Hamamelis virginiana", fam: "Hamamelidaceae", type: "shrub", status: "native",
      win: { s: [10, 5], p: [10, 25], e: [11, 10] },
      colors: ["#4d6b2f", "#a8a82c", "#d9b521", "#b89a3a"],
      colorWords: "Gold, and it flowers as the leaves turn",
      where: "Woodland understory. Look closely as the leaves yellow: spidery yellow flowers open on the same twigs, the last native flower of the year.",
      id: "Lopsided wavy-edged oval leaves, unequal at the base. Ribbon-petaled yellow flowers along the twigs in October and November.",
      also: "The seed pods from last year explode, shooting seeds up to 30 feet. The astringent is distilled from its bark."
    },
    {
      common: "Oriental Bittersweet", aka: ["bittersweet"], sci: "Celastrus orbiculatus", fam: "Celastraceae", type: "vine", status: "invasive",
      win: { s: [10, 10], p: [10, 25], e: [11, 8] },
      colors: ["#4d6b2f", "#a8a82c", "#d9b521", "#d9781e"],
      colorWords: "Yellow leaves, then orange-and-red berries",
      where: "Smothers trees and fences along roadsides. Once its leaves yellow, the yellow curtains draped over whole trees give away how much it has taken over.",
      id: "Round, finely toothed alternate leaves. Berries in clusters along the stem: yellow husk splits to show a red-orange center.",
      also: "Strangles and topples trees. The berries in fall wreaths spread it."
    },
    {
      common: "Ginkgo", sci: "Ginkgo biloba", fam: "Ginkgoaceae", type: "tree", status: "planted",
      win: { s: [10, 25], p: [11, 8], e: [11, 15] },
      colors: ["#4d6b2f", "#a8a82c", "#e0c22a", "#d9b521"],
      colorWords: "Pure lemon-gold",
      where: "City and street tree. The whole crown turns gold evenly, then after the first hard frost drops nearly every leaf in a day or two.",
      id: "Fan-shaped leaves with radiating veins, often notched in the middle. Female trees drop foul-smelling fruit.",
      also: "A living fossil: the only survivor of a lineage over 200 million years old."
    },
    {
      common: "American Beech", aka: ["beech"], sci: "Fagus grandifolia", fam: "Fagaceae", type: "tree", status: "native",
      win: { s: [10, 15], p: [11, 1], e: [11, 20] },
      colors: ["#4d6b2f", "#c9a227", "#b8862a", "#c9a87a"],
      colorWords: "Gold, then bronze, then papery tan",
      where: "Late. Young beeches and the lower branches of big ones keep their pale tan leaves through winter, the rattling leaves you see in a bare January woods.",
      id: "Smooth elephant-gray bark. Oval leaves with straight parallel veins each ending in a small tooth. Long cigar-shaped buds.",
      also: "Beech leaf disease, a nematode spreading across the region since 2012, shows as dark bands between the veins."
    },
    {
      common: "Red & Scarlet Oak", aka: ["oak", "red oak", "scarlet oak", "northern red oak"], sci: "Quercus rubra, Q. coccinea", fam: "Fagaceae", type: "tree", status: "native",
      win: { s: [10, 20], p: [11, 5], e: [11, 25] },
      colors: ["#4d6b2f", "#8a5a2a", "#a0341e", "#7a4a2a"],
      colorWords: "Russet red; scarlet oak a true deep red",
      where: "Among the last to turn, carrying the late-season color after the maples are bare. Color creeps in from the outer crown, and many hold dead leaves into winter.",
      id: "Pointed lobes tipped with bristles. Scarlet oak has deep C-shaped notches cut almost to the midrib. Acorns with shallow caps.",
      also: "Oaks are the backbone of the late season. See White Oak and Pin Oak for the last of the color."
    },
    {
      common: "Tamarack", aka: ["larch", "eastern larch", "hackmatack"], only: ["north", "mid", "west"], sci: "Larix laricina", fam: "Pinaceae", type: "tree", status: "native",
      win: { s: [10, 20], p: [11, 5], e: [11, 20] },
      colors: ["#4d6b2f", "#8a9a2c", "#d9b521", "#b8862a"],
      colorWords: "Needles turn smoky gold, then drop",
      where: "Bogs, swamps and cold wet hollows. The whole tree turns gold at once, standing out as the only yellow conifer among green spruce and pine.",
      id: "Soft needles in tufts of 10 to 20 on short knobby spurs. Small upright cones. A conifer that goes bare in winter.",
      also: "A deciduous conifer: it sheds every needle each fall and regrows them in spring. Also called eastern larch."
    },
    {
      common: "Norway Maple", aka: ["maple"], sci: "Acer platanoides", fam: "Sapindaceae", type: "tree", status: "invasive",
      win: { s: [10, 25], p: [11, 8], e: [11, 22] },
      colors: ["#4d6b2f", "#8a9a2c", "#c9b521", "#b89a3a"],
      colorWords: "Plain yellow, often still green into November",
      where: "The last maple standing. When a maple is still green after the natives are bare, it is almost always this. Street trees and spreading into woods.",
      id: "Wide five-lobed leaf, broader than long. Snap the leaf stalk: milky white sap (sugar maple's is clear). Seeds spread almost flat.",
      also: "Its dense shade and early leaf-out suppress native wildflowers and seedlings beneath it."
    }
  ]
};
