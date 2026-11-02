import type { Domain } from '../domain/types';

export interface Source {
  /** As the work itself lists them. */
  authors: string;
  year: string;
  title: string;
  /** Journal, publisher or issuing body. */
  venue: string;
  url?: string;
  /** One line, in our own voice, on why this is here. */
  note: string;
  /** Anything a reader should weigh before citing it onward. */
  caveat?: string;
}

/**
 * Where this tool's claims come from.
 *
 * Every entry is taken from `specs/research/evidence-review.md`, which
 * assessed this framework against the published literature. Nothing is
 * listed here that was not read there, and the review's own caveats travel
 * with the entries — a reader who follows one of these links should not
 * discover a qualification we knew about and left out.
 *
 * The review is also the honest answer to "how much of this is established?"
 * Rather little, in places: the six stages are a practitioner model, their
 * sequence is not evidenced, and the Grief Gap is an untested hypothesis of
 * our own. Those findings are summarised in the modal rather than buried,
 * because a sources list that only flatters the thing it supports is an
 * advertisement.
 */

/** The model, and the evidence for and against it. */
export const FRAMEWORK_SOURCES: Source[] = [
  {
    authors: 'Holdsworth, L. & Bridgman, T.',
    year: '2025',
    title:
      "From coping with dying to coping with organizational change: the bricolage of the change curve's evolution",
    venue: 'Journal of Organizational Change Management, 38(8), 254–269',
    url: 'https://www.emerald.com/jocm/article/38/8/254/1318694/From-coping-with-dying-to-coping-with',
    note: 'Where the "change curve" actually came from: assembled by consultants between about 1986 and 2002, not by Kübler-Ross.',
  },
  {
    authors: 'Salerno, A. & Brock, L.',
    year: '2008',
    title: 'The Change Cycle: How People Can Survive and Thrive in Organizational Change',
    venue: 'Berrett-Koehler',
    url: 'https://www.amazon.com/Change-Cycle-People-Survive-Organizational/dp/1576754987',
    note: 'The actual source of the six stages used here, including the Danger Zone. A model built for organisational change rather than retrofitted from bereavement.',
  },
  {
    authors: 'Maciejewski, P.K., Zhang, B., Block, S.D. & Prigerson, H.G.',
    year: '2007',
    title: 'An Empirical Examination of the Stage Theory of Grief',
    venue: 'JAMA, 297(7), 716–723',
    url: 'https://jamanetwork.com/journals/jama/fullarticle/205661',
    note: 'The one direct test of stage theory. It found the predicted first stage was not first, which is why this tool treats the six stages as a vocabulary of states rather than a sequence you pass through.',
  },
  {
    authors: 'Stroebe, M., Schut, H. & Boerner, K.',
    year: '2017',
    title:
      'Cautioning Health-Care Professionals: Bereaved Persons Are Misguided Through the Stages of Grief',
    venue: 'Omega: Journal of Death and Dying, 74(4), 455–473',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28395639/',
    note: 'The case against telling people which stage they are in. Worth reading against this tool, not only with it.',
  },
  {
    authors: 'Piderit, S.K.',
    year: '2000',
    title:
      'Rethinking Resistance and Recognizing Ambivalence: A Multidimensional View of Attitudes Toward an Organizational Change',
    venue: 'Academy of Management Review, 25(4), 783–794',
    url: 'https://journals.aom.org/doi/abs/10.5465/amr.2000.3707722',
    note: 'Resistance as ambivalence rather than deficiency. The settled position in this literature, and the one this tool is built on.',
  },
  {
    authors: 'Selenko, E., Bankins, S., Shoss, M., Warburton, J. & Restubog, S.L.D.',
    year: '2022',
    title: 'Artificial Intelligence and the Future of Work: A Functional-Identity Perspective',
    venue: 'Current Directions in Psychological Science, 31(3)',
    url: 'https://journals.sagepub.com/doi/full/10.1177/09637214221091823',
    note: 'Why this lands as an identity question and not a tooling question. Converges independently on the threat categories this tool uses.',
  },
  {
    authors: 'Bick, A., Blandin, A. & Deming, D.J.',
    year: '2024',
    title: 'The Rapid Adoption of Generative AI',
    venue: 'NBER Working Paper 32966',
    url: 'https://www.nber.org/system/files/working_papers/w32966/w32966.pdf',
    note: 'The nationally representative adoption series behind the "where your field sits" number, tracked by occupation.',
  },
  {
    authors: 'Smith, H.J., Pettigrew, T.F., Pippin, G.M. & Bialosiewicz, S.',
    year: '2012',
    title: 'Relative Deprivation: A Theoretical and Meta-Analytic Review',
    venue: 'Personality and Social Psychology Review, 16(3), 203–232',
    url: 'https://doi.org/10.1177/1088868311430825',
    note: 'The closest established support for the Grief Gap: that comparison with a reference group predicts distress.',
    caveat:
      'Adjacent, not direct. Nothing in the literature tests distance from your own field against your own position, so the gap remains our hypothesis.',
  },
  {
    authors: 'Jones-Jang, S.M.',
    year: '2026',
    title: 'AI fear of missing out (AI FOMO): Desire without action under social pressure',
    venue: 'Big Data & Society',
    url: 'https://doi.org/10.1177/20539517261481718',
    note: 'Wanting to act and not acting, under social pressure: the pattern this tool calls Discomfort.',
  },
];

