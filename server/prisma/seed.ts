import 'dotenv/config'
import { PrismaClient, ProjectCategory } from '@prisma/client'
import { hashPassword } from '../src/utils/password'

const prisma = new PrismaClient()

const CLOUDINARY_BASE = 'https://res.cloudinary.com/av1-company-placeholder/image/upload/v1/av1-company'
const CLOUDINARY_VIDEO_BASE = 'https://res.cloudinary.com/av1-company-placeholder/video/upload/v1/av1-company'

function img(path: string): { url: string; publicId: string } {
  const publicId = `av1-company/${path}`
  return { url: `${CLOUDINARY_BASE}/${path}.jpg`, publicId }
}

function vid(path: string): { url: string; publicId: string } {
  const publicId = `av1-company/${path}`
  return { url: `${CLOUDINARY_VIDEO_BASE}/${path}.mp4`, publicId }
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@av1-company.al'
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!'
  const name = process.env.SEED_ADMIN_NAME ?? 'AV1 Admin'

  const passwordHash = await hashPassword(password)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name, role: 'ADMIN', isActive: true },
  })

  console.log(`  ✓ Admin user ready: ${admin.email}`)
}

async function seedEditor() {
  const email = process.env.SEED_EDITOR_EMAIL ?? 'editor@av1-company.al'
  const password = process.env.SEED_EDITOR_PASSWORD ?? 'ChangeMe123!'
  const name = process.env.SEED_EDITOR_NAME ?? 'AV1 Editor'

  const passwordHash = await hashPassword(password)

  const editor = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name, role: 'EDITOR', isActive: true },
  })

  console.log(`  ✓ Editor user ready: ${editor.email}`)
}

async function seedSettings() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: 'AV1-Company',
      phone: '+383 45 644 102',
      email: 'av1.company10@gmail.com',
      address: 'Rruga e Kavajës, Peja 1001, Kosovo',
      workingHours: 'Mon – Sat: 08:00 – 18:00',
      facebookUrl: 'https://www.facebook.com/profile.php?id=61573610664993',
      instagramUrl: 'https://instagram.com/av1company',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rruga+e+Kavaj%C3%ABs+Peja',
    },
  })
  console.log('  ✓ Settings seeded')
}

async function seedProjects() {
  const projects = [
    {
      slug: 'peja-villa-garden',
      titleEn: 'The Villa Garden in Peja',
      titleDe: 'Der Villagarten in Peja',
      titleSq: 'Kopshti i Vilës në Pejë',
      descriptionEn:
        'A Mediterranean garden with harmonized greenery, stone pathways and seating areas naturally integrated with the villa\'s architecture.',
      descriptionDe:
        'Ein mediterraner Garten mit harmonischem Grün, Steinwegen und Sitzbereichen, die sich natürlich in die Architektur der Villa einfügen.',
      descriptionSq:
        'Një kopsht mesdhetar me gjelbërim të harmonizuar, shtigje guri dhe zona ulëse të integruara natyrshëm me arkitekturën e vilës.',
      category: ProjectCategory.GARDENS,
      location: 'Peja',
      year: 2024,
      services: ['Garden Design', 'Greenery Maintenance'],
      image: img('projects/peja-villa-garden/main'),
    },
    {
      slug: 'vlora-infinity-pool',
      titleEn: 'The Infinity Pool in Vlora',
      titleDe: 'Der Infinity-Pool in Vlora',
      titleSq: 'Pishina Infinity në Vlorë',
      descriptionEn: 'An infinity pool with sea views, integrated with a timber deck and underwater LED lighting.',
      descriptionDe: 'Ein Infinity-Pool mit Meerblick, integriert mit einer Holzterrasse und LED-Unterwasserbeleuchtung.',
      descriptionSq: 'Pishinë infinity me pamje nga deti, e integruar me një terrasë druri dhe ndriçim LED nënujor.',
      category: ProjectCategory.POOLS,
      location: 'Vlora',
      year: 2024,
      services: ['Pools', 'Terraces'],
      image: img('projects/vlora-infinity-pool/main'),
    },
    {
      slug: 'pogradec-lake-terrace',
      titleEn: 'The Lakeview Terrace, Pogradec',
      titleDe: 'Die Seeblick-Terrasse, Pogradec',
      titleSq: 'Terasa me Pamje nga Liqeni, Pogradec',
      descriptionEn: 'A raised timber terrace with pergola, designed to capture every sunset over the lake.',
      descriptionDe: 'Eine erhöhte Holzterrasse mit Pergola, konzipiert, um jeden Sonnenuntergang über dem See einzufangen.',
      descriptionSq: 'Terracë e ngritur druri me pergola, e projektuar për të kapur çdo perëndim dielli mbi liqen.',
      category: ProjectCategory.TERRACES,
      location: 'Pogradec',
      year: 2023,
      services: ['Terraces', 'Outdoor Paving'],
      image: img('projects/pogradec-lake-terrace/main'),
    },
    {
      slug: 'fier-natural-stone-paving',
      titleEn: 'Natural Stone Paving, Fier',
      titleDe: 'Natursteinpflaster, Fier',
      titleSq: 'Shtrime me Gur Natyral, Fier',
      descriptionEn: 'Elegant natural stone paving for the main entrance and garden pathways.',
      descriptionDe: 'Elegantes Natursteinpflaster für den Haupteingang und die Gartenwege.',
      descriptionSq: 'Shtrime elegante me gurë natyralë për hyrjen kryesore dhe shtigjet e kopshtit.',
      category: ProjectCategory.PAVING,
      location: 'Fier',
      year: 2022,
      services: ['Outdoor Paving'],
      image: img('projects/fier-natural-stone-paving/main'),
    },
  ]

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: {
        slug: project.slug,
        titleEn: project.titleEn,
        titleDe: project.titleDe,
        titleSq: project.titleSq,
        descriptionEn: project.descriptionEn,
        descriptionDe: project.descriptionDe,
        descriptionSq: project.descriptionSq,
        category: project.category,
        location: project.location,
        year: project.year,
        services: project.services,
        image: project.image.url,
        imagePublicId: project.image.publicId,
        gallery: [],
        isPublished: true,
      },
    })
  }
  console.log(`  ✓ ${projects.length} projects seeded`)
}

