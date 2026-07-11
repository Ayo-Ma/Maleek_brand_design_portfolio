import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project / Case Study',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Controls sort order everywhere the project appears (lowest first).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'visibleOnWork',
      title: 'Show as a full project on Work / Home',
      type: 'boolean',
      description:
        'On: appears as a full case-study tile on Home and Work, with its own hero. Off: appears only as a "Coming Soon" placeholder on Work, but is still reachable via the Next Case Study link and has its own case-study page.',
      initialValue: false,
    }),
    defineField({name: 'industry', title: 'Industry', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'year', title: 'Year', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'scope', title: 'Scope', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'tagline', title: 'Tagline', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'accent',
      title: 'Accent color (hex)',
      type: 'string',
      description: 'e.g. #1D4ED8',
      validation: (Rule) => Rule.required().regex(/^#[0-9A-Fa-f]{6}$/, {name: 'hex color'}),
    }),
    defineField({
      name: 'palette',
      title: 'Palette (identity swatches)',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Hex codes shown as swatches under Identity, e.g. #1D4ED8',
    }),

    defineField({name: 'background', title: 'Background', type: 'text', rows: 4}),
    defineField({name: 'challenge', title: 'Challenge', type: 'text', rows: 4}),
    defineField({name: 'research', title: 'Research', type: 'text', rows: 4}),
    defineField({name: 'strategy', title: 'Strategy', type: 'text', rows: 4}),
    defineField({name: 'identityDesc', title: 'Identity description', type: 'text', rows: 3}),

    defineField({name: 'logo', title: 'Logo (wordmark)', type: 'image', options: {hotspot: true}}),
    defineField({name: 'logomark', title: 'Logomark (icon-only mark)', type: 'image', options: {hotspot: true}}),

    defineField({
      name: 'tileBackground',
      title: 'Work-grid tile background photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'caseHeroBackground',
      title: 'Case study hero background photo',
      type: 'image',
      options: {hotspot: true},
    }),

    defineField({
      name: 'extendedIdentity',
      title: 'Extended identity system',
      type: 'object',
      description: 'Optional. When filled in, the case study shows the full identity system section (logo lockups, extended palette, typography, graphic system, photography, tone of voice).',
      fields: [
        {name: 'logoDesc', title: 'Logo description', type: 'text', rows: 3},
        {
          name: 'palette',
          title: 'Extended palette',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'name', title: 'Name', type: 'string'},
                {name: 'hex', title: 'Hex', type: 'string'},
                {name: 'meaning', title: 'Meaning', type: 'string'},
              ],
            },
          ],
        },
        {name: 'typography', title: 'Typography', type: 'text', rows: 3},
        {name: 'graphicSystem', title: 'Graphic system', type: 'text', rows: 3},
        {name: 'photography', title: 'Photography direction', type: 'text', rows: 3},
        {
          name: 'photos',
          title: 'Photography grid images',
          type: 'array',
          of: [{type: 'image', options: {hotspot: true}}],
        },
        {name: 'toneOfVoice', title: 'Tone of voice', type: 'text', rows: 3},
      ],
    }),

    defineField({
      name: 'semanticColors',
      title: 'Semantic colors',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'name', title: 'Name', type: 'string'},
            {name: 'hex', title: 'Hex', type: 'string'},
            {name: 'meaning', title: 'Meaning', type: 'string'},
          ],
        },
      ],
    }),

    defineField({
      name: 'applications',
      title: 'Applications',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', title: 'Label', type: 'string'},
            {name: 'image', title: 'Image', type: 'image', options: {hotspot: true}},
          ],
        },
      ],
    }),

    defineField({
      name: 'fieloApps',
      title: 'Featured application cards (special 4-up grid)',
      description: 'Optional. Only used for the flagship project’s highlighted application spread (business card / livery / dashboard / pitch deck style layout).',
      type: 'object',
      fields: [
        {name: 'businessCardImage', title: 'Business card background', type: 'image', options: {hotspot: true}},
        {name: 'liveryImage', title: 'Vehicle livery background', type: 'image', options: {hotspot: true}},
        {name: 'dashboardImage', title: 'Dashboard background', type: 'image', options: {hotspot: true}},
        {name: 'pitchDeckImage', title: 'Pitch deck background', type: 'image', options: {hotspot: true}},
        {name: 'contactName', title: 'Business card name', type: 'string'},
        {name: 'contactRole', title: 'Business card role / site', type: 'string'},
        {name: 'pitchCopy', title: 'Pitch deck headline', type: 'string'},
      ],
    }),

    defineField({name: 'outcome', title: 'Outcome', type: 'text', rows: 4}),
    defineField({
      name: 'impact',
      title: 'Impact points',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({name: 'lessons', title: 'Lessons', type: 'text', rows: 4}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'industry', media: 'logo'},
  },
})
