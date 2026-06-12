import { defineField, defineType } from "sanity";

export const imperialLensSpecificationType = defineType({
  name: "imperialLensSpecification",
  title: "Imperial Lens Specification",
  type: "object",
  fields: [
    defineField({
      name: "brennweite",
      title: "Brennweite",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "blende",
      title: "Blende",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "irisdrehung",
      title: "Irisdrehung",
      type: "string",
    }),
    defineField({
      name: "naheinstellgrenze",
      title: "Naheinstellgrenze1",
      type: "string",
    }),
    defineField({
      name: "fokussdrehung",
      title: "Fokussdrehung",
      type: "string",
    }),
    defineField({
      name: "lange",
      title: "Lange2",
      type: "string",
    }),
    defineField({
      name: "frontdurchmesser",
      title: "Frontdurchmesser",
      type: "string",
    }),
    defineField({
      name: "bildwinkelFf",
      title: "Bildwinkel (FF)3",
      type: "string",
    }),
    defineField({
      name: "gewicht",
      title: "Gewicht4",
      type: "string",
    }),
    defineField({
      name: "filtergewinde",
      title: "Filtergewinde",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "brennweite",
      subtitle: "blende",
      media: "frontdurchmesser",
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: selection.subtitle,
      };
    },
  },
});