async function seedGalleryImages() {
  const images = [
    {
      id: 'seed-gallery-garden-seating-corner',
      titleEn: 'A Seating Corner Hidden in Greenery',
      titleDe: 'Eine Sitzecke Versteckt im Grün',
      titleSq: 'Kënd Ulëse i Fshehur në Gjelbërim',
      descriptionEn: 'A quiet seating corner tucked away among dense greenery.',
      descriptionDe: 'Eine ruhige Sitzecke, verborgen im dichten Grün.',
      descriptionSq: 'Një kënd i qetë ulëse, i fshehur mes gjelbërimit dendur.',
      category: ProjectCategory.GARDENS,
      image: img('gallery/garden-seating-corner'),
    },
    {
      id: 'seed-gallery-pool-sunset-view',
      titleEn: 'The Pool at Sunset',
      titleDe: 'Der Pool bei Sonnenuntergang',
      titleSq: 'Pishina në Perëndim të Diellit',
      descriptionEn: 'A view of the pool during sunset.',
      descriptionDe: 'Blick auf den Pool bei Sonnenuntergang.',
      descriptionSq: 'Pamje drejt pishinës gjatë perëndimit të diellit.',
      category: ProjectCategory.POOLS,
      image: img('gallery/pool-sunset-view'),
    },
    {
      id: 'seed-gallery-terrace-lake-sunset',
      titleEn: 'The Lakeview Terrace at Dusk',
      titleDe: 'Die Seeblick-Terrasse in der Dämmerung',
      titleSq: 'Terasa me Pamje Liqeni në Muzg',
      descriptionEn: 'The raised terrace overlooking the lake at dusk.',
      descriptionDe: 'Die erhöhte Terrasse mit Seeblick in der Dämmerung.',
      descriptionSq: 'Terasa e ngritur me pamje drejt liqenit në muzg.',
      category: ProjectCategory.TERRACES,
      image: img('gallery/terrace-lake-sunset'),
    },
    {
      id: 'seed-gallery-paving-entrance-stone',
      titleEn: 'The Natural Stone Entrance',
      titleDe: 'Der Natursteineingang',
      titleSq: 'Hyrja me Gur Natyral',
      descriptionEn: 'The main entrance paved with natural stone.',
      descriptionDe: 'Der Haupteingang, gepflastert mit Naturstein.',
      descriptionSq: 'Hyrja kryesore e shtruar me gur natyral.',
      category: ProjectCategory.PAVING,
      image: img('gallery/paving-entrance-stone'),
    },
    {
      id: 'seed-gallery-yard-lounge-evening',
      titleEn: 'The Yard in Evening Light',
      titleDe: 'Der Hof im Abendlicht',
      titleSq: 'Oborri në Dritën e Mbrëmjes',
      descriptionEn: 'The lounge area in the yard, softly lit in the evening.',
      descriptionDe: 'Der Loungebereich im Hof, sanft beleuchtet am Abend.',
      descriptionSq: 'Zona e lounge-it në oborr, ndriçuar butësisht në mbrëmje.',
      category: ProjectCategory.YARDS,
      image: img('gallery/yard-lounge-evening'),
    },
    {
      id: 'seed-gallery-terrace-pergola-detail',
      titleEn: 'A Timber Pergola Detail',
      titleDe: 'Detailansicht der Holzpergola',
      titleSq: 'Detaj i Pergolës Druri',
      descriptionEn: 'A detail of the timber pergola above the terrace.',
      descriptionDe: 'Eine Detailansicht der Holzpergola über der Terrasse.',
      descriptionSq: 'Detaj i pergolës prej druri mbi terracë.',
      category: ProjectCategory.TERRACES,
      image: img('gallery/terrace-pergola-detail'),
    },
  ]

  for (let i = 0; i < images.length; i += 1) {
    const item = images[i]!
    const data = {
      titleEn: item.titleEn,
      titleDe: item.titleDe,
      titleSq: item.titleSq,
      descriptionEn: item.descriptionEn,
      descriptionDe: item.descriptionDe,
      descriptionSq: item.descriptionSq,
      category: item.category,
      image: item.image.url,
      imagePublicId: item.image.publicId,
      order: i,
      isPublished: true,
    }
    await prisma.galleryImage.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data },
    })
  }
  console.log(`  ✓ ${images.length} gallery images seeded`)
}

