import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      initialValue: 'Site Settings',
      readOnly: true,
    }),

    // ---- Home: hero ----
    defineField({name: 'heroEyebrow', title: 'Home / Hero eyebrow', type: 'string'}),
    defineField({name: 'heroTitle', title: 'Home / Hero title (plain part)', type: 'string'}),
    defineField({name: 'heroTitleAccent', title: 'Home / Hero title (accent-colored part)', type: 'string'}),
    defineField({name: 'heroSubtitle', title: 'Home / Hero subtitle', type: 'text', rows: 3}),
    defineField({name: 'homePortrait', title: 'Home / Hero portrait image', type: 'image', options: {hotspot: true}}),

    // ---- Home: about teaser ----
    defineField({name: 'aboutTeaserKicker', title: 'About teaser / Kicker', type: 'string'}),
    defineField({name: 'aboutTeaserTitle', title: 'About teaser / Title line 1', type: 'string'}),
    defineField({name: 'aboutTeaserTitleDim', title: 'About teaser / Title line 2 (dimmed)', type: 'string'}),
    defineField({name: 'aboutTeaserBody', title: 'About teaser / Body', type: 'text', rows: 3}),
    defineField({name: 'aboutTeaserNote', title: 'About teaser / Note under portrait', type: 'string'}),

    // ---- Home: philosophy ----
    defineField({name: 'philosophyKicker', title: 'Philosophy / Kicker', type: 'string'}),
    defineField({name: 'philosophyTitle', title: 'Philosophy / Title line 1', type: 'string'}),
    defineField({name: 'philosophyTitleDim', title: 'Philosophy / Title line 2 (dimmed)', type: 'string'}),
    defineField({name: 'philosophyIntro', title: 'Philosophy / Intro paragraph', type: 'text', rows: 2}),
    defineField({
      name: 'philosophyItems',
      title: 'Philosophy / Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'title', title: 'Title', type: 'string'},
            {name: 'desc', title: 'Description', type: 'text', rows: 2},
          ],
        },
      ],
    }),

    // ---- Home: industries ----
    defineField({
      name: 'industries',
      title: 'Industries explored',
      type: 'array',
      of: [{type: 'string'}],
    }),

    // ---- Home: feed ----
    defineField({
      name: 'feedImages',
      title: 'Feed / Social & flyer images',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
    }),

    // ---- About page ----
    defineField({name: 'aboutLead', title: 'About / Lead paragraph', type: 'text', rows: 3}),
    defineField({name: 'aboutBody', title: 'About / Body paragraph', type: 'text', rows: 3}),
    defineField({name: 'aboutTraits', title: 'About / Traits line', type: 'string'}),
    defineField({name: 'aboutQuoteText', title: 'About / Pull quote', type: 'string'}),
    defineField({name: 'aboutQuoteCite', title: 'About / Pull quote citation', type: 'string'}),
    defineField({name: 'aboutLocation', title: 'About / Location line', type: 'string'}),
    defineField({name: 'aboutPortrait', title: 'About / Portrait image', type: 'image', options: {hotspot: true}}),

    // ---- Services page ----
    defineField({name: 'servicesLead', title: 'Services / Lead paragraph', type: 'text', rows: 2}),
    defineField({
      name: 'servicesList',
      title: 'Services / List',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'title', title: 'Title', type: 'string'},
            {name: 'tags', title: 'Tags', type: 'array', of: [{type: 'string'}], description: '2-3 short labels shown next to the title, e.g. "Positioning", "Messaging"'},
            {name: 'desc', title: 'Description', type: 'text', rows: 2},
            {name: 'image', title: 'Image', type: 'image', options: {hotspot: true}},
          ],
        },
      ],
    }),

    // ---- Contact page ----
    defineField({name: 'contactLead', title: 'Contact / Lead paragraph', type: 'text', rows: 2}),
    defineField({name: 'contactEmail', title: 'Contact / Email', type: 'string'}),
    defineField({
      name: 'contactSocials',
      title: 'Contact / Social links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', title: 'Label', type: 'string'},
            {name: 'url', title: 'URL', type: 'url'},
          ],
        },
      ],
    }),
    defineField({name: 'contactStatus', title: 'Contact / Availability status line', type: 'string'}),

    // ---- Footer ----
    defineField({name: 'footerRole', title: 'Footer / Role line', type: 'string'}),
    defineField({name: 'footerCopyright', title: 'Footer / Copyright line', type: 'string'}),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