/** What the evidence says actually helps, as opposed to what sounds helpful. */
export const HELP_SOURCES: Source[] = [
  {
    authors: 'Weick, K.E.',
    year: '1984',
    title: 'Small wins: Redefining the scale of social problems',
    venue: 'American Psychologist, 39(1), 40–49',
    note: 'Why one finished small thing beats a plan. The reasoning behind every "try this" in this tool.',
  },
  {
    authors: 'Gollwitzer, P.M. & Sheeran, P.',
    year: '2006',
    title: 'Implementation intentions and goal achievement: A meta-analysis of effects and processes',
    venue: 'Advances in Experimental Social Psychology, 38, 69–119',
    url: 'https://cancercontrol.cancer.gov/sites/default/files/2020-06/goal_intent_attain.pdf',
    note: 'Deciding in advance when and where you will do the thing reliably increases the chance you do it, across hundreds of studies. Free to read.',
  },
  {
    authors: 'Sheeran, P., Listrom, O. & Gollwitzer, P.M.',
    year: '2024',
    title:
      'The when and how of planning: Meta-analysis of the scope and components of implementation intentions in 642 tests',
    venue: 'European Review of Social Psychology, 36(1), 162–194',
    url: 'https://doi.org/10.1080/10463283.2024.2334563',
    note: 'The current, much larger version of the same finding.',
    caveat: 'Some records date this 2025; check the journal page.',
  },
  {
    authors: 'Patall, E.A., Cooper, H. & Robinson, J.C.',
    year: '2008',
    title:
      'The effects of choice on intrinsic motivation and related outcomes: A meta-analysis of research findings',
    venue: 'Psychological Bulletin, 134(2), 270–300',
    url: 'https://selfdeterminationtheory.org/wp-content/uploads/2019/10/2008_PatallCooperRobinson_PsychBulletin.pdf',
    note: 'Choosing the first step yourself matters more than which step it is. Free to read.',
  },
  {
    authors: 'Steindl, C., Jonas, E., Sittenthaler, S., Traut-Mattausch, E. & Greenberg, J.',
    year: '2015',
    title: 'Understanding Psychological Reactance: New Developments and Findings',
    venue: 'Zeitschrift für Psychologie, 223(4), 205–214',
    url: 'https://doi.org/10.1027/2151-2604/a000222',
    note: 'Why being pushed produces the opposite of the intended effect, including by a tool like this one.',
  },
  {
    authors: 'Edmondson, A.',
    year: '1999',
    title: 'Psychological Safety and Learning Behavior in Work Teams',
    venue: 'Administrative Science Quarterly, 44(2), 350–383',
    note: 'Whether it is safe to be visibly bad at something new, which decides whether anyone tries.',
  },
  {
    authors: 'Dias, et al.',
    year: '2026',
    title:
      'Self-Conscious Emotions in Technology Adoption: How Embarrassment and Shame Shape Consumer Responses to New Technologies',
    venue: 'Psychology & Marketing',
    url: 'https://doi.org/10.1002/mar.70048',
    note: 'The feeling of being behind is itself what keeps people behind. If one paper explains the Danger Zone, it is this one.',
  },
  {
    authors: 'Bandura, A.',
    year: '1977',
    title: 'Self-efficacy: Toward a unifying theory of behavioral change',
    venue: 'Psychological Review, 84(2), 191–215',
    note: 'Belief that you can do the thing comes from having done a smaller version of it, not from encouragement.',
  },
];