async function seedBeforeAfterProjects() {
  const items = [
    {
      id: 'seed-before-after-peja-yard-revival',
      titleEn: 'From Neglected Yard to Modern Oasis',
      titleDe: 'Vom Vernachlässigten Hof zur Modernen Oase',
      titleSq: 'Nga Oborr i Braktisur në Oaz Modern',
      descriptionEn:
        'An overgrown yard with wild grass and cracked concrete was transformed into an outdoor living space with modern paving, curated greenery and seating areas.',
      descriptionDe:
        'Ein überwucherter Hof mit wildem Gras und rissigem Beton wurde in einen Außenwohnbereich mit modernem Pflaster, gepflegtem Grün und Sitzbereichen verwandelt.',
      descriptionSq:
        'Një oborr i mbipopulluar me bar të egër dhe beton të plasaritur u shndërrua në një hapësirë jetese të jashtme me shtrime moderne, gjelbërim të kuruar dhe zona ulëse.',
      workCompletedEn: 'Paving, Seating Areas & Greenery',
      workCompletedDe: 'Pflasterarbeiten, Sitzbereiche & Grünanlagen',
      workCompletedSq: 'Shtrime, Zona Ulëse & Gjelbërim',
      completionTimeEn: '4 Weeks',
      completionTimeDe: '4 Wochen',
      completionTimeSq: '4 Javë',
      location: 'Peja',
      category: ProjectCategory.YARDS,
      year: 2024,
      before: img('transformations/peja-yard-revival/before'),
      after: img('transformations/peja-yard-revival/after'),
    },
    {
      id: 'seed-before-after-vlora-pool-revival',
      titleEn: 'An Old Pool Transformed into a Luxury Retreat',
      titleDe: 'Ein Alter Pool Verwandelt in eine Luxuriöse Oase',
      titleSq: 'Pishina e Vjetër Transformohet në Ambient Luksoz',
      descriptionEn: 'An aging pool was fully modernized with new tiling, LED lighting and a surrounding timber deck.',
      descriptionDe:
        'Ein alternder Pool wurde vollständig modernisiert mit neuen Fliesen, LED-Beleuchtung und einer umgebenden Holzterrasse.',
      descriptionSq: 'Një pishinë e vjetruar u modernizua plotësisht me pllaka të reja, ndriçim LED dhe një terrasë druri përreth.',
      workCompletedEn: 'Pool Retiling, LED Lighting & Timber Deck',
      workCompletedDe: 'Poolneufliesung, LED-Beleuchtung & Holzterrasse',
      workCompletedSq: 'Rifliza Pishine, Ndriçim LED & Terrasë Druri',
      completionTimeEn: '6 Weeks',
      completionTimeDe: '6 Wochen',
      completionTimeSq: '6 Javë',
      location: 'Vlora',
      category: ProjectCategory.POOLS,
      year: 2024,
      before: img('transformations/vlora-pool-revival/before'),
      after: img('transformations/vlora-pool-revival/after'),
    },
    {
      id: 'seed-before-after-fier-paving-revival',
      titleEn: 'Old Concrete Paths Replaced with Natural Stone',
      titleDe: 'Alte Betonwege Ersetzt Durch Naturstein',
      titleSq: 'Shtigje të Vjetra Betoni Zëvendësohen me Gur Natyral',
      descriptionEn:
        'Cracked concrete paths were replaced with natural stone paving, giving the home\'s entrance an entirely new look.',
      descriptionDe:
        'Rissige Betonwege wurden durch Natursteinpflaster ersetzt, was dem Hauseingang ein völlig neues Erscheinungsbild verleiht.',
      descriptionSq:
        'Shtigjet e çara të betonit u zëvendësuan me shtrime guri natyral, duke i dhënë hyrjes së shtëpisë një pamje krejt të re.',
      workCompletedEn: 'Natural Stone Paving',
      workCompletedDe: 'Natursteinpflasterung',
      workCompletedSq: 'Shtrim me Gur Natyral',
      completionTimeEn: '2 Weeks',
      completionTimeDe: '2 Wochen',
      completionTimeSq: '2 Javë',
      location: 'Fier',
      category: ProjectCategory.PAVING,
      year: 2022,
      before: img('transformations/fier-paving-revival/before'),
      after: img('transformations/fier-paving-revival/after'),
    },
  ]

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]!
    const data = {
      titleEn: item.titleEn,
      titleDe: item.titleDe,
      titleSq: item.titleSq,
      descriptionEn: item.descriptionEn,
      descriptionDe: item.descriptionDe,
      descriptionSq: item.descriptionSq,
      workCompletedEn: item.workCompletedEn,
      workCompletedDe: item.workCompletedDe,
      workCompletedSq: item.workCompletedSq,
      completionTimeEn: item.completionTimeEn,
      completionTimeDe: item.completionTimeDe,
      completionTimeSq: item.completionTimeSq,
      location: item.location,
      category: item.category,
      year: item.year,
      beforeImage: item.before.url,
      beforeImagePublicId: item.before.publicId,
      afterImage: item.after.url,
      afterImagePublicId: item.after.publicId,
      order: i,
      isPublished: true,
    }
    await prisma.beforeAfterProject.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data },
    })
  }
  console.log(`  ✓ ${items.length} before/after projects seeded`)
}

