import { describe, expect, it } from 'vitest';
import { imageFor, imageSlug } from './imageAssets';
import { DOMAIN_IMAGE_BRIEFS, briefFor } from './imageBriefs';
import { STAGE_ORDER } from '../domain/stages';
import { DOMAINS } from '../domain/taxonomies';
import type { Domain } from '../domain/types';

const DOMAIN_IDS = Object.keys(DOMAINS) as Domain[];

describe('image assets', () => {
  it('has an image for every stage-level door', () => {
    for (const stage of STAGE_ORDER) {
      for (const door of ['why', 'forward'] as const) {
        expect(imageFor(stage, door, null), `${stage}/${door}`).toBeTruthy();
      }
    }
  });

  it('has an image for every domain brief', () => {
    for (const stage of STAGE_ORDER) {
      for (const domain of DOMAIN_IDS) {
        if (!DOMAIN_IMAGE_BRIEFS[stage]?.[domain]) continue;
        expect(imageFor(stage, 'why', domain), `${stage}/${domain}`).toBeTruthy();
      }
    }
  });

  it('resolves the image the same way briefFor resolves the brief', () => {
    for (const stage of STAGE_ORDER) {
      for (const domain of DOMAIN_IDS) {
        const specific = DOMAIN_IMAGE_BRIEFS[stage]?.[domain];
        const slug = imageSlug(stage, 'why', domain);
        // Domain-specific on the "why" door where one exists, stage-level otherwise.
        expect(slug).toBe(specific ? `${stage}_${domain}` : `${stage}_why`);
        // And the brief picked for that door agrees.
        expect(briefFor(stage, 'why', domain)).toBe(specific ?? briefFor(stage, 'why', null));
      }
    }
  });

  it('keeps the forward door stage-level whatever the domain', () => {
    for (const stage of STAGE_ORDER) {
      for (const domain of DOMAIN_IDS) {
        expect(imageSlug(stage, 'forward', domain)).toBe(`${stage}_forward`);
      }
    }
  });
});