/** Sources specific to one kind of work. */
export const DOMAIN_SOURCES: Record<Domain, Source[]> = {
  teaching: [
    {
      authors: 'Digital Education Council',
      year: '2025',
      title: 'Global AI Faculty Survey 2025',
      venue: 'Digital Education Council',
      url: 'https://www.digitaleducationcouncil.com/dec-insights/what-faculty-want-key-results-from-the-global-ai-faculty-survey-2025',
      note: '83% of faculty are concerned about students evaluating AI output critically; 82% about over-reliance. The worry is student cognition, not rule-breaking.',
    },
    {
      authors: 'EDUCAUSE',
      year: '2025',
      title: '2025 EDUCAUSE AI Landscape Study: Into the Digital AI Divide',
      venue: 'EDUCAUSE',
      url: 'https://library.educause.edu/resources/2025/2/2025-educause-ai-landscape-study',
      note: '68% say students use AI more than faculty do, against 2% the other way. The asymmetry faculty are responding to.',
    },
    {
      authors: 'Tyton Partners',
      year: '2025',
      title: 'Time for Class 2025',
      venue: 'Tyton Partners',
      url: 'https://tytonpartners.com/listening-to-learners-2025/',
      note: 'Institutional practice has not settled: a minority of institutions have acceptable-use policies, and most faculty call the guidance incomplete.',
    },
  ],

  craft: [
    {
      authors: 'Taylor, J., Mire, J., DeVrio, A., Sap, M., Zhu, H. & Fox, S.E.',
      year: '2026',
      title:
        "'I Just Don't Want My Work Being Fed Into The AI Blender': Queer Artists on Refusing and Resisting Generative AI",
      venue: "CSCW '26",
      url: 'https://arxiv.org/abs/2604.14266',
      note: 'Refusal as a considered position rather than a stage: consent, credit and compensation, and an objection that consent-based training would not fully resolve.',
      caveat: 'n=15 semi-structured interviews.',
    },
    {
      authors: 'Society of Authors',
      year: '2024',
      title: 'Survey of members on generative AI',
      venue: 'Society of Authors',
      note: '26% of illustrators had already lost work to generative AI; 78% expected income to fall. In this field the loss is frequently realised, not anticipated.',
      caveat:
        'n=787 of roughly 12,500 approached, so self-selection is likely, and we have these figures via secondary coverage rather than from the Society of Authors report itself.',
    },
    {
      authors: 'Anonymous',
      year: '2024',
      title:
        'Precarity and Solidarity: queer and disabled fiction writers’ experiences with generative AI',
      venue: 'arXiv 2412.04575',
      url: 'https://arxiv.org/pdf/2412.04575',
      note: 'Objections that go past compensation, from writers with the least room to absorb the loss.',
      caveat: 'Preprint, preliminary results.',
    },
  ],

  analysis: [
    {
      authors: 'Thomson Reuters',
      year: '2026',
      title: 'Future of Professionals Report 2026',
      venue: 'Thomson Reuters',
      url: 'https://www.lawnext.com/2026/06/thomson-reuters-future-of-professionals-report-warns-of-widening-gap-between-ai-adoption-and-ai-value.html',
      note: '74% weekly use alongside 91% saying their organisation falls short of what the technology could deliver. The problem is value and verification, not adoption.',
      caveat: 'Vendor-published. Read the method before quoting the numbers.',
    },
    {
      authors: 'Clio',
      year: '2025',
      title: 'Legal Trends Report 2025',
      venue: 'Clio',
      url: 'https://www.clio.com/resources/legal-trends/read-online/',
      note: 'Adoption and billing data across legal practice.',
      caveat: 'Vendor-published, and drawn from one platform’s customers.',
    },
  ],

  building: [
    {
      authors: 'Stack Overflow',
      year: '2025',
      title: '2025 Developer Survey',
      venue: 'Stack Overflow',
      url: 'https://survey.stackoverflow.co/2025/',
      note: 'Use up to 84% while trust falls to 33%, experienced developers the most sceptical, 66% frustrated by "almost right" output and 45% saying it takes longer to debug.',
      caveat: 'Self-selected respondents.',
    },
    {
      authors: 'Alami, A., Paja, E. & Tiwari, A.',
      year: '2026',
      title: 'The Psychological Costs of Artificial Intelligence Adoption in Software Engineering',
      venue: 'arXiv 2609.03456',
      url: 'https://arxiv.org/abs/2609.03456',
      note: 'Uncertainty distress when the pace of change outruns the capacity to adapt, amplified by adoption pressure from above.',
      caveat: 'Preprint, not yet peer reviewed; open access, and the method is reported in full.',
    },
    {
      authors: 'DORA / Google Cloud',
      year: '2025',
      title: 'State of AI-assisted Software Development',
      venue: 'Google Cloud',
      url: 'https://blog.google/innovation-and-ai/technology/developers-tools/dora-report-2025/',
      note: 'What changes in delivery when the tools are in the loop.',
      caveat: 'Vendor-published.',
    },
  ],

  coordination: [
    {
      authors: 'Anonymous',
      year: '2026',
      title:
        'Continuous improvement in the age of AI: human and relational barriers in public higher education',
      venue: 'The TQM Journal',
      url: 'https://doi.org/10.1108/TQM-04-2026-0262',
      note: 'Staff resisted the applications that substitute for human contact, and welcomed the ones that take documentation. The boundary is relational, and it is a professional judgment.',
    },
    {
      authors: 'Anonymous',
      year: '2026',
      title: 'The AI Adaptation Gap in Higher Education: Students, Faculty, and Administrative Staff',
      venue: 'arXiv 2608.25063',
      url: 'https://arxiv.org/html/2608.25063v1',
      note: 'Professional-services staff are usually aggregated into "administrator", which is also what underplays their part in governance and student services.',
      caveat: 'Preprint, not yet peer reviewed.',
    },
    {
      authors: 'Anonymous',
      year: '2026',
      title:
        'Multi-Level Barriers to Generative AI Adoption Across Disciplines and Professional Roles in Higher Education',
      venue: 'arXiv 2603.27052',
      url: 'https://arxiv.org/pdf/2603.27052',
      note: 'Licensing limits, policy ambiguity and governance weigh more heavily here than on the academic side.',
      caveat: 'Preprint, not yet peer reviewed.',
    },
  ],
};