async function seedVideos() {
  const videos = [
    {
      id: 'seed-video-peja-villa-tour',
      titleEn: 'Video Tour: The Villa Garden in Peja',
      titleDe: 'Video-Tour: Der Villagarten in Peja',
      titleSq: 'Tur Video: Kopshti i Vilës në Pejë',
      descriptionEn: 'A video walkthrough of the villa garden in Peja, from the entrance to its most intimate corners.',
      descriptionDe: 'Ein Video-Rundgang durch den Villagarten in Peja, vom Eingang bis zu seinen intimsten Ecken.',
      descriptionSq: 'Një udhëtim video nëpër kopshtin e vilës në Pejë, nga hyrja deri te qoshet më intime.',
      category: ProjectCategory.GARDENS,
      duration: '2:14',
      thumb: img('videos/peja-villa-tour/thumbnail'),
      video: vid('videos/peja-villa-tour/tour'),
    },
    {
      id: 'seed-video-vlora-pool-tour',
      titleEn: 'Video Tour: The Infinity Pool in Vlora',
      titleDe: 'Video-Tour: Der Infinity-Pool in Vlora',
      titleSq: 'Tur Video: Pishina Infinity në Vlorë',
      descriptionEn: 'Discover the infinity pool in Vlora and its view toward the sea.',
      descriptionDe: 'Entdecken Sie den Infinity-Pool in Vlora und seinen Blick zum Meer.',
      descriptionSq: 'Zbuloni pishinën infinity në Vlorë dhe pamjen e saj drejt detit.',
      category: ProjectCategory.POOLS,
      duration: '1:48',
      thumb: img('videos/vlora-pool-tour/thumbnail'),
      video: vid('videos/vlora-pool-tour/tour'),
    },
    {
      id: 'seed-video-pogradec-terrace-tour',
      titleEn: 'Video Tour: The Lakeview Terrace',
      titleDe: 'Video-Tour: Die Seeblick-Terrasse',
      titleSq: 'Tur Video: Terasa me Pamje Liqeni',
      descriptionEn: 'The lakeview terrace in Pogradec, filmed in the early evening hours.',
      descriptionDe: 'Die Seeblick-Terrasse in Pogradec, gefilmt in den frühen Abendstunden.',
      descriptionSq: 'Terasa me pamje liqeni në Pogradec, e filmuar në orët e para të mbrëmjes.',
      category: ProjectCategory.TERRACES,
      duration: '1:56',
      thumb: img('videos/pogradec-terrace-tour/thumbnail'),
      video: vid('videos/pogradec-terrace-tour/tour'),
    },
    {
      id: 'seed-video-fier-paving-tour',
      titleEn: 'Video Tour: Natural Stone Paving in Fier',
      titleDe: 'Video-Tour: Natursteinpflaster in Fier',
      titleSq: 'Tur Video: Shtrimi me Gur Natyral në Fier',
      descriptionEn: 'A close-up video tour of the natural stone paving work completed in Fier.',
      descriptionDe: 'Eine Nahaufnahme-Videotour der Natursteinpflasterarbeiten in Fier.',
      descriptionSq: 'Një tur video nga afër i punimeve të shtrimit me gur natyral në Fier.',
      category: ProjectCategory.PAVING,
      duration: '1:32',
      thumb: img('videos/fier-paving-tour/thumbnail'),
      video: vid('videos/fier-paving-tour/tour'),
    },
  ]

  for (let i = 0; i < videos.length; i += 1) {
    const item = videos[i]!
    const data = {
      titleEn: item.titleEn,
      titleDe: item.titleDe,
      titleSq: item.titleSq,
      descriptionEn: item.descriptionEn,
      descriptionDe: item.descriptionDe,
      descriptionSq: item.descriptionSq,
      category: item.category,
      duration: item.duration,
      thumbnail: item.thumb.url,
      thumbnailPublicId: item.thumb.publicId,
      videoUrl: item.video.url,
      videoPublicId: item.video.publicId,
      order: i,
      isPublished: true,
    }
    await prisma.video.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data },
    })
  }
  console.log(`  ✓ ${videos.length} videos seeded`)
}

