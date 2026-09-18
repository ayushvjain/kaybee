import { config, collection, singleton, fields } from '@keystatic/core';

/**
 * Keystatic content model for the Kaybee International site.
 *
 * Storage is `local` in development (edits write straight to disk) and `github`
 * in production (edits become commits on ayushvjain/kaybee, which triggers a
 * Cloudflare rebuild). The site build always reads local files either way.
 */

const image = (directory: string, publicPath: string) =>
  fields.object({
    file: fields.image({
      label: 'Image file',
      directory,
      publicPath,
      validation: { isRequired: true },
    }),
    alt: fields.text({
      label: 'Alt text',
      description:
        'Describe the image for screen readers and search engines, e.g. "SN 515 plummer block, cast iron housing".',
      validation: { isRequired: true, length: { min: 4 } },
    }),
  });

export default config({
  storage: import.meta.env.DEV
    ? { kind: 'local' }
    : { kind: 'github', repo: 'ayushvjain/kaybee' },

  ui: {
    brand: { name: 'Kaybee International' },
    navigation: {
      Catalogue: ['products', 'brands'],
      Pages: ['homepage', 'about', 'sizeReference'],
      Files: ['downloads'],
      Settings: ['company'],
    },
  },

  collections: {
    products: collection({
      label: 'Products',
      slugField: 'name',
      path: 'content/products/*',
      format: { contentField: 'description' },
      columns: ['name', 'order'],
      entryLayout: 'content',
      schema: {
        name: fields.slug({
          name: { label: 'Product name', validation: { isRequired: true } },
          slug: {
            label: 'URL slug',
            description: 'Appears in the web address. Avoid changing it once the page is live.',
          },
        }),
        order: fields.integer({
          label: 'Display order',
          description: 'Lower numbers appear first.',
          defaultValue: 0,
        }),
        summary: fields.text({
          label: 'Short summary',
          description: 'One or two lines. Used on product cards and in search results.',
          multiline: true,
          validation: { isRequired: true, length: { max: 220 } },
        }),
        description: fields.markdoc({
          label: 'Full description',
          options: {
            image: {
              directory: 'public/images/products',
              publicPath: '/images/products/',
            },
          },
        }),
        features: fields.array(fields.text({ label: 'Feature' }), {
          label: 'Key features',
          description: 'Short bullet points shown beside the description.',
          itemLabel: (props) => props.value || 'Feature',
        }),
        brands: fields.multiRelationship({
          label: 'Available brands',
          description: 'Which brands Kaybee supplies this product in.',
          collection: 'brands',
        }),
        series: fields.array(fields.text({ label: 'Series' }), {
          label: 'Series',
          description: 'e.g. S, SN, SNA, SNH, MNL. Leave empty if not applicable.',
          itemLabel: (props) => props.value || 'Series',
        }),
        shaftSizeRange: fields.text({
          label: 'Shaft size range',
          description: 'e.g. 1" – 7". Leave empty if not applicable.',
        }),
        images: fields.array(image('public/images/products', '/images/products/'), {
          label: 'Photographs',
          description:
            'Leave empty to show a branded placeholder until real photographs are available.',
          itemLabel: (props) => props.fields.alt.value || 'Photograph',
        }),
        seoTitle: fields.text({
          label: 'SEO title override',
          description: 'Optional. Leave empty to generate automatically.',
        }),
        seoDescription: fields.text({
          label: 'SEO description override',
          description: 'Optional. Leave empty to use the short summary.',
          multiline: true,
        }),
      },
    }),

    brands: collection({
      label: 'Brands',
      slugField: 'name',
      path: 'content/brands/*',
      format: { data: 'yaml' },
      columns: ['name', 'relationship', 'order'],
      schema: {
        name: fields.slug({
          name: { label: 'Brand name', validation: { isRequired: true } },
        }),
        order: fields.integer({ label: 'Display order', defaultValue: 0 }),
        relationship: fields.select({
          label: 'Relationship',
          description: 'How Kaybee relates to this brand. Shown as a label on the brand card.',
          options: [
            { label: 'Our own brand', value: 'own' },
            { label: 'Authorised distributor', value: 'authorised-distributor' },
            { label: 'Sourcing partner', value: 'partner' },
            { label: 'Stocked brand', value: 'stocked' },
          ],
          defaultValue: 'stocked',
        }),
        ranges: fields.array(fields.text({ label: 'Product range' }), {
          label: 'Ranges supplied',
          itemLabel: (props) => props.value || 'Range',
        }),
        blurb: fields.text({
          label: 'Description',
          multiline: true,
        }),
        logo: fields.image({
          label: 'Logo',
          description:
            'Optional. Without a logo the brand shows as a typographic card, which is the current default.',
          directory: 'public/images/brands',
          publicPath: '/images/brands/',
        }),
      },
    }),

    downloads: collection({
      label: 'Downloads',
      slugField: 'title',
      path: 'content/downloads/*',
      format: { data: 'yaml' },
      columns: ['title', 'order'],
      schema: {
        title: fields.slug({
          name: { label: 'Title', validation: { isRequired: true } },
        }),
        order: fields.integer({ label: 'Display order', defaultValue: 0 }),
        description: fields.text({ label: 'Description', multiline: true }),
        file: fields.file({
          label: 'File',
          description: 'PDF brochure, catalogue or specification sheet.',
          directory: 'public/downloads',
          publicPath: '/downloads/',
          validation: { isRequired: true },
        }),
      },
    }),
  },

  singletons: {
    company: singleton({
      label: 'Contact details',
      path: 'content/company',
      format: { data: 'yaml' },
      schema: {
        legalName: fields.text({ label: 'Company name', defaultValue: 'Kaybee International' }),
        tagline: fields.text({ label: 'Tagline', multiline: true }),
        landlines: fields.array(fields.text({ label: 'Landline' }), {
          label: 'Landline numbers',
          itemLabel: (props) => props.value || 'Number',
        }),
        mobile: fields.text({ label: 'Mobile / WhatsApp' }),
        email: fields.text({ label: 'Email' }),
        addressLines: fields.array(fields.text({ label: 'Line' }), {
          label: 'Address lines',
          itemLabel: (props) => props.value || 'Line',
        }),
        city: fields.text({ label: 'City' }),
        pincode: fields.text({ label: 'PIN code' }),
        state: fields.text({ label: 'State' }),
        hours: fields.text({ label: 'Business hours' }),
        mapEmbedUrl: fields.url({
          label: 'Google Maps embed URL',
          description: 'Optional. The src value from a Google Maps "Embed a map" iframe.',
        }),
        gstin: fields.text({ label: 'GSTIN', description: 'Optional.' }),
      },
    }),

    homepage: singleton({
      label: 'Homepage',
      path: 'content/homepage',
      format: { data: 'yaml' },
      schema: {
        heroEyebrow: fields.text({ label: 'Hero eyebrow' }),
        heroHeadline: fields.text({ label: 'Hero headline', multiline: true }),
        heroSubhead: fields.text({ label: 'Hero subheading', multiline: true }),
        heroImage: fields.object(
          {
            file: fields.image({
              label: 'Hero image',
              directory: 'public/images/homepage',
              publicPath: '/images/homepage/',
            }),
            alt: fields.text({ label: 'Alt text' }),
          },
          { label: 'Hero image' }
        ),
        stats: fields.array(
          fields.object({
            value: fields.text({ label: 'Figure', validation: { isRequired: true } }),
            label: fields.text({ label: 'Label', validation: { isRequired: true } }),
          }),
          {
            label: 'Statistics strip',
            itemLabel: (props) => `${props.fields.value.value} — ${props.fields.label.value}`,
          }
        ),
        whyUs: fields.array(
          fields.object({
            heading: fields.text({ label: 'Heading', validation: { isRequired: true } }),
            body: fields.text({ label: 'Body', multiline: true }),
          }),
          {
            label: 'Why Kaybee points',
            itemLabel: (props) => props.fields.heading.value || 'Point',
          }
        ),
        customWorkTitle: fields.text({ label: 'Custom work — title' }),
        customWorkBody: fields.text({ label: 'Custom work — body', multiline: true }),
      },
    }),

    about: singleton({
      label: 'About page',
      path: 'content/about',
      format: { contentField: 'intro' },
      schema: {
        heading: fields.text({ label: 'Page heading' }),
        intro: fields.markdoc({ label: 'Introduction' }),
        historyHeading: fields.text({ label: 'History — heading' }),
        history: fields.text({ label: 'History — body', multiline: true }),
        customHeading: fields.text({ label: 'Custom capability — heading' }),
        custom: fields.text({ label: 'Custom capability — body', multiline: true }),
      },
    }),

    sizeReference: singleton({
      label: 'Size reference',
      path: 'content/size-reference',
      format: { data: 'yaml' },
      schema: {
        heading: fields.text({ label: 'Page heading' }),
        intro: fields.text({ label: 'Introduction', multiline: true }),
        shaftSizes: fields.array(fields.text({ label: 'Shaft size' }), {
          label: 'Shaft sizes (table columns)',
          description: 'e.g. 1", 1.1/2", 2". Order here is the column order.',
          itemLabel: (props) => props.value || 'Size',
        }),
        rows: fields.array(
          fields.object({
            series: fields.text({ label: 'Series', validation: { isRequired: true } }),
            note: fields.text({ label: 'Note', description: 'Optional, e.g. housing type.' }),
            available: fields.array(fields.text({ label: 'Shaft size' }), {
              label: 'Available in these shaft sizes',
              description: 'Must match the shaft size labels above exactly.',
              itemLabel: (props) => props.value || 'Size',
            }),
          }),
          {
            label: 'Series rows',
            itemLabel: (props) => props.fields.series.value || 'Series',
          }
        ),
        footnote: fields.text({ label: 'Footnote', multiline: true }),
      },
    }),
  },
});
