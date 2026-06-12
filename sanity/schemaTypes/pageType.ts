import { defineArrayMember, defineField, defineType } from "sanity";
import { ImperialLensSpecificationsInput } from "../components/ImperialLensSpecificationsInput";

export const pageType = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "defaultHeading",
      title: "Default heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "defaultDescription",
      title: "Default description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "countryContent",
      title: "Country content",
      type: "array",
      of: [
        defineArrayMember({
          name: "countryContentItem",
          title: "Country content item",
          type: "object",
          fields: [
            defineField({
              name: "countryCode",
              title: "Country code",
              type: "string",
              options: {
                list: [
                  { title: "India", value: "IN" },
                  { title: "United States", value: "US" },
                  { title: "Great Britain", value: "GB" },
                  { title: "Australia", value: "AU" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "heading",
              title: "Heading",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "countryCode",
              subtitle: "heading",
            },
            prepare(selection) {
              return {
                title: selection.title,
                subtitle: selection.subtitle,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "specifications",
      title: "Specifications",
      type: "array",
      of: [{ type: "specification" }],
      description: "Example import target used by the CSV Importer tool.",
    }),
    defineField({
      name: "imperialLensSpecificationsDe",
      title: "Imperial Lens Specifications DE",
      type: "array",
      of: [{ type: "imperialLensSpecification" }],
      description: "Imported from the AP3 imperial German specification CSV.",
      components: {
        input: ImperialLensSpecificationsInput as never,
      },
    }),
  ],
});