async function seedTestimonials() {
  const testimonials = [
    {
      id: 'seed-testimonial-elira-hoxha',
      clientName: 'Elira Hoxha',
      location: 'Peja',
      projectType: 'Private garden',
      textEn: "AV1-Company turned our garden into a space we couldn't have imagined ourselves. Every detail was considered with extreme care.",
      textDe: 'AV1-Company hat unseren Garten in einen Raum verwandelt, den wir uns selbst nicht hätten vorstellen können. Jedes Detail wurde mit größter Sorgfalt bedacht.',
      textSq: "AV1-Company e ktheu kopshtin tonë në një hapësirë që s'do ta kishim imagjinuar dot vetë. Çdo detaj ishte menduar me kujdes ekstrem.",
      rating: 5,
      date: 'May 2024',
    },
    {
      id: 'seed-testimonial-andi-krasniqi',
      clientName: 'Andi Krasniqi',
      location: 'Durrës',
      projectType: 'Modern yard',
      textEn: 'Exceptional professionalism from start to finish. Our yard is now where the family gathers every evening.',
      textDe: 'Außergewöhnliche Professionalität von Anfang bis Ende. Unser Hof ist jetzt der Ort, an dem sich die Familie jeden Abend versammelt.',
      textSq: 'Profesionalizëm i jashtëzakonshëm nga fillimi deri në fund. Oborri ynë tani është vendi ku familja mblidhet çdo mbrëmje.',
      rating: 5,
      date: 'February 2024',
    },
    {
      id: 'seed-testimonial-megi-shehu',
      clientName: 'Megi Shehu',
      location: 'Vlora',
      projectType: 'Pool',
      textEn: 'The pool they designed exceeded every expectation. The quality of the work and attention to detail were impressive.',
      textDe: 'Der Pool, den sie entworfen haben, übertraf jede Erwartung. Die Qualität der Arbeit und die Liebe zum Detail waren beeindruckend.',
      textSq: 'Pishina që projektuan tejkaloi çdo pritshmëri. Cilësia e punimeve dhe vëmendja ndaj detajeve ishin impresionuese.',
      rating: 5,
      date: 'July 2023',
    },
    {
      id: 'seed-testimonial-bledar-rama',
      clientName: 'Bledar Rama',
      location: 'Peja',
      projectType: 'Business space',
      textEn: "Our business's outdoor space now makes exactly the first impression we wanted for every client who visits.",
      textDe: 'Der Außenbereich unseres Unternehmens hinterlässt jetzt genau den ersten Eindruck, den wir uns für jeden Kunden gewünscht haben.',
      textSq: 'Ambienti i jashtëm i biznesit tonë tani lë përshtypjen e parë që donim te çdo klient që na viziton.',
      rating: 4,
      date: 'September 2023',
    },
    {
      id: 'seed-testimonial-sara-lika',
      clientName: 'Sara Lika',
      location: 'Saranda',
      projectType: 'Private garden',
      textEn: "From the first sketch to the final result, the AV1 team showed a level of expertise and care that's rarely found.",
      textDe: 'Von der ersten Skizze bis zum Endergebnis zeigte das AV1-Team ein Maß an Expertise und Sorgfalt, das man selten findet.',
      textSq: 'Nga skica e parë deri te rezultati final, ekipi i AV1 tregoi një nivel ekspertize dhe kujdesi që rrallë gjendet.',
      rating: 5,
      date: 'June 2024',
    },
  ]

  for (let i = 0; i < testimonials.length; i += 1) {
    const item = testimonials[i]!
    const data = {
      clientName: item.clientName,
      location: item.location,
      projectType: item.projectType,
      textEn: item.textEn,
      textDe: item.textDe,
      textSq: item.textSq,
      rating: item.rating,
      date: item.date,
      order: i,
      isPublished: true,
    }
    await prisma.testimonial.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data },
    })
  }
  console.log(`  ✓ ${testimonials.length} testimonials seeded`)
}

