/**
 * Script to generate AI images using Google's Gemini 3 Pro Image API
 *
 * Usage: bun run scripts/generate-ai-images.ts [count]
 *
 * Environment variables required:
 * - GOOGLE_API_KEY: Your Google AI API key
 *
 * Example: GOOGLE_API_KEY=your_key bun run scripts/generate-ai-images.ts 10
 */

import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "public", "images", "ai");
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720; // 16:9 aspect ratio

// 420 diverse, tuned prompts grouped by topic
export const IMAGE_PROMPTS: string[] = [
  // nature (20)
  "Hyper-detailed photorealistic nature shot of morning dew on grass blades at sunrise, ultra shallow depth of field, 85mm lens, soft golden backlight, natural color grading, high dynamic range, 8k resolution",
  "Cinematic wide-angle photo of a crystal-clear river flowing over smooth stones in a forest, 24mm lens, polarizing filter, soft overcast light, realistic reflections, ultra high resolution",
  "Epic landscape photograph of rolling green hills under a dramatic cloudy sky, 35mm lens, subtle vignette, soft contrast, realistic colors, shot at golden hour, 6k",
  "Moody photorealistic nature scene of a storm front approaching over an open plain, long lens compression, deep clouds, soft side lighting, natural muted tones, 4k",
  "Aerial-style photorealistic view of a small island surrounded by turquoise water, top-down composition, crisp details, high contrast between land and sea, 8k",
  "Close-up nature photograph of a moss-covered rock beside a quiet stream, macro lens, shallow depth of field, soft diffuse light, rich green tones, detailed texture",
  "Cinematic wide shot of a meadow after rain with a faint rainbow in the distance, 24mm lens, soft sunlight breaking through clouds, realistic puddles and wet grass reflections",
  "Dramatic coastal nature photograph of a rugged coastline with waves crashing against cliffs, telephoto lens, moody sky, high shutter speed freezing water droplets, 6k",
  "Wind-blown tall grass in a wide open field, low-angle shot, 35mm lens, sunset backlight, motion blur in the grass, warm tones, high resolution",
  "Foggy morning over a calm lake with faint silhouettes of trees, long exposure, 50mm lens, minimalistic composition, neutral color grading, very soft contrast, 4k",
  "Macro shot of cracked, dry earth in a drought-stricken area, extreme close-up, high texture detail, soft overhead light, earthy tones, photorealistic",
  "Night landscape with a clear starry sky above a dark open field, long exposure, 24mm lens, visible stars and subtle Milky Way, low light noise, 6k",
  "Photorealistic scene of rolling sand dunes under a bright blue sky, low-angle perspective, long lens compression, crisp shadows, high contrast, 8k resolution",
  "Serene pond covered in water lilies and floating leaves, 50mm lens, soft morning light, calm reflections, subtle ripples, natural earthy color palette",
  "Rocky shoreline with tide pools reflecting the sky, 35mm lens, polarizing filter, crisp wet rock textures, high detail in reflections, 6k",
  "Heavy rain falling on a rural dirt road, 50mm lens, fast shutter speed, sharp rain streaks, soft background bokeh, muted tones, cinematic mood",
  "Sun rays breaking through dramatic storm clouds over a wide landscape, 24mm lens, high dynamic range, volumetric light beams, vibrant yet natural colors",
  "Narrow canyon with light streaming down from above, ultra wide-angle, strong contrast between bright sky and shaded rock walls, high texture detail, 4k",
  "Lone tree on a hill silhouetted against a vivid sunset sky, telephoto lens, clean minimal composition, deep warm tones, smooth gradient sky, 6k",
  "Waves gently lapping against a pebbled beach, low-angle macro perspective, shallow depth of field, highly detailed wet pebbles, subtle reflections",
  // architecture (20)
  "Photorealistic exterior of a minimalist concrete house with large glass windows, 24mm architectural lens, clean lines, overcast soft light, no distortion, 8k",
  "Ornate historical building with intricate stone carvings, 35mm lens, slightly low angle, warm afternoon light, high texture detail, subtle vignette",
  "Modern open-plan office interior with exposed beams, 16mm wide-angle, natural window light, clean color balance, realistic reflections on glass surfaces",
  "Grand cathedral interior with high vaulted ceilings, ultra wide-angle shot, symmetrical composition, soft diffused stained glass light, rich shadows, 6k",
  "Futuristic glass skyscraper against a bright sky, 24mm lens, slight upward perspective, high contrast, ultra crisp reflections, cool color grading",
  "Narrow alley between old brick buildings, 35mm lens, soft ambient light, detailed brick textures, subtle depth haze, cinematic look",
  "Close-up of detailed ironwork on an old balcony railing, 85mm lens, shallow depth of field, side lighting to emphasize texture, warm tones",
  "Sunlit courtyard with arches and columns, 24mm lens, strong light and shadow patterns, warm color palette, high clarity, 4k",
  "Cozy reading room interior with floor-to-ceiling bookshelves, 35mm lens, warm tungsten lighting, shallow depth of field, rich wood textures",
  "Spiral staircase viewed from above, 24mm lens looking straight down, geometric composition, high contrast lines, subtle vignette, 6k",
  "Night view of a lit-up bridge over a river, long exposure, 35mm lens, reflections in water, light trails, rich contrast, cinematic grading",
  "Traditional wooden house in a rural village, 35mm lens, overcast daylight, detailed wood grain, gentle color tones, documentary style",
  "Abandoned industrial warehouse with broken windows, 24mm lens, moody ambient light, visible dust and decay, gritty texture, high resolution",
  "Open-air market square surrounded by colorful facades, 24mm lens, vibrant but realistic colors, soft midday light, light crowd presence",
  "Luxury hotel lobby interior with marble floors, 16mm wide-angle lens, bright clean lighting, reflective surfaces, high-end look, 8k",
  "Rooftop terrace with city views and potted plants, 24mm lens, golden hour lighting, shallow depth of field on foreground plants, hazy city background",
  "Old stone castle on a hill under overcast skies, 35mm lens, moody contrast, soft shadows, detailed masonry, cinematic cool grading",
  "Glass atrium filled with natural light, 16mm wide-angle, symmetrical composition, complex reflections, crisp lines, high resolution",
  "Subway entrance integrated into modern architecture, 24mm lens, slight low-angle, mixed artificial and ambient light, realistic shadows",
  "Row of townhouses with symmetrical facades, 35mm lens, frontal perspective, soft afternoon lighting, neutral color grading, 4k",
  // people (20)
  "Candid street-style portrait of a person leaning against a brick wall, 50mm lens, natural side light, shallow depth of field, muted urban tones",
  "Group of people chatting at a small backyard gathering, 35mm lens, golden hour backlight, soft bokeh, warm color grading, casual composition",
  "Person sitting on a bench checking their phone, 85mm lens, compressed perspective, soft background blur, realistic skin tones, 4k",
  "Coworkers discussing around a standing desk in a modern office, 35mm lens, bright natural light, clean colors, documentary style framing",
  "Person tying shoelaces on a city sidewalk, low-angle shot, 35mm lens, shallow depth of field, realistic pavement texture, urban color palette",
  "Silhouetted figure in front of a large window with natural backlight, 50mm lens, high dynamic range, subtle rim light, soft interior shadows",
  "Friends sitting on the grass in a park talking, 35mm lens, slightly elevated angle, warm sunlight, soft and airy color grading",
  "Person waiting at a bus stop on an overcast day, 50mm lens, muted colors, soft flat light, realistic wet pavement if rainy, 4k",
  "Person looking out of a train window deep in thought, 85mm lens, interior reflections, soft afternoon light, shallow depth of field on face",
  "Person walking alone down a quiet residential street, 35mm lens, leading lines perspective, late afternoon light, gentle tones",
  "Two people talking at an outdoor café table, 50mm lens, shallow depth of field, sunlit highlights, slightly desaturated urban background",
  "Person stretching before a jog on a riverside path, 35mm lens, early morning cool light, visible breath in cold air, natural fitness look",
  "Person standing in a doorway with dim indoor light behind them, 50mm lens, high contrast edge light, warm interior vs cool exterior tones",
  "Crowd scene with people crossing at a busy intersection, 24mm lens, overhead angle, motion blur in some figures, vibrant city colors",
  "Person sitting on a low wall listening to music with headphones, 35mm lens, candid composition, shallow depth, natural relaxed pose",
  "Person browsing books in a small bookshop, 50mm lens, warm tungsten light, narrow aisles, cozy color grading, high detail",
  "Person standing at a scenic overlook taking in the view, 24mm lens, backlit subject as silhouette, dramatic landscape, soft haze",
  "Person sipping a drink while seated at a bar, 50mm lens, neon and ambient bar lighting, shallow focus, cinematic mood, 4k",
  "Two people walking side by side along a waterfront, 35mm lens, side-on perspective, warm sunset light, subtle reflections on water",
  "Person riding an escalator in a shopping center, 24mm lens, architectural lines, cool white lighting, high clarity, modern atmosphere",
  // animals (20)
  "Photorealistic wildlife-style image of a fox standing alert in a grassy clearing, 200mm telephoto lens, shallow depth of field, natural forest background, 6k",
  "Cat watching birds from a windowsill, 85mm lens, indoor ambient light, soft focus background, detailed fur texture, cozy mood",
  "Group of sheep grazing on a hillside, 135mm lens, soft overcast light, rolling background hills, gentle earthy color palette",
  "Parrot perched on a branch with colorful feathers, 200mm lens, high saturation but realistic colors, blurred jungle background, 4k",
  "Rabbit sitting in a garden surrounded by plants, 135mm lens, low perspective, shallow depth, warm afternoon light, photorealistic fur",
  "Herd of cows standing in a sunlit field, 85mm lens, wide composition including sky, light haze, pastoral feel, high resolution",
  "Close-up of a horse’s eye with light reflections, macro lens, extreme detail in eyelashes and skin texture, soft natural lighting",
  "Ducks swimming on a small pond, 135mm lens, reflections in water, ripples radiating out, mid-morning light, natural colors",
  "Squirrel holding a nut on a tree branch, 200mm lens, shallow depth, detailed fur and paws, autumn leaves background, 6k",
  "Turtle resting on a rock near the water, 135mm lens, side lighting, wet shell reflections, subtle background bokeh, realistic colors",
  "Lizard sunbathing on a warm stone, macro lens, high texture detail in scales, strong sunlight, sharp shadows, natural desert tones",
  "Pigeons pecking at crumbs on a city square, 50mm lens, low angle, shallow depth, textured concrete, desaturated urban palette",
  "Hedgehog walking through fallen leaves, 135mm lens, low ground-level perspective, warm autumn colors, detailed spines",
  "Goat climbing on rocky terrain, 200mm lens, midday light, rugged background, crisp detail, slight atmospheric haze",
  "Group of fish visible in clear shallow water, polarizing filter, top-down view, rippled surface, high clarity of underwater details",
  "Dog looking out of a car window with wind in its fur, 50mm lens, motion blur in background, bright daylight, joyful expression",
  "Swan gliding across a calm lake, 200mm lens, mirror-like reflection, soft dawn light, minimalistic composition, 4k",
  "Small bird perched on a fence post, 300mm telephoto, blurred countryside background, high feather detail, gentle color grading",
  "Cat stretching in a beam of sunlight indoors, 50mm lens, strong light and shadow contrast, warm tone, home environment",
  "Seagulls hovering above a shoreline, 135mm lens, freeze-frame motion, bright sky, subtle ocean texture below, high resolution",
  // food (20)
  "Overhead food photograph of a breakfast table with toast, fruit, and coffee, 35mm lens, natural window light, neutral background, soft shadows, 4k",
  "Close-up of a slice of chocolate cake on a white plate, 85mm lens, shallow depth of field, glossy icing reflections, rich warm tones",
  "Colorful salad in a glass bowl on a wooden table, 50mm lens, top-down composition, bright vibrant colors, crisp vegetable detail",
  "Juicy burger with melted cheese and fresh vegetables, 50mm lens, shallow depth of field, dark rustic background, high contrast, 6k",
  "Freshly baked bread loaves cooling on a rack, 35mm lens, soft side light, visible steam, detailed crust texture, warm tones",
  "Bowl of hot soup with steam rising, 85mm lens, cozy indoor lighting, moody dark background, shallow depth, cinematic",
  "Assorted fruits neatly arranged on a cutting board, top-down 35mm lens, bright even lighting, high saturation but natural, 4k",
  "Plate of pasta with tomato sauce and basil, 50mm lens, overhead or 45-degree angle, warm color grading, crisp garnish details",
  "Hand reaching for a cookie from a plate, 50mm lens, shallow depth, focus on cookie and fingers, cozy home setting, soft light",
  "Macro shot of sparkling water droplets on fresh grapes, extreme close-up, high texture detail, cool color tones, backlighting",
  "Cheese board with nuts and dried fruits, 35mm lens, top-down perspective, rustic wooden table, soft directional lighting",
  "Stack of pancakes topped with berries and syrup, 50mm lens, shallow depth, glistening syrup highlights, bright morning feel",
  "Simple sandwich on parchment paper, 50mm lens, minimalistic composition, soft diffused light, neutral color grading, 4k",
  "Close-up of a scoop of ice cream starting to melt in a bowl, macro lens, creamy texture, droplets forming, cool pastel color palette",
  "Bar counter with colorful drinks lined up, 35mm lens, bokeh bar background, neon and tungsten mixed light, crisp glass reflections",
  "Rustic kitchen table with ingredients prepared for cooking, 24mm lens, soft natural window light, slight mess, documentary style",
  "Bowl of ramen with chopsticks resting on top, 50mm lens, overhead shot, steam rising, rich warm broth tones, detailed toppings",
  "Top-down view of an arrangement of spices in small bowls, 35mm lens, strong color contrast, dark background, high clarity",
  "Slice of pizza being lifted from a whole pizza, 50mm lens, cheese stretch captured, shallow depth, warm saturated tones",
  "Close-up of a cup of tea with lemon on a saucer, 85mm lens, steam visible, soft morning light, neutral background, high detail",
  // travel (20)
  "Traveler’s backpack resting on a train station platform, 35mm lens, shallow depth, motion-blurred train in background, natural daylight",
  "Suitcase and hat placed next to a hotel room window, 50mm lens, soft interior light mixing with daylight, city view outside, warm tones",
  "Airplane wing above clouds seen from a passenger seat, 24mm lens, bright sky, soft cloud gradients, high dynamic range, 6k",
  "Narrow alleyway with hanging signs in a foreign city, 24mm lens, ambient street light, slight depth haze, vibrant yet realistic colors",
  "Traveler holding a paper map on a cobblestone street, 35mm lens, shallow depth, warm golden hour light, subtle lens flare",
  "Small guesthouse with a bicycle parked outside, 35mm lens, soft morning light, travel postcard aesthetic, gentle color grading",
  "Road trip scene with a car on a long empty highway, 24mm lens, leading lines perspective, big sky, rich contrast, cinematic look",
  "Passport and boarding pass on a wooden table, 50mm macro lens, shallow depth, soft overhead light, detailed textures",
  "Traveler taking a photo of a landmark with a phone, 35mm lens, soft backlight, landmark slightly out of focus, candid moment",
  "Busy ferry terminal with travelers waiting in line, 24mm lens, documentary style, mixed artificial lighting, natural skin tones",
  "Mountain lodge seen from a passing hiker’s perspective, 35mm lens, slight motion blur on foreground, crisp distant lodge, 4k",
  "Traveler resting on a bench with a city skyline in the distance, 50mm lens, backlit silhouette, hazy skyline, sunset tones",
  "Train passing through a scenic valley viewed from a window, 24mm lens, motion blur foreground, sharp distant landscape, high dynamic range",
  "Multiple signposts pointing to different cities, 35mm lens, shallow depth, blue sky background, travel mood, natural saturation",
  "Coastal road with a parked car and open trunk, 24mm lens, golden hour, dramatic coastline, soft sun flare, cinematic palette",
  "Small airport runway with a propeller plane prepared for boarding, 35mm lens, clear sky, subtle heat haze, realistic details",
  "Traveler’s hands holding a guidebook in a hotel lobby, 50mm lens, warm interior lighting, shallow depth, soft background bokeh",
  "Backpacker crossing a simple wooden bridge over a stream, 24mm lens, dynamic mid-step capture, lush greenery, soft light",
  "Row of colorful houses in a popular tourist town, 24mm lens, bright daylight, rich saturation, clear architectural lines, 4k",
  "Traveler watching the sunset from a hostel rooftop, 35mm lens, backlit silhouette, wide city view, warm gradient sky",
  // street-photography (20)
  "Person crossing a street in front of a moving tram, 35mm lens, slightly low angle, motion blur in tram, sharp subject, high contrast",
  "Old man sitting on a bench watching people pass by, 50mm lens, candid capture, soft side light, muted urban color grading",
  "Reflections of pedestrians in a shop window, 35mm lens, layered composition with interior and exterior, soft contrast",
  "Street corner with a cyclist passing a parked car, 24mm lens, sense of motion, natural city light, subtle desaturation, 4k",
  "Vendor arranging goods on a makeshift stall, 35mm lens, documentary style, overhead awning light, rich textures and details",
  "Child playing with chalk drawings on the sidewalk, low-angle shot, 35mm lens, bright daylight, strong color contrast of chalk",
  "Man walking a dog past a graffiti-covered wall, 35mm lens, shallow depth of field, vibrant graffiti colors, natural expression",
  "Steam rising from a street vent on a cold day, 50mm lens, backlit vapor, cool ambient tones, high contrast, cinematic feel",
  "People waiting at a crosswalk, seen from ground level, 24mm lens, focus on shoes and street texture, shallow depth, urban mood",
  "Street musician performing near a subway entrance, 35mm lens, bokeh of city lights behind, warm tones, candid framing",
  "Crowded sidewalk during lunch hour, 24mm lens, slight motion blur, overhead perspective, bustling energy, realistic tones",
  "Solitary figure under a streetlamp at night, 50mm lens, strong chiaroscuro lighting, deep shadows, cinematic low-key grading",
  "Bicycles locked to a railing along a narrow street, 35mm lens, side light, repeating patterns, faded yet natural color palette",
  "Street café with customers sitting at small round tables, 35mm lens, shallow depth, warm late afternoon light, candid ambiance",
  "Person carrying an umbrella walking past a brightly lit shop, 50mm lens, reflections on wet pavement, strong color contrast",
  "Delivery person pushing a cart along a busy street, 35mm lens, panning motion blur, crisp subject, bright daytime lighting",
  "Two people chatting on a stairway outside an old building, 35mm lens, side lighting, weathered textures, intimate composition",
  "Raindrops splashing into a puddle on asphalt, macro lens, high shutter speed, sharp splash detail, reflections of city lights",
  "Skateboarder gliding through an urban plaza, 24mm lens, low angle, motion blur in wheels, strong geometric lines of architecture",
  "Pedestrian tunnel with people walking toward the light, 24mm lens, strong perspective lines, exposure balanced tunnel and exit",
  // film (20)
  "Dimly lit living room with a classic movie playing on TV, 35mm lens, warm tungsten light, screen glow reflecting on furniture, cinematic grain",
  "Vintage film camera resting on a wooden table, 50mm macro, shallow depth, side lighting emphasizing metal and leather textures",
  "Small cinema with rows of red seats and a lit screen, 24mm lens, low-light conditions, beam of projector light, film grain effect",
  "Film reel and clapperboard on a dark backdrop, 50mm lens, dramatic side light, high contrast, rich shadows, studio setup",
  "Person sitting alone in an empty theater watching a movie, 35mm lens, screen glow on face, soft shadows, moody cinematic palette",
  "Hand threading film into a projector, macro lens, shallow depth, warm tungsten light, detailed mechanical components",
  "Movie set with lights and stands but no actors, 24mm lens, mixed color temperature lights, wide composition, behind-the-scenes vibe",
  "Director’s chair placed next to a tripod camera, 35mm lens, studio environment, spotlit subject, neutral color grading",
  "Spotlights creating beams through haze on a soundstage, 24mm lens, volumetric lighting, dark surroundings, cinematic high contrast",
  "Pile of old VHS tapes stacked haphazardly, 50mm lens, soft diffused light, nostalgic color grading, subtle film grain",
  "Dark editing room with multiple screens glowing, 24mm lens, cool monitor light, deep shadows, high-tech cinematic tone",
  "Film poster lightbox on a cinema facade at night, 35mm lens, neon and street lights, reflections on wet pavement, high saturation",
  "Close-up of film negatives hanging to dry in a dim room, macro lens, warm tungsten light, bokeh background, detailed film texture",
  "Camera crane extended over an empty street set, 24mm lens, twilight ambient light, wide composition showing full rig, 4k",
  "Person holding a bucket of popcorn in a darkened theater, 50mm lens, strong contrast, screen glow on hands, shallow depth of field",
  "Table covered with storyboards and notes, 35mm lens, overhead shot, warm desk lamp, slightly chaotic composition, paper textures",
  "Red carpet laid out in front of a small theater, 24mm lens, evening light, soft crowd presence, subtle lens flare, cinematic vibe",
  "Old projector casting light beams in a dusty room, 35mm lens, volumetric light, heavy film grain aesthetic, warm nostalgic tones",
  "Row of film canisters labeled and stacked on shelves, 50mm lens, side light, high texture detail, neutral industrial color palette",
  "Script open on a table next to a cup of coffee, 50mm lens, shallow depth, warm overhead light, slight vignette, film-noir style",
  // landscape (20)
  "Rolling farmland with patchwork fields under a blue sky, aerial-like perspective, 35mm lens, high saturation greens and browns, 8k resolution",
  "Wide valley with a river weaving through the center, 24mm lens, early morning mist, soft light, high dynamic range",
  "Panorama of low hills fading into the distance with soft haze, 35mm lens, telephoto compression, gentle pastel tones",
  "Rocky plateau overlooking a vast plain, 24mm lens, strong foreground-midground-background separation, dramatic clouds",
  "Lake surrounded by gentle hills and scattered trees, 24mm lens, calm reflective water, golden hour backlight, photorealistic",
  "Grassy plain with distant mountains under overcast light, 35mm lens, muted color palette, soft contrast, subtle depth haze",
  "Coastline with cliffs and a small beach below, 24mm lens, elevated viewpoint, deep blue sea, crisp wave detail, 6k",
  "Rural landscape dotted with small houses and fields, 35mm lens, soft evening light, warm tones, high detail in structures",
  "Winding country road disappearing into the horizon, 24mm lens, leading lines, bright sky, gentle contrast, cinematic grading",
  "Broad valley floor with meandering streams and patches of forest, aerial-like view, natural color balance, high resolution",
  "Aerial view of a river delta merging into the sea, top-down composition, complex branching patterns, turquoise water, 8k",
  "Rolling hillside covered in dry grass and rocks, 35mm lens, low sun angle creating long shadows, earthy tones",
  "Plateau at dusk with pastel colors in the sky, 24mm lens, minimalistic composition, soft gradient, calm mood",
  "Distant city seen across open fields and gentle hills, 35mm lens, hazy skyline, crisp countryside foreground",
  "Layered mountain ridges gradually fading into mist, telephoto 200mm lens, blue atmospheric perspective, high detail",
  "Vast open steppe under a dramatic sky, 24mm lens, wide framing, big cloud formations, natural earthy palette",
  "Quiet bay with distant land forming a curved horizon, 35mm lens, soft reflections, subdued colors, cinematic calm",
  "Terraced fields climbing up the sides of hills, 24mm lens, repeating patterns, vibrant green, high clarity, 6k",
  "River carving a deep valley through a broad landscape, aerial-like view, strong contrast between light river and dark earth",
  "Sunrise casting long shadows across gentle slopes, 24mm lens, warm golden tones, crisp details, subtle lens flare",
  // portraits (20)
  "Close-up portrait of a person looking directly into the camera, 85mm lens, soft window light, shallow depth, natural skin texture, 4k",
  "Black-and-white headshot with strong side lighting, 85mm lens, high contrast, dramatic shadows, fine detail, studio background",
  "Portrait of a person seated in three-quarter view against a dark backdrop, 50mm lens, Rembrandt lighting, subtle vignette, neutral colors",
  "Person lit by warm indoor light, smiling slightly, 85mm lens, shallow depth, soft background bokeh, realistic skin tones",
  "Portrait of a person with their face partially in shadow, 50mm lens, split lighting, moody cinematic style, muted color grading",
  "Close-up of a person’s face with freckles visible, 85mm lens, natural daylight, ultra-detailed skin texture, gentle color palette",
  "Portrait of a person wearing glasses reflecting a soft light source, 85mm lens, crisp focus on eyes, slight catchlights, clean background",
  "Profile portrait of a person against a plain light-colored wall, 50mm lens, soft diffused light, minimalistic composition",
  "Portrait of a person with hair gently blowing in a breeze, 85mm lens, golden hour backlight, soft motion blur in hair, warm tones",
  "Person resting their chin on their hand, lost in thought, 50mm lens, soft side lighting, subtle background details, natural colors",
  "Portrait with shallow depth of field and strongly blurred background, 85mm lens, creamy bokeh, neutral color grading",
  "Close-up of a smiling face with clear catchlights in the eyes, 85mm lens, natural midday light, high clarity, cheerful tone",
  "Portrait of a person wearing a simple hoodie in a studio setting, 50mm lens, neutral backdrop, soft even lighting, modern style",
  "Person lit only by a nearby lamp in a dark room, 50mm lens, warm highlights, deep shadows, cinematic low-key mood",
  "Side-lit portrait emphasizing facial contours, 85mm lens, strong directional light, soft falloff, desaturated background",
  "Close-up portrait with wet hair and droplets on skin, 50mm lens, cool color grading, high-detail water droplets, high contrast",
  "Person reclining on a sofa looking at the camera, 35mm lens, natural indoor window light, relaxed pose, warm cozy tones",
  "Portrait of a person with folded arms leaning against a plain background, 50mm lens, even lighting, confident posture, neutral colors",
  "Close-up of a person’s face partially framed by their hands, 85mm lens, shallow depth, focus on eyes, soft background",
  "Person standing near a window with daylight creating soft highlights, 50mm lens, gentle contrast, pastel color palette",
  // city (20)
  "Skyline view of a dense city under a clear afternoon sky, 24mm lens, high dynamic range, crisp building details, 8k resolution",
  "Busy intersection surrounded by tall buildings, 24mm lens, slight motion blur in traffic, bright daylight, natural city colors",
  "City riverfront with reflections of lights in the water, 35mm lens, blue hour, long exposure, rich contrast, cinematic tone",
  "Apartment buildings with many lit windows at dusk, 35mm lens, telephoto compression, warm interior vs cool exterior tones",
  "City square with people sitting on benches and walking, 24mm lens, early evening light, balanced exposure, documentary style",
  "Long avenue lined with trees and traffic, 24mm lens, aerial or elevated view, strong leading lines, realistic color grading",
  "Tram moving along tracks between city blocks, 35mm lens, motion blur in tram, sharp surroundings, golden hour atmosphere",
  "Pedestrian bridge connecting two urban buildings, 24mm lens, symmetric framing, modern lines, soft overcast light",
  "City park surrounded by high-rise buildings, 24mm lens, mix of greenery and glass, bright midday, neutral color balance",
  "Cluster of glass office towers against a blue sky, 24mm lens, low angle, crisp reflections, strong contrast, 6k",
  "Elevated highway curving through a cityscape, 24mm lens, aerial style, visible cars, layered depth, cool tones",
  "Residential neighborhood with rows of similar houses, 35mm lens, soft evening light, orderly repetition, natural palette",
  "Night view of city traffic creating light streaks from above, long exposure, 24mm lens, high contrast, neon and tungsten mix",
  "Public square with a fountain and people gathering, 24mm lens, late afternoon light, subtle motion blur in people",
  "High viewpoint city panorama with distant haze, 24mm lens, golden hour, layered buildings, soft gradient sky",
  "Waterfront promenade with city buildings beyond, 24mm lens, sunset reflections, warm colors, relaxed atmosphere",
  "Construction crane towering over unfinished high-rises, 35mm lens, industrial atmosphere, neutral daylight, gritty detail",
  "City street lined with small shops and signage, 24mm lens, shallow depth on mid-ground, natural ambient light, busy textures",
  "Metro entrance surrounded by urban architecture, 24mm lens, slightly low angle, cool color grading, clean lines",
  "City at dawn with soft blue light and nearly empty streets, 24mm lens, minimal traffic, subtle window lights, quiet mood",
  // mountains (20)
  "Jagged mountain peaks under a deep blue sky, 24mm lens, high-contrast midday light, detailed rock textures, ultra high resolution",
  "Hiking trail winding along a mountain ridge, 24mm lens, leading lines, soft morning light, hazy distant peaks",
  "Layered mountain ranges fading into the distance at twilight, telephoto 200mm lens, blue atmospheric haze, subtle gradient sky",
  "Rocky mountain face with patches of vegetation, 35mm lens, side lighting, high detail in rock texture, neutral tones",
  "Gentle foothills leading up to towering peaks, 24mm lens, early morning light, rolling composition, natural greens",
  "Lake nestled at the base of tall mountains, 24mm lens, mirror reflection, calm water, warm sunset tones, 6k",
  "Clouds rolling over a mountain range at midday, 35mm lens, time-lapse-like still, dramatic cloud shapes, crisp peaks",
  "Mountain valley with a small stream running through it, 24mm lens, lush greenery, dynamic S-curve of water, soft light",
  "Solitary cabin on a grassy slope beneath high cliffs, 35mm lens, scale contrast, moody lighting, cinematic grading",
  "Winding road climbing up a steep mountain pass, 24mm lens, leading line, soft haze, bright highlights and deep shadows",
  "Low clouds partially obscuring mountain summits, 35mm lens, cool tones, atmospheric vibes, high resolution",
  "Wide view from a mountain lookout platform, 24mm lens, railings in foreground, expansive valley below, bright daylight",
  "Distant snow-dusted peaks under soft morning light, telephoto lens, pinkish alpenglow, high detail, subtle saturation",
  "Rocky outcrops rising from a high-altitude plateau, 24mm lens, strong midday sun, contrasty textures, crisp air feel",
  "Sunlight breaking through clouds over a mountain valley, 24mm lens, volumetric light rays, deep shadows, dramatic palette",
  "Hikers standing near a summit marker on a windy ridge, 24mm lens, dynamic body language, cloudy sky, documentary style",
  "Mountain meadow with small scattered rocks and flowers, 35mm lens, shallow depth on foreground, soft diffused light",
  "Dramatic cliff faces rising from a deep valley floor, 24mm lens, vertical framing, strong contrast, cool tones, 4k",
  "Distant mountains reflected faintly in a still lake, 35mm lens, minimalistic composition, pastel clouds, soft focus",
  "Cable car ascending a mountain slope, 35mm lens, diagonal composition, layered depth, natural saturation",
  // forest (20)
  "Dense forest with tall straight trunks and dappled light, 24mm lens, rich green tones, high dynamic range, subtle fog, 6k",
  "Narrow forest path covered in fallen leaves, 35mm lens, leading lines, warm autumn colors, soft backlighting",
  "Sunlight streaming through tree branches creating light beams, 24mm lens, slight haze, high contrast rays, cinematic mood",
  "Small clearing surrounded by thick woods, 24mm lens, bright central patch, darker forest edges, balanced exposure",
  "Close-up of tree bark textures with patches of moss, macro lens, extreme detail, soft diffused light, earthy color palette",
  "Forest floor covered in ferns and undergrowth, 35mm lens, overhead angle, rich shadows, saturated greens",
  "Wooden footbridge crossing a forest stream, 24mm lens, central composition, long exposure smooth water, soft light",
  "Tall pine trees with a carpet of needles beneath, 24mm lens, low-angle view upward, cool daylight, subtle lens flare",
  "Dense foliage forming a tunnel above a trail, 24mm lens, vanishing point perspective, soft filtered light, natural greens",
  "Forest edge where trees meet an open field, 35mm lens, clear boundary, golden hour light, gentle contrasting colors",
  "Soft fog drifting among tree trunks in a quiet forest, 24mm lens, muted tones, low contrast, mysterious atmosphere",
  "Fallen log covered in mushrooms and moss, 35mm lens, close-up, soft side lighting, high texture detail",
  "Small cabin hidden among thick forest trees, 35mm lens, dappled light, warm cabin tones contrasting cool greens",
  "Sunlight painting bright patches on the forest floor, 35mm lens, high contrast patterns, warm highlights, deep shadows",
  "Steep hillside densely covered with forest, 24mm lens, aerial-like view, varied canopy textures, natural color grading",
  "Intertwined roots exposed along a forest path, 35mm lens, low angle, high detail in roots, soft ambient light",
  "Raindrops clinging to leaves in a dim forest, macro lens, shallow depth, cool tones, bokeh of darker background",
  "Narrow stream winding through a lush wooded area, 24mm lens, leading line water, soft reflections, balanced exposure",
  "Forest seen from above with varied tree canopies, top-down view, rich greens, textured canopy shapes, 8k resolution",
  "Calm forest pond reflecting surrounding trees, 35mm lens, symmetrical composition, soft light, slight surface ripples",
  // wildlife (20)
  "Deer standing alert at the edge of a forest clearing, 200mm lens, shallow depth, early morning mist, natural brown and green palette",
  "Heron standing in shallow water waiting for fish, 200mm lens, mirror reflection on water, soft sunrise colors, high detail",
  "Small herd of antelope grazing in tall grass, 300mm lens, compressed perspective, warm sunset light, savanna background",
  "Wild boar emerging from dense undergrowth, 200mm lens, dark forest backdrop, dramatic side lighting, gritty texture",
  "Bird of prey perched on a branch scanning the horizon, 400mm lens, blurred background, crisp feather detail, cool tones",
  "Seal resting on a rock in a coastal environment, 200mm lens, soft overcast light, wet textures, sea in background",
  "Group of penguins standing together on a shoreline, 200mm lens, cold blue and white palette, crisp detail, icy environment",
  "Monkey sitting on a tree branch observing surroundings, 200mm lens, jungle background blur, natural warm tones",
  "Cranes flying in formation across a wide sky, 200mm lens, telephoto compression, soft clouds, high resolution",
  "Fox trotting along a snowy path, 200mm lens, dark eyes, warm fur against cool snow, high contrast, 4k",
  "Wild horses running across an open plain, 200mm lens, motion blur in legs, dust clouds, warm golden light, cinematic",
  "Small rodent peeking from a burrow entrance, macro telephoto, shallow depth, earthy colors, soft natural light",
  "Wild goat balanced on a steep rocky ledge, 300mm lens, vertical composition, dramatic cliffs, harsh natural light",
  "Flock of birds taking off from a field, 200mm lens, motion captured mid-flight, backlit wings, muted background",
  "Large bird gliding low over marshland, 300mm lens, reflection in water, soft late afternoon sunlight, subtle haze",
  "Turtle slowly crossing a dirt path in natural surroundings, 135mm lens, low angle, sharp shell texture, warm tones",
  "Seal diving into the sea near a rocky coast, 200mm lens, splash frozen mid-air, cool blues and greys, high shutter speed",
  "Wild rabbit in tall grass with ears raised, 200mm lens, shallow depth, bokeh grass foreground, natural colors",
  "Small group of wolves standing in a clearing, 200mm lens, moody overcast light, forest background, tense atmosphere",
  "Hedgehog exploring a patch of natural ground, 135mm lens, low macro angle, detailed spines and soil texture",
  // flowers (20)
  "Close-up of a single rose with water droplets on its petals, macro lens, soft diffused light, deep red tones, black background, 4k",
  "Field of wildflowers in soft afternoon light, 35mm lens, shallow depth in foreground blooms, pastel color palette",
  "Macro image of a flower’s center showing fine pollen details, extreme close-up, strong contrast, natural colors",
  "Potted plant with blossoms on a windowsill, 50mm lens, backlit petals, bright but soft exposure, interior context",
  "Bouquet of mixed flowers in a clear glass vase, 50mm lens, neutral background, subtle reflections, vibrant but realistic colors",
  "Garden bed filled with different flowering plants, 24mm lens, high detail, bright daylight, rich saturation",
  "Close-up of flower petal texture with subtle color gradients, macro lens, super shallow depth, soft light, abstract feel",
  "Row of flowers planted along a narrow pathway, 35mm lens, leading line perspective, warm golden light",
  "Cluster of blooms against a dark blurred background, 85mm lens, strong separation, high contrast, rich colors",
  "Wildflowers growing between rocks on a hillside, 35mm lens, side lighting, gritty rock textures, soft petals",
  "Blossoms gently backlit by the sun, 50mm lens, translucent petals, visible sun flare, dreamy pastel grading",
  "Single bright flower standing out in a meadow, 85mm lens, shallow depth, desaturated background, vibrant subject",
  "Close-up of overlapping petals of a fully opened bloom, macro lens, creamy bokeh, lush color gradients, 4k",
  "Cut flowers wrapped in paper lying on a table, 50mm lens, overhead shot, muted rustic tones, soft shadows",
  "Small flowers growing along the edge of a pond, 35mm lens, reflections in water, soft early light, calm mood",
  "Hanging basket overflowing with flowers, 35mm lens, bright daylight, slight breeze motion blur, saturated colors",
  "Macro shot of tiny blossoms on a slender green stem, extreme close-up, shallow depth, soft background bokeh",
  "Flowers placed on stone steps leading to a doorway, 35mm lens, mix of cool stone and warm petals, natural light",
  "Hedge covered in blooming flowers along a walkway, 24mm lens, repeating pattern, strong perspective, high detail",
  "Fallen flower petals scattered across the ground, 35mm lens, overhead view, soft directional light, muted palette",
  // the-holidays-illustrations (20)
  "Photorealistic illustration-style image of a cozy living room with a decorated holiday tree and soft string lights, warm tungsten glow, 35mm lens look, cinematic grading",
  "Realistic illustration-like scene of a dining table set for a festive holiday meal, 35mm lens aesthetics, candles lit, shallow depth of field, warm tones",
  "Holiday card-style view of a small town square with seasonal decorations, 24mm lens, gentle evening light, subtle snow, soft illustrative color grading",
  "Wrapped gifts stacked neatly beside a doorway, 50mm lens, warm interior light from the side, soft shadows, holiday color palette",
  "Holiday window display with glowing lights and ornaments, 35mm lens, nighttime city reflections, bokeh highlights, rich saturated colors",
  "Family gathering around a festive table, 35mm lens look, warm ambient lighting, gentle film grain effect, candid composition",
  "Holiday wreath hanging on a wooden front door, 50mm lens, soft overcast exterior light, crisp detail, warm color accents",
  "Street lined with decorated shop windows, 24mm lens, blue hour atmosphere, soft falling snow, festive window glows",
  "Fireplace mantel adorned with candles and seasonal decor, 35mm lens, low tungsten light, cozy cinematic mood, shallow depth",
  "Night street with strings of holiday lights overhead, 24mm lens, wet pavement reflections, high contrast, warm and cool color mix",
  "Holiday kitchen scene with cookies cooling on a tray, 35mm lens, warm overhead light, baking utensils scattered, homely feel",
  "Festive market stall selling seasonal items, 35mm lens, ambient warm light, busy but soft background, documentary style",
  "Bedroom with soft holiday lights around the window, 35mm lens, dim warm lighting, cozy bedding textures, bokeh light strands",
  "Snow-dusted town with warm lights in windows, 24mm lens, twilight blue sky, glowing interiors, slightly painterly grading",
  "Holiday-themed still life with ornaments, pine branches, and ribbons, 50mm lens, soft studio lighting, dark background, rich colors",
  "Street corner with a decorated lamppost and subtle snow, 35mm lens, warm lamppost glow, cool ambient street tones",
  "Table with holiday cards, stamps, and envelopes, 50mm lens, overhead shot, warm desk lamp, gentle shadows, muted palette",
  "Hallway decorated with garlands and soft light, 24mm lens, central perspective, warm highlights, cinematic interior",
  "Holiday living room scene viewed from outside through a window, 35mm lens, reflections on glass, interior warm glow, winter exterior",
  "Festive store entrance with seasonal signage, 24mm lens, bright display lights, slight tilt for dynamic composition, rich colors",
  // hand-drawn (20)
  "Photorealistic photo of a sketchbook page filled with pencil drawings of faces, 50mm lens, soft overhead light, graphite texture clearly visible",
  "Hand holding a pen above a half-finished ink drawing, 85mm lens, shallow depth, strong focus on pen tip and linework, warm desk light",
  "Table covered with colored pencils and doodled paper, 35mm lens, slightly messy arrangement, bright but soft light, natural colors",
  "Wall with taped-up hand-drawn character designs, 35mm lens, soft ambient studio light, slight curvature of paper edges, high detail",
  "Notebook open to a page of rough architectural sketches, 50mm lens, overhead shot, neutral desk background, fine pencil lines",
  "Desk with markers, erasers, and a partially colored illustration, 35mm lens, warm lighting, shallow depth of field on artwork",
  "Hand erasing parts of a graphite drawing on textured paper, macro lens, visible eraser crumbs and smudges, soft side light",
  "Studio workspace scattered with hand-drawn comic panels, 24mm lens, wide overview, mixed lighting, creative chaotic feel",
  "Detailed hand-drawn cityscape laid flat on a desk, 35mm lens, overhead, high contrast between ink and paper, neutral color grading",
  "Close-up of ink lines and crosshatching on white paper, macro lens, extreme detail, soft raking light, subtle shadows",
  "Multiple sketchbooks stacked with edges showing pencil marks, 50mm lens, side lighting, muted tones, high texture detail",
  "Hand adding watercolor to an outlined drawing, 50mm macro, shallow depth, bright pigment colors, soft natural light",
  "Corkboard covered with pinned hand-drawn concepts, 35mm lens, studio environment, warm spotlight, paper edges curling slightly",
  "Drawing tablet next to sheets of traditional sketches, 35mm lens, cool tablet glow, warm desk lamp, mixed lighting",
  "Hand-drawn map spread out on a wooden surface, 35mm lens, overhead view, antique-style color grading, detailed linework",
  "Close-up of colored pencil shading on a character illustration, macro lens, visible grain of paper, soft diffuse light",
  "Classroom desk covered in simple hand-drawn doodles, 35mm lens, natural daylight, slight wear on desk surface, casual mood",
  "Series of hand-drawn frames forming a rough storyboard, 35mm lens, overhead, high contrast black ink on white paper",
  "Large poster-sized hand-drawn illustration taped to a wall, 35mm lens, slight perspective distortion, studio ambient light",
  "Pencil case spilling art supplies next to sketch pages, 35mm lens, shallow depth of field, warm indoor lighting, casual composition",
  // fashion-beauty (20)
  "Person standing against a plain background wearing a stylish coat, 85mm lens, studio lighting, fashion editorial vibe, clean color palette",
  "Row of clothes hanging on a rack in a boutique, 35mm lens, shallow depth on mid garments, soft interior light, pastel tones",
  "Close-up of a person adjusting the collar of a tailored jacket, 85mm lens, focus on hands and fabric detail, muted background",
  "Shoe display with neatly arranged pairs on shelves, 35mm lens, bright even lighting, high clarity, neutral color grading",
  "Person applying lipstick in front of a mirror, 85mm lens, focus on lips and hand, soft vanity light, subtle reflection",
  "Table with scattered cosmetics and a small handheld mirror, 50mm lens, overhead shot, warm lighting, elegant composition",
  "Person wearing a long flowing dress in natural daylight, 50mm lens, gentle motion blur in fabric, soft backlight, pastel colors",
  "Folded sweaters stacked in a fashion store, 50mm lens, side lighting, rich texture detail, slightly desaturated palette",
  "Close-up of eyes with carefully applied makeup and subtle shimmer, 100mm macro, crisp eyelashes, soft skin texture",
  "Person’s hand holding a perfume bottle near their neck, 85mm lens, shallow depth, glass reflections, warm tones",
  "Full-length mirror reflecting an outfit in a tidy bedroom, 35mm lens, natural window light, soft color grading, lifestyle feel",
  "Jewelry displayed on a velvet surface under soft light, 50mm macro, sparkling highlights, deep shadows, rich color pop",
  "Close-up of a person’s hands with neatly painted nails, 85mm lens, shallow depth, soft background, neutral tones",
  "Person trying on shoes while seated on a bench in a shop, 35mm lens, candid angle, store lighting, natural color",
  "Runway-style setup with a single model walking toward the camera, 85mm lens, strong backlight, shallow depth, high-fashion mood",
  "Scarves and accessories arranged on a wooden table, 50mm lens, overhead, warm tones, soft diffused light, styled composition",
  "Close-up of fabric texture of an elegant garment, macro lens, detailed weave and sheen, soft side light, neutral colors",
  "Person styling their hair in front of a bathroom mirror, 35mm lens, practical overhead light, slight reflection blur, everyday fashion",
  "Minimalist vanity with makeup brushes in a cup, 50mm lens, soft morning window light, bright clean background, pastel tones",
  "Sunglasses displayed in neat rows in a store, 35mm lens, reflections on lenses, cool store lighting, high clarity",
  // textures-patterns (20)
  "Close-up of peeling paint on an old wooden door, macro lens, high texture detail, side lighting, muted pastel colors",
  "Raindrops forming patterns on a glass window, 85mm lens, shallow depth, blurred background lights, cool ambient tones",
  "Macro image of fabric weave showing individual threads, extreme close-up, soft diffused light, neutral color palette",
  "Hexagonal tiles forming a repeating floor pattern, 35mm lens, top-down view, strong geometry, subtle reflections",
  "Close-up of ripples on the surface of shallow water, 85mm lens, side light, high contrast, soft blues and whites",
  "Cracked mud creating irregular natural patterns, 35mm lens, overhead shot, warm earthy tones, sharp detail",
  "Light and shadow creating stripes on a plain wall, 50mm lens, hard sunlight through blinds, high contrast, minimalist",
  "Bricks laid in a herringbone pattern on a path, 35mm lens, overhead, strong texture, earthy red-brown palette",
  "Macro shot of bubbles clustered together forming round shapes, extreme close-up, bright backlight, high contrast reflections",
  "Tree rings visible on a freshly cut log, 50mm macro, radial pattern, warm tones, soft side lighting",
  "Metal surface with brushed linear texture, macro lens, cool metallic tones, soft directional light, high detail",
  "Shadows from blinds creating parallel lines on a table, 50mm lens, strong contrast, warm interior light",
  "Close-up of a stone wall with varied shapes and gaps, 35mm lens, front lighting, high texture clarity, neutral colors",
  "Footprints forming a repeating pattern in sand, 35mm lens, low-angle side light, long shadows, warm sunset tones",
  "Macro image of a woven basket showing complex interlacing, extreme close-up, warm natural light, detailed texture",
  "Patterned wallpaper with a subtle repeating motif, 50mm lens, soft flat lighting, gentle pastel tones",
  "Close-up of foam on top of a drink viewed from above, macro lens, detailed bubbles, warm tonal range, shallow depth",
  "Overlapping leaves forming a natural textured surface, 50mm lens, overhead, varied greens, soft diffuse light",
  "Overlapping circular stains on a weathered table, 50mm lens, high contrast, grungy texture, muted tones",
  "Reflections on a tiled floor creating geometric shapes, 35mm lens, low angle, cool indoor lighting, high clarity",
];