async function seedFaqs() {
  const faqs = [
    {
      id: 'seed-faq-landscaping-duration',
      questionEn: 'How long does landscaping take?',
      questionDe: 'Wie lange dauert eine Landschaftsgestaltung?',
      questionSq: 'Sa kohë zgjat një projekt peizazhi?',
      answerEn:
        "Most residential projects take between 2 and 6 weeks, depending on the size and complexity of the design. During your free consultation, we'll give you a detailed timeline specific to your project.",
      answerDe:
        'Die meisten Wohnprojekte dauern zwischen 2 und 6 Wochen, abhängig von Größe und Komplexität des Designs. Bei Ihrer kostenlosen Beratung erhalten Sie einen detaillierten Zeitplan für Ihr Projekt.',
      answerSq:
        "Shumica e projekteve rezidenciale zgjasin nga 2 deri në 6 javë, në varësi të madhësisë dhe kompleksitetit të dizajnit. Gjatë konsultës falas, do t'ju japim një kalendar të detajuar specifik për projektin tuaj.",
    },
    {
      id: 'seed-faq-free-estimates',
      questionEn: 'Do you provide free estimates?',
      questionDe: 'Bieten Sie kostenlose Kostenvoranschläge an?',
      questionSq: 'A ofroni vlerësim falas?',
      answerEn:
        "Yes. Every project starts with a free, no-obligation site visit and quote. We'll walk your space with you and outline the scope and cost before any work begins.",
      answerDe:
        'Ja. Jedes Projekt beginnt mit einem kostenlosen, unverbindlichen Vor-Ort-Termin und Angebot. Wir begehen den Raum gemeinsam mit Ihnen und legen Umfang und Kosten fest, bevor die Arbeiten beginnen.',
      answerSq:
        'Po. Çdo projekt fillon me një vizitë dhe ofertë falas, pa asnjë detyrim. Do të shohim hapësirën tuaj së bashku dhe do të përcaktojmë shtrirjen dhe koston përpara se të fillojë çdo punë.',
    },
    {
      id: 'seed-faq-service-areas',
      questionEn: 'Which areas do you serve?',
      questionDe: 'In welchen Gebieten sind Sie tätig?',
      questionSq: 'Cilat zona shërbeni?',
      answerEn:
        "We work throughout Kosovo, with completed projects in Peja, Durrës, Vlora, Saranda, Pogradec, Fier and Korça. Get in touch and we'll confirm availability in your area.",
      answerDe:
        'Wir arbeiten in ganz Kosovo, mit abgeschlossenen Projekten in Peja, Durrës, Vlora, Saranda, Pogradec, Fier und Korça. Kontaktieren Sie uns, und wir bestätigen die Verfügbarkeit in Ihrer Region.',
      answerSq:
        'Punojmë në të gjithë Kosovën, me projekte të realizuara në Pejë, Durrës, Vlorë, Sarandë, Pogradec, Fier dhe Korçë. Na kontaktoni dhe do të konfirmojmë disponueshmërinë në zonën tuaj.',
    },
    {
      id: 'seed-faq-choose-materials',
      questionEn: 'Can I choose my own materials?',
      questionDe: 'Kann ich meine eigenen Materialien wählen?',
      questionSq: 'A mund të zgjedh vetë materialet?',
      answerEn:
        "Absolutely. We'll guide you through our curated selection of premium stone, timber and planting options, but the final choice is always yours.",
      answerDe:
        'Selbstverständlich. Wir beraten Sie gerne bei unserer kuratierten Auswahl an hochwertigem Stein, Holz und Bepflanzung — die endgültige Entscheidung liegt aber immer bei Ihnen.',
      answerSq:
        "Sigurisht. Do t'ju udhëheqim përmes seleksionit tonë të kuruar të gurit, drurit dhe bimëve premium, por vendimi final është gjithmonë juaji.",
    },
    {
      id: 'seed-faq-warranty',
      questionEn: 'How long is the warranty?',
      questionDe: 'Wie lange gilt die Garantie?',
      questionSq: 'Sa kohë zgjat garancia?',
      answerEn: 'All hardscaping work is covered by a 2-year workmanship warranty, and planting is guaranteed for the first growing season.',
      answerDe:
        'Alle Pflasterarbeiten sind durch eine 2-jährige Gewährleistung auf die Ausführung abgedeckt, und Bepflanzungen sind für die erste Vegetationsperiode garantiert.',
      answerSq:
        'Të gjitha punimet e shtrimit mbulohen nga një garanci 2-vjeçare për punën e kryer, ndërsa mbjelljet garantohen për sezonin e parë të rritjes.',
    },
    {
      id: 'seed-faq-maintenance',
      questionEn: 'Do you maintain completed gardens?',
      questionDe: 'Pflegen Sie fertiggestellte Gärten auch weiterhin?',
      questionSq: 'A i mirëmbani kopshtet e përfunduara?',
      answerEn:
        'Yes, we offer ongoing maintenance packages to keep your garden looking its best year-round, from seasonal pruning to irrigation checks.',
      answerDe:
        'Ja, wir bieten laufende Pflegepakete an, damit Ihr Garten das ganze Jahr über bestens aussieht — von saisonalem Rückschnitt bis zur Kontrolle der Bewässerung.',
      answerSq:
        'Po, ofrojmë paketa mirëmbajtjeje të vazhdueshme për ta mbajtur kopshtin tuaj në gjendjen më të mirë gjatë gjithë vitit, nga krasitja sezonale deri te kontrolli i ujitjes.',
    },
  ]

  for (let i = 0; i < faqs.length; i += 1) {
    const item = faqs[i]!
    const data = {
      questionEn: item.questionEn,
      questionDe: item.questionDe,
      questionSq: item.questionSq,
      answerEn: item.answerEn,
      answerDe: item.answerDe,
      answerSq: item.answerSq,
      order: i,
      isPublished: true,
    }
    await prisma.faq.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data },
    })
  }
  console.log(`  ✓ ${faqs.length} FAQs seeded`)
}

async function seedServices() {
  const services = [
    {
      id: 'seed-service-garden-design',
      titleEn: 'Garden Design & Construction',
      titleDe: 'Gartendesign & -bau',
      titleSq: 'Dizajn dhe Ndërtim Kopshtesh',
      descriptionEn: 'We create unique gardens tailored to the character of every property, from initial concept to final execution.',
      descriptionDe: 'Wir gestalten einzigartige Gärten, abgestimmt auf den Charakter jeder Immobilie — vom ersten Konzept bis zur finalen Umsetzung.',
      descriptionSq: 'Krijojmë kopshte unike, të përshtatura me karakterin e çdo prone, nga koncepti fillestar deri te ekzekutimi final.',
      icon: 'garden-design',
    },
    {
      id: 'seed-service-hardscaping',
      titleEn: 'Hardscaping & Outdoor Paving',
      titleDe: 'Pflasterung & Außenanlagen',
      titleSq: 'Shtrime dhe Punime të Jashtme',
      descriptionEn: 'Quality paving with natural stone and premium materials for pathways, courtyards and functional spaces.',
      descriptionDe: 'Hochwertige Pflasterarbeiten mit Naturstein und Premium-Materialien für Wege, Höfe und funktionale Bereiche.',
      descriptionSq: 'Shtrime cilësore me gurë natyralë dhe materiale premium për shtigje, oborre dhe hapësira funksionale.',
      icon: 'hardscaping',
    },
    {
      id: 'seed-service-pools',
      titleEn: 'Pools & Relaxation Areas',
      titleDe: 'Pools & Erholungsbereiche',
      titleSq: 'Pishina dhe Ambiente Relaksi',
      descriptionEn: 'We design and build pools and relaxation zones that combine comfort with elegance.',
      descriptionDe: 'Wir gestalten und bauen Pools und Erholungszonen, die Komfort mit Eleganz verbinden.',
      descriptionSq: 'Dizajnojmë dhe ndërtojmë pishina dhe zona relaksi që kombinojnë komoditetin me elegancën.',
      icon: 'pools',
    },
    {
      id: 'seed-service-terraces',
      titleEn: 'Terraces & Outdoor Structures',
      titleDe: 'Terrassen & Outdoor-Strukturen',
      titleSq: 'Terraca dhe Struktura Outdoor',
      descriptionEn: 'Timber and metal structures, pergolas and terraces that extend your living space outdoors.',
      descriptionDe: 'Holz- und Metallkonstruktionen, Pergolen und Terrassen, die Ihren Wohnraum nach draußen erweitern.',
      descriptionSq: 'Struktura druri dhe metalike, pergola dhe terraca që zgjerojnë hapësirën e jetesës jashtë shtëpisë.',
      icon: 'terraces',
    },
    {
      id: 'seed-service-maintenance',
      titleEn: 'Greenery Maintenance',
      titleDe: 'Grünflächenpflege',
      titleSq: 'Mirëmbajtje e Gjelbërimit',
      descriptionEn: 'Regular maintenance services to preserve the beauty and health of your green spaces.',
      descriptionDe: 'Regelmäßige Pflegeleistungen, um die Schönheit und Gesundheit Ihrer Grünflächen zu erhalten.',
      descriptionSq: 'Shërbime të rregullta mirëmbajtjeje për të ruajtur bukurinë dhe shëndetin e hapësirave tuaja të gjelbra.',
      icon: 'maintenance',
    },
  ]

  for (let i = 0; i < services.length; i += 1) {
    const item = services[i]!
    const data = {
      titleEn: item.titleEn,
      titleDe: item.titleDe,
      titleSq: item.titleSq,
      descriptionEn: item.descriptionEn,
      descriptionDe: item.descriptionDe,
      descriptionSq: item.descriptionSq,
      icon: item.icon,
      order: i,
      isPublished: true,
    }
    await prisma.service.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data },
    })
  }
  console.log(`  ✓ ${services.length} services seeded`)
}

async function main() {
  console.log('🌱 Seeding database...')

  await seedAdmin()
  await seedEditor()
  await seedSettings()
  await seedProjects()
  await seedGalleryImages()
  await seedBeforeAfterProjects()
  await seedVideos()
  await seedTestimonials()
  await seedFaqs()
  await seedServices()

  console.log('✅ Seed complete')
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