async function processImage(
  imageBuffer: Buffer,
  outputPath: string,
): Promise<void> {
  await sharp(imageBuffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: "cover",
      position: "center",
    })
    .jpeg({
      quality: 85,
      progressive: true,
    })
    .toFile(outputPath);
}

async function generateImages(count: number): Promise<void> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("Error: GOOGLE_API_KEY environment variable is required");
    console.log(
      "Usage: GOOGLE_API_KEY=your_key bun run scripts/generate-ai-images.ts [count]",
    );
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const model = "gemini-3-pro-image-preview";

  console.log(`\n🍌 Generating ${count} AI images...\n`);

  // Get existing images to determine starting index
  const existingFiles = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith(".jpg"));
  const startIndex = existingFiles.length;

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < count; i++) {
    const promptIndex = (startIndex + i) % IMAGE_PROMPTS.length;
    const prompt = IMAGE_PROMPTS[promptIndex];
    const filename = `ai_${String(startIndex + i).padStart(4, "0")}.jpg`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    console.log(
      `[${i + 1}/${count}] Generating: "${prompt.substring(0, 50)}..."`,
    );

    try {
      const tools = [
        {
          googleSearch: {},
        },
      ];

      const config = {
        responseModalities: ["IMAGE", "TEXT"],
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K",
        },
        tools,
      };

      const contents = [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ];

      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      let imageData: Buffer | null = null;

      for await (const chunk of response) {
        if (
          !chunk.candidates ||
          !chunk.candidates[0].content ||
          !chunk.candidates[0].content.parts
        ) {
          continue;
        }

        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          if (inlineData.mimeType?.startsWith("image/")) {
            imageData = Buffer.from(inlineData.data || "", "base64");
            break;
          }
        }
      }

      if (!imageData) {
        throw new Error("No image data in response");
      }

      // Process and save image
      await processImage(imageData, outputPath);

      console.log(`   ✅ Saved: ${filename}`);
      successCount++;

      // Rate limiting - wait between requests
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(
        `   ❌ Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      failCount++;

      // Wait longer after errors
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Output: ${OUTPUT_DIR}\n`);
}

// Parse command line arguments
const count = parseInt(process.argv[2] || "10", 10);

if (isNaN(count) || count < 1) {
  console.error("Error: Please provide a valid number of images to generate");
  process.exit(1);
}

generateImages(count);
