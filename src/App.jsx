import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import analysis from './analysis.json'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  CircleHelp,
  CircleAlert,
  Compass,
  FlaskConical,
  Globe2,
  HeartHandshake,
  House,
  Lightbulb,
  Languages,
  LibraryBig,
  MapPinned,
  Menu,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'

const VIEWS = [
  { id: 'story', label: 'The story', icon: BookOpen },
  { id: 'executive', label: 'Executive view', icon: Building2 },
  { id: 'operations', label: 'Operations', icon: BriefcaseBusiness },
  { id: 'why', label: 'Why explorer', icon: Lightbulb },
  { id: 'science', label: 'Evidence lab', icon: FlaskConical },
  { id: 'definitions', label: 'Definitions', icon: LibraryBig },
]

const NUMERIC_FIELDS = [
  'age', 'cultural_distance', 'host_gender_inequality', 'moved_with_family',
  'partner_relocated', 'children_relocated', 'distance_from_home_km',
  'assignment_length_months', 'language_proficiency', 'cultural_empathy',
  'cultural_intelligence', 'emotional_stability', 'extraversion', 'openness',
  'prior_intl_experience_years', 'self_efficacy', 'pre_move_prep', 'employer_support',
  'host_social_network_size', 'local_friends_first_year', 'community_support',
  'family_adjustment', 'adjustment_satisfaction', 'stayed',
]

const READINESS_FIELDS = [
  'language_proficiency', 'cultural_empathy', 'cultural_intelligence',
  'emotional_stability', 'self_efficacy', 'pre_move_prep',
]

const SUPPORT_FIELDS = ['employer_support', 'community_support', 'local_friends_first_year']

const DRIVER_LABELS = {
  adjustment_satisfaction: 'Adjustment satisfaction',
  family_adjustment: 'Family adjustment',
  language_proficiency: 'Language proficiency',
  community_support: 'Community support',
  local_friends_first_year: 'Local friendships',
  employer_support: 'Employer support',
  cultural_empathy: 'Cultural empathy',
  cultural_intelligence: 'Cultural intelligence',
  cultural_distance: 'Cultural distance',
}

const DISPLAY_LABELS = {
  W_Europe: 'Western Europe',
  E_Europe: 'Eastern Europe',
  N_America: 'North America',
  E_Asia: 'East Asia',
  S_Asia: 'South Asia',
  SE_Asia: 'Southeast Asia',
  LatAm: 'Latin America',
  SSA: 'Sub-Saharan Africa',
  MENA: 'Middle East and North Africa',
  Gulf: 'Gulf region (publisher-defined)',
  corporate_assignment: 'Corporate assignment',
  self_initiated: 'Self-initiated',
}

const GLOSSARY = [
  { group: 'Identity and geography', term: 'Expat ID', field: 'expat_id', technical: 'Unique string identifier for one synthetic relocation record.', plain: 'The record number. It does not identify a real person.', scale: 'Identifier', source: true },
  { group: 'Identity and geography', term: 'Age', field: 'age', technical: 'Age at the time of relocation, measured in years.', plain: 'How old the simulated mover was when the move began.', scale: 'Years', source: true },
  { group: 'Identity and geography', term: 'Sex', field: 'sex', technical: 'Binary M/F category supplied by the publisher.', plain: 'The dataset only simulates male and female categories. It does not represent all gender identities.', scale: 'M or F', source: true },
  { group: 'Identity and geography', term: 'Home region', field: 'home_region', technical: 'Publisher-defined macro-region of origin.', plain: 'The broad part of the world the simulated mover came from. Countries are not provided.', scale: 'Category', source: true },
  { group: 'Identity and geography', term: 'Host region', field: 'host_region', technical: 'Publisher-defined macro-region to which the record relocated.', plain: 'The broad destination region. It is not a country-level location.', scale: 'Category', source: true },
  { group: 'Identity and geography', term: 'Gulf region', field: 'host_region = Gulf', technical: 'A host-region label used by the publisher without a documented country membership rule.', plain: 'The source does not say whether this means the six GCC states or a broader Persian Gulf grouping, so the dashboard does not assume either.', scale: 'Publisher-defined category', source: true },
  { group: 'Move conditions', term: 'Cultural distance', field: 'cultural_distance', technical: 'Synthetic 0–10 index representing perceived difference between home and host cultural environments.', plain: 'Higher values mean the move is modeled as a larger cultural change. It is not physical distance.', scale: '0 low to 10 high', source: true },
  { group: 'Move conditions', term: 'Host gender inequality', field: 'host_gender_inequality', technical: 'Synthetic 0–10 country-context index for modeled gender inequality in the host environment.', plain: 'Higher values represent a more unequal host setting. It is not a named external index and should not be treated as a real country score.', scale: '0 low to 10 high', source: true },
  { group: 'Move conditions', term: 'Relocation type', field: 'relocation_type', technical: 'Categorical reason or pathway: corporate assignment, self-initiated, study, or family.', plain: 'Why the move happened. It describes the pathway, not whether the move succeeded.', scale: 'Four categories', source: true },
  { group: 'Move conditions', term: 'Moved with family', field: 'moved_with_family', technical: 'Binary indicator equal to 1 when family accompanied the mover.', plain: 'Whether family members moved too.', scale: '0 no, 1 yes', source: true },
  { group: 'Move conditions', term: 'Partner relocated', field: 'partner_relocated', technical: 'Binary indicator equal to 1 when a partner relocated.', plain: 'Whether a partner came along.', scale: '0 no, 1 yes', source: true },
  { group: 'Move conditions', term: 'Children relocated', field: 'children_relocated', technical: 'Binary indicator equal to 1 when children relocated.', plain: 'Whether children came along.', scale: '0 no, 1 yes', source: true },
  { group: 'Move conditions', term: 'Distance from home', field: 'distance_from_home_km', technical: 'Modeled physical distance between home and host locations.', plain: 'How far the move was geographically.', scale: 'Kilometers', source: true },
  { group: 'Move conditions', term: 'Assignment length', field: 'assignment_length_months', technical: 'Intended duration of the relocation or assignment.', plain: 'How long the move was planned to last.', scale: 'Months', source: true },
  { group: 'Readiness and disposition', term: 'Language proficiency', field: 'language_proficiency', technical: 'Synthetic score for proficiency in the host language.', plain: 'How comfortably the mover could use the local language.', scale: '0 low to 10 high', source: true },
  { group: 'Readiness and disposition', term: 'Cultural empathy', field: 'cultural_empathy', technical: 'Synthetic disposition score for understanding and responding to perspectives shaped by another culture.', plain: 'How well the mover can understand experiences from another cultural point of view.', scale: '0 low to 10 high', source: true },
  { group: 'Readiness and disposition', term: 'Cultural intelligence', field: 'cultural_intelligence', technical: 'Synthetic cultural-intelligence (CQ) score for functioning effectively across cultural contexts.', plain: 'How capable the mover is at noticing, learning, and adapting to different cultural expectations.', scale: '0 low to 10 high', source: true },
  { group: 'Readiness and disposition', term: 'Emotional stability', field: 'emotional_stability', technical: 'Synthetic Big Five-related score representing low neuroticism and emotional steadiness.', plain: 'How consistently the mover is modeled as handling stress and negative emotion.', scale: '0 low to 10 high', source: true },
  { group: 'Readiness and disposition', term: 'Extraversion', field: 'extraversion', technical: 'Synthetic Big Five extraversion score.', plain: 'How socially outgoing and energized by interaction the mover is modeled to be.', scale: '0 low to 10 high', source: true },
  { group: 'Readiness and disposition', term: 'Openness', field: 'openness', technical: 'Synthetic Big Five openness-to-experience score.', plain: 'How receptive the mover is modeled to be to unfamiliar ideas and experiences.', scale: '0 low to 10 high', source: true },
  { group: 'Readiness and disposition', term: 'Prior international experience', field: 'prior_intl_experience_years', technical: 'Modeled cumulative years of previous international experience.', plain: 'How much time the mover had already spent living or working internationally.', scale: 'Years', source: true },
  { group: 'Readiness and disposition', term: 'Self-efficacy', field: 'self_efficacy', technical: 'Synthetic score for confidence in one’s ability to handle tasks and challenges.', plain: 'How strongly the mover believes they can manage the demands of relocation.', scale: '0 low to 10 high', source: true },
  { group: 'Readiness and disposition', term: 'Pre-move preparation', field: 'pre_move_prep', technical: 'Synthetic score for preparation such as research or language classes before departure.', plain: 'How much practical preparation happened before the move.', scale: '0 low to 10 high', source: true },
  { group: 'Support and integration', term: 'Employer support', field: 'employer_support', technical: 'Synthetic 0–10 score for relocation support provided by an employer.', plain: 'How much practical and organizational help the employer provided.', scale: '0 low to 10 high', source: true },
  { group: 'Support and integration', term: 'Host social network size', field: 'host_social_network_size', technical: 'Synthetic count-like measure of the mover’s social network in the host environment.', plain: 'The modeled size of the person’s local network. The source does not document a maximum.', scale: 'Count-like score', source: true },
  { group: 'Support and integration', term: 'Local friends in first year', field: 'local_friends_first_year', technical: 'Synthetic count-like measure of local friendships formed during year one.', plain: 'How many local friendships the mover formed early in the relocation.', scale: 'Count-like score', source: true },
  { group: 'Support and integration', term: 'Community support', field: 'community_support', technical: 'Synthetic rating of perceived support from the surrounding community.', plain: 'How supported and connected the mover felt outside work and family.', scale: '0 low to 10 high', source: true },
  { group: 'Support and integration', term: 'Family adjustment', field: 'family_adjustment', technical: 'Synthetic 0–10 score for how well accompanying family members adjusted; missing for solo movers.', plain: 'How well the family settled in. It does not apply when the person moved alone.', scale: '0 low to 10 high; not applicable for solo moves', source: true },
  { group: 'Outcomes', term: 'Adjustment satisfaction', field: 'adjustment_satisfaction', technical: 'Continuous synthetic target measuring overall satisfaction with adjustment.', plain: 'How well the relocation felt overall to the simulated mover.', scale: '0 low to 10 high', source: true },
  { group: 'Outcomes', term: 'Stayed', field: 'stayed', technical: 'Binary target equal to 1 when the relocation was completed and 0 for premature return.', plain: 'Whether the simulated mover completed the planned relocation. It does not mean permanent immigration or citizenship.', scale: '0 returned early, 1 completed', source: true },
  { group: 'Dashboard measures', term: 'Stay rate', field: 'derived', technical: 'Mean of the binary stayed outcome within the selected cohort.', plain: 'The percentage of records that completed the relocation.', scale: 'Percent', source: false },
  { group: 'Dashboard measures', term: 'Premature return rate', field: 'derived', technical: 'One minus the stay rate within the selected cohort.', plain: 'The percentage of records that returned before completing the relocation.', scale: 'Percent', source: false },
  { group: 'Dashboard measures', term: 'High adjustment', field: 'derived', technical: 'Dashboard threshold counting adjustment-satisfaction scores greater than or equal to 7.', plain: 'The share of records with satisfaction of 7 or higher. The publisher did not define this cutoff.', scale: 'Percent with score ≥ 7', source: false },
  { group: 'Dashboard measures', term: 'Readiness composite', field: 'derived', technical: 'Equal-weight mean of language proficiency, cultural empathy, cultural intelligence, emotional stability, self-efficacy, and pre-move preparation.', plain: 'A dashboard summary of six readiness-related scores. It is exploratory, not a validated clinical or hiring assessment.', scale: '0 low to 10 high', source: false },
  { group: 'Dashboard measures', term: 'Support score', field: 'derived', technical: 'Equal-weight mean of employer support, community support, and local friends in the first year.', plain: 'A simple dashboard summary of work, community, and friendship support.', scale: 'Composite score; source fields use different concepts', source: false },
  { group: 'Dashboard measures', term: 'Transition ease', field: 'derived', technical: 'Ten minus the cultural-distance score.', plain: 'A reversed display of cultural distance so a higher number reads as an easier modeled transition.', scale: '0 harder to 10 easier', source: false },
  { group: 'Statistical terms', term: 'Correlation', field: 'derived', technical: 'Pearson correlation coefficient describing the direction and strength of a linear relationship between two variables.', plain: 'Whether two measures tend to move together. It does not prove that one causes the other.', scale: '-1 to +1', source: false },
  { group: 'Statistical terms', term: 'Expected stay probability', field: 'derived', technical: 'Probability estimated by the dashboard’s multivariable logistic model from measured mover and move characteristics.', plain: 'What the model predicts for records with this measured profile. It is not a guaranteed outcome.', scale: '0% to 100%', source: false },
  { group: 'Statistical terms', term: 'Unexplained route difference', field: 'derived', technical: 'Observed route stay rate minus the route’s average model-estimated stay probability.', plain: 'The portion of a route’s result that the measured factors did not explain. It should not automatically be called a location effect.', scale: 'Percentage-point difference', source: false },
  { group: 'Statistical terms', term: 'Odds ratio', field: 'derived', technical: 'Exponentiated logistic-regression coefficient showing multiplicative change in outcome odds for the stated comparison.', plain: 'How the odds change when one factor changes and the other modeled factors are held constant.', scale: '1 no change; above 1 higher odds; below 1 lower odds', source: false },
  { group: 'Statistical terms', term: 'AUC', field: 'derived', technical: 'Area under the receiver operating characteristic curve, measuring how well a model ranks completed versus premature-return records.', plain: 'How well the model separates the two outcomes across this synthetic dataset. It does not measure causality or individual certainty.', scale: '0.5 chance to 1.0 perfect ranking', source: false },
]

const fmtPct = (value) => `${(value * 100).toFixed(1)}%`
const fmt = (value, digits = 1) => Number.isFinite(value) ? value.toFixed(digits) : '—'
const pretty = (value) => DISPLAY_LABELS[value] || String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const mean = (rows, key) => {
  const values = rows.map((d) => d[key]).filter(Number.isFinite)
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN
}
const averageFields = (row, fields) => {
  const values = fields.map((key) => row[key]).filter(Number.isFinite)
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN
}
const rate = (rows) => mean(rows, 'stayed')
const groupBy = (rows, key) => Object.entries(rows.reduce((acc, row) => {
  const value = row[key] || 'Unknown'
  if (!acc[value]) acc[value] = []
  acc[value].push(row)
  return acc
}, {}))

function pearson(rows, xKey, yKey) {
  const pairs = rows
    .map((d) => [d[xKey], d[yKey]])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
  if (pairs.length < 3) return 0
  const xMean = pairs.reduce((s, [x]) => s + x, 0) / pairs.length
  const yMean = pairs.reduce((s, [, y]) => s + y, 0) / pairs.length
  let top = 0
  let xSq = 0
  let ySq = 0
  pairs.forEach(([x, y]) => {
    top += (x - xMean) * (y - yMean)
    xSq += (x - xMean) ** 2
    ySq += (y - yMean) ** 2
  })
  return top / Math.sqrt(xSq * ySq) || 0
}

function parseRows(rawRows) {
  return rawRows.map((row) => {
    const parsed = { ...row }
    NUMERIC_FIELDS.forEach((field) => {
      parsed[field] = row[field] === '' || row[field] == null ? NaN : Number(row[field])
    })
    parsed.readiness_score = averageFields(parsed, READINESS_FIELDS)
    parsed.support_score = averageFields(parsed, SUPPORT_FIELDS)
    return parsed
  })
}

function useDataset() {
  const [state, setState] = useState({ rows: [], loading: true, error: '' })

  useEffect(() => {
    Papa.parse(`${import.meta.env.BASE_URL}data/expat_relocation_master.csv`, {
      download: true,
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length && !data.length) {
          setState({ rows: [], loading: false, error: errors[0].message })
          return
        }
        setState({ rows: parseRows(data), loading: false, error: '' })
      },
      error: (error) => setState({ rows: [], loading: false, error: error.message }),
    })
  }, [])

  return state
}

function Stat({ label, value, note, tone = 'teal' }) {
  return (
    <article className={`stat stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  )
}

function SectionHeading({ eyebrow, title, copy, action }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {action}
    </div>
  )
}

function FilterBar({ filters, setFilters, rows }) {
  const options = useMemo(() => ({
    host: [...new Set(rows.map((d) => d.host_region))].sort(),
    type: [...new Set(rows.map((d) => d.relocation_type))].sort(),
  }), [rows])

  return (
    <div className="filter-bar" aria-label="Dashboard filters">
      <div className="filter-intro">
        <Compass size={18} aria-hidden="true" />
        <span>Explore a cohort</span>
      </div>
      <label>
        <span>Host region</span>
        <select value={filters.host} onChange={(e) => setFilters((f) => ({ ...f, host: e.target.value }))}>
          <option value="all">All destinations</option>
          {options.host.map((value) => <option value={value} key={value}>{pretty(value)}</option>)}
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </label>
      <label>
        <span>Relocation type</span>
        <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
          <option value="all">All relocation types</option>
          {options.type.map((value) => <option value={value} key={value}>{pretty(value)}</option>)}
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </label>
      <label>
        <span>Family status</span>
        <select value={filters.family} onChange={(e) => setFilters((f) => ({ ...f, family: e.target.value }))}>
          <option value="all">All movers</option>
          <option value="family">Moved with family</option>
          <option value="solo">Moved without family</option>
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </label>
      <button type="button" className="reset-button" onClick={() => setFilters({ host: 'all', type: 'all', family: 'all' })}>
        Reset
      </button>
    </div>
  )
}

function StoryView({ rows, summary, profiles }) {
  const journey = [
    { label: 'Readiness', value: mean(rows, 'readiness_score'), icon: Sparkles, copy: 'Skills and confidence carried into the move' },
    { label: 'Transition', value: 10 - mean(rows, 'cultural_distance'), icon: Globe2, copy: 'Ease of navigating cultural distance' },
    { label: 'Connection', value: mean(rows, 'support_score'), icon: Network, copy: 'Employer, community, and local relationships' },
    { label: 'Adjustment', value: summary.adjustment, icon: HeartHandshake, copy: 'Satisfaction with life in the host environment' },
  ]

  return (
    <>
      <section className="story-lead">
        <div className="story-copy">
          <span className="eyebrow">40,000 simulated relocation records</span>
          <h1>In this model, relocation success is tied to support built.</h1>
          <p>
            The simulated movers begin with different levels of readiness, encounter different cultural demands, and build different support systems. In this dataset, adjustment becomes the bridge between those conditions and completing the relocation.
          </p>
          <div className="story-finding">
            <Activity size={20} aria-hidden="true" />
            <span><strong>{fmtPct(summary.stayRate)}</strong> stayed, while satisfaction and cultural distance showed the clearest relationships with that outcome.</span>
          </div>
        </div>
        <div className="outcome-orbit" aria-label={`${fmtPct(summary.stayRate)} stayed and ${fmtPct(1 - summary.stayRate)} returned`}>
          <div className="orbit-ring" style={{ '--stay': `${summary.stayRate * 360}deg` }}>
            <div>
              <strong>{fmtPct(summary.stayRate)}</strong>
              <span>stayed</span>
            </div>
          </div>
          <div className="outcome-key">
            <span><i className="key-stay" /> Stayed</span>
            <span><i className="key-return" /> Returned</span>
          </div>
        </div>
      </section>

      <section className="stat-grid" aria-label="Headline outcomes">
        <Stat label="Adjustment satisfaction" value={`${fmt(summary.adjustment)} / 10`} note="Average self-reported outcome" tone="blue" />
        <Stat label="Return rate" value={fmtPct(1 - summary.stayRate)} note="Observed outcome in this cohort" tone="coral" />
        <Stat label="Readiness composite" value={`${fmt(summary.readiness)} / 10`} note="Six transparent pre-move factors" tone="gold" />
        <Stat label="Community support" value={`${fmt(summary.community)} / 10`} note="A leading adjustable support factor" tone="teal" />
      </section>

      <section className="section-block">
        <SectionHeading
          eyebrow="The adjustment pathway"
          title="A move unfolds in stages"
          copy="The pathway is a narrative model for exploration, not a claim that the data proves causation."
        />
        <div className="journey-track">
          {journey.map((stage, index) => {
            const Icon = stage.icon
            return (
              <div className="journey-stage" key={stage.label}>
                <div className="journey-marker"><Icon size={19} aria-hidden="true" /></div>
                <div className="journey-body">
                  <span>{stage.label}</span>
                  <strong>{fmt(stage.value)}</strong>
                  <p>{stage.copy}</p>
                </div>
                {index < journey.length - 1 && <ArrowRight className="journey-arrow" size={18} aria-hidden="true" />}
              </div>
            )
          })}
        </div>
      </section>

      <section className="section-block profile-section">
        <SectionHeading
          eyebrow="Profiles, not averages"
          title="Five recognizable relocation experiences"
          copy="Profiles overlap by design. A person can be culturally stretched, socially isolated, and moving with a family at the same time."
        />
        <div className="profile-grid">
          {profiles.map((profile) => (
            <article className="profile-row" key={profile.name}>
              <div className={`profile-icon ${profile.tone}`}><profile.icon size={18} aria-hidden="true" /></div>
              <div className="profile-name">
                <strong>{profile.name}</strong>
                <span>{profile.description}</span>
              </div>
              <div><span>Records</span><strong>{profile.count.toLocaleString()}</strong></div>
              <div><span>Stay rate</span><strong>{fmtPct(profile.stayRate)}</strong></div>
              <div><span>Adjustment</span><strong>{fmt(profile.adjustment)}</strong></div>
            </article>
          ))}
        </div>
      </section>

      <section className="audience-band">
        <SectionHeading eyebrow="One dataset, three kinds of value" title="A shared language for better relocations" />
        <div className="audience-grid">
          <article>
            <Building2 size={22} aria-hidden="true" />
            <h3>Executives see portfolio health</h3>
            <p>Track retention, adjustment, destination patterns, and the scale of support gaps across the relocation program.</p>
          </article>
          <article>
            <BriefcaseBusiness size={22} aria-hidden="true" />
            <h3>Operations sees where to act</h3>
            <p>Find cohorts with low language, employer, community, or family support and prioritize resources where gaps are largest.</p>
          </article>
          <article>
            <Users size={22} aria-hidden="true" />
            <h3>People see what helps</h3>
            <p>Understand that adjustment is a process, recognize common experiences, and identify practical sources of connection and preparation.</p>
          </article>
        </div>
      </section>
    </>
  )
}

function ExecutiveView({ rows, summary }) {
  const relocationData = groupBy(rows, 'relocation_type').map(([name, group]) => ({
    name: pretty(name),
    stayRate: +(rate(group) * 100).toFixed(1),
    adjustment: +mean(group, 'adjustment_satisfaction').toFixed(2),
    count: group.length,
  })).sort((a, b) => b.stayRate - a.stayRate)

  const regionData = groupBy(rows, 'host_region').map(([name, group]) => ({
    name: pretty(name), count: group.length, stayRate: rate(group), adjustment: mean(group, 'adjustment_satisfaction'),
  })).sort((a, b) => b.count - a.count)

  return (
    <>
      <SectionHeading
        eyebrow="Executive briefing"
        title="Program health at a glance"
        copy="A concise view of outcomes, portfolio composition, and where leadership attention can have the greatest reach."
      />
      <section className="stat-grid">
        <Stat label="Simulated records" value={summary.count.toLocaleString()} note="Current filtered cohort" tone="blue" />
        <Stat label="Stay rate" value={fmtPct(summary.stayRate)} note="Observed relocation outcome" tone="teal" />
        <Stat label="High adjustment" value={fmtPct(summary.highAdjustment)} note="Satisfaction score of 7 or higher" tone="gold" />
        <Stat label="Family movers" value={fmtPct(summary.familyShare)} note="Partner and/or children may relocate" tone="coral" />
      </section>

      <section className="two-column section-block">
        <div className="chart-panel">
          <div className="panel-title">
            <div><span className="eyebrow">Portfolio comparison</span><h3>Stay rate by relocation type</h3></div>
            <BarChart3 size={20} aria-hidden="true" />
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={relocationData} layout="vertical" margin={{ top: 8, right: 30, bottom: 8, left: 22 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--line)" />
                <XAxis type="number" domain={[60, 90]} tickFormatter={(v) => `${v}%`} tick={{ fill: 'var(--muted-text)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={118} tick={{ fill: 'var(--ink)', fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Stay rate']} contentStyle={{ borderRadius: 6, borderColor: 'var(--line)' }} />
                <Bar dataKey="stayRate" fill="var(--teal)" radius={[0, 3, 3, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-note">Corporate assignments have the strongest observed retention in the unfiltered dataset; this view updates with the selected cohort.</p>
        </div>

        <div className="brief-panel">
          <span className="eyebrow">Leadership readout</span>
          <h3>What deserves attention now</h3>
          <div className="brief-list">
            <div><span>01</span><p><strong>Adjustment is the outcome bridge.</strong> Satisfaction has the strongest direct relationship with staying.</p></div>
            <div><span>02</span><p><strong>Social support is actionable.</strong> Community, employer support, and local friendships move together with better outcomes.</p></div>
            <div><span>03</span><p><strong>Family experience changes the equation.</strong> Family adjustment is strongly associated with both satisfaction and retention.</p></div>
          </div>
          <div className="brief-caution"><ShieldCheck size={18} /><span>Use these signals to target discovery and support, not to make individual employment decisions.</span></div>
        </div>
      </section>

      <section className="section-block">
        <SectionHeading eyebrow="Decision agenda" title="Three decisions leadership can make from this evidence" copy="Each decision pairs the observed signal with a measurable next step. The goal is to learn whether support changes adjustment, not assume that correlation guarantees an effect." />
        <div className="decision-table">
          <article>
            <span>01</span>
            <div><strong>Standardize a minimum support offer</strong><p>Community and employer support remain important after accounting for other measured characteristics.</p></div>
            <div><b>Decision</b><p>Fund a 90-day support bundle for every relocation.</p></div>
            <div><b>Success measure</b><p>Support uptake, 90-day adjustment, and 12-month stay rate.</p></div>
          </article>
          <article>
            <span>02</span>
            <div><strong>Add a family transition track</strong><p>Family adjustment is closely related to both satisfaction and staying among family movers.</p></div>
            <div><b>Decision</b><p>Offer partner, school, childcare, and household transition support.</p></div>
            <div><b>Success measure</b><p>Family adjustment at 60 and 180 days, plus early returns.</p></div>
          </article>
          <article>
            <span>03</span>
            <div><strong>Manage high cultural-distance moves differently</strong><p>Cultural distance remains the largest negative adjusted relationship in the structural model.</p></div>
            <div><b>Decision</b><p>Require deeper preparation and earlier check-ins for high-distance moves.</p></div>
            <div><b>Success measure</b><p>Language progress, local connection, and adjustment trajectory.</p></div>
          </article>
        </div>
      </section>

      <section className="section-block">
        <SectionHeading eyebrow="Destination portfolio" title="Scale and outcomes by host region" />
        <div className="table-shell">
          <table>
            <thead><tr><th>Host region</th><th>Records</th><th>Share</th><th>Stay rate</th><th>Adjustment</th></tr></thead>
            <tbody>
              {regionData.map((region) => (
                <tr key={region.name}>
                  <td><strong>{region.name}</strong></td>
                  <td>{region.count.toLocaleString()}</td>
                  <td>{fmtPct(region.count / rows.length)}</td>
                  <td><span className="inline-rate"><i style={{ width: `${region.stayRate * 100}%` }} />{fmtPct(region.stayRate)}</span></td>
                  <td>{fmt(region.adjustment)} / 10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function OperationsView({ rows, profiles }) {
  const levers = [
    ['language_proficiency', 'Language development', 'Pre-departure and in-country coaching'],
    ['community_support', 'Community connection', 'Peer groups, local networks, and belonging'],
    ['employer_support', 'Employer support', 'Manager check-ins and practical relocation help'],
    ['local_friends_first_year', 'Local friendships', 'Structured opportunities for local connection'],
    ['family_adjustment', 'Family support', 'Partner, child, school, and household transition support'],
  ].map(([key, label, action]) => {
    const valid = rows.filter((d) => Number.isFinite(d[key]))
    const low = valid.filter((d) => d[key] < 4)
    const supported = valid.filter((d) => d[key] >= 7)
    return {
      key, label, action, affected: low.length, lowRate: rate(low), supportedRate: rate(supported),
      gap: rate(supported) - rate(low), average: mean(valid, key),
    }
  }).sort((a, b) => b.gap - a.gap)

  return (
    <>
      <SectionHeading
        eyebrow="Mobility operations"
        title="Turn signals into support priorities"
        copy="The opportunity table compares low-score and high-score groups. Differences are descriptive and should guide follow-up, not be treated as causal impact."
      />

      <section className="operations-layout">
        <div className="priority-table">
          <div className="panel-title"><div><span className="eyebrow">Support opportunities</span><h3>Where observed outcome gaps are widest</h3></div><HeartHandshake size={20} /></div>
          <div className="table-shell">
            <table>
              <thead><tr><th>Support lever</th><th>Low-score group</th><th>Observed stay-rate gap</th><th>Program focus</th></tr></thead>
              <tbody>
                {levers.map((lever, index) => (
                  <tr key={lever.key}>
                    <td><span className="rank">{String(index + 1).padStart(2, '0')}</span><strong>{lever.label}</strong></td>
                    <td>{lever.affected.toLocaleString()} records</td>
                    <td><strong className="gap-value">{Number.isFinite(lever.gap) ? `${(lever.gap * 100).toFixed(1)} pts` : '—'}</strong></td>
                    <td>{lever.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="operations-note">
          <CircleHelp size={22} aria-hidden="true" />
          <h3>How to use this view</h3>
          <p>Start with a large affected group and a meaningful observed gap. In a real program, speak with the people in that cohort before choosing an intervention.</p>
          <hr />
          <span>Good next question</span>
          <strong>“What makes connection difficult during the first year?”</strong>
        </aside>
      </section>

      <section className="section-block">
        <SectionHeading eyebrow="Cohort watchlist" title="Experiences that merit a closer look" copy="These are transparent, rule-based cohorts rather than opaque risk predictions." />
        <div className="watchlist-grid">
          {profiles.slice(1).map((profile) => (
            <article key={profile.name}>
              <div className={`profile-icon ${profile.tone}`}><profile.icon size={18} /></div>
              <span>{profile.name}</span>
              <strong>{profile.count.toLocaleString()}</strong>
              <p>{profile.description}</p>
              <div><span>Stay rate</span><b>{fmtPct(profile.stayRate)}</b></div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionHeading eyebrow="Action playbook" title="What the mobility team does on Monday" copy="Start with a defined cohort, offer a specific support action, and measure both participation and adjustment before scaling it." />
        <div className="playbook-grid">
          <article>
            <div><Network size={20} /><span>Social isolation</span></div>
            <p><b>Trigger:</b> support score below 5 or no local friendships developing by the first check-in.</p>
            <p><b>Action:</b> assign a local connector, invite the mover to two interest-based groups, and schedule a 30-day follow-up.</p>
            <p><b>Measure:</b> introductions completed, local friendships, community support, and adjustment change.</p>
          </article>
          <article>
            <div><House size={20} /><span>Family pressure</span></div>
            <p><b>Trigger:</b> family adjustment below 4 or a decline between check-ins.</p>
            <p><b>Action:</b> assess partner employment, school, childcare, housing, and household needs separately.</p>
            <p><b>Measure:</b> resolved needs, family adjustment trajectory, and early-return intention.</p>
          </article>
          <article>
            <div><Globe2 size={20} /><span>Cultural stretch</span></div>
            <p><b>Trigger:</b> cultural distance of 7 or higher combined with language below 4.</p>
            <p><b>Action:</b> add language coaching, scenario-based cultural preparation, and a host-country mentor.</p>
            <p><b>Measure:</b> language progress, confidence in daily situations, and 90-day adjustment.</p>
          </article>
        </div>
      </section>
    </>
  )
}

function WhyView({ rows }) {
  const [home, setHome] = useState('N_America')
  const [host, setHost] = useState('W_Europe')
  const homes = [...new Set(analysis.routes.map((route) => route.home))].sort()
  const hosts = [...new Set(analysis.routes.map((route) => route.host))].sort()
  const route = analysis.routes.find((item) => item.home === home && item.host === host) || analysis.routes[0]
  const baseline = {
    stay_rate: analysis.baseline_stay_rate,
    cultural_distance: mean(rows, 'cultural_distance'),
    language: mean(rows, 'language_proficiency'),
    community: mean(rows, 'community_support'),
    employer_support: mean(rows, 'employer_support'),
    local_friends: mean(rows, 'local_friends_first_year'),
  }
  const gapPoints = route ? route.unexplained_gap * 100 : 0
  const routeConclusion = Math.abs(gapPoints) < 1.5
    ? 'This route performs about as expected once the measured characteristics of its movers are considered.'
    : gapPoints > 0
      ? `This route stays ${Math.abs(gapPoints).toFixed(1)} points above what its measured profile predicts. The remaining difference is unexplained by this dataset.`
      : `This route stays ${Math.abs(gapPoints).toFixed(1)} points below what its measured profile predicts. The remaining difference is unexplained by this dataset.`

  const factors = [
    { key: 'cultural_distance', label: 'Cultural distance', value: route.cultural_distance, baseline: baseline.cultural_distance, lowerBetter: true, action: 'Cultural orientation and expectation setting' },
    { key: 'language', label: 'Language proficiency', value: route.language, baseline: baseline.language, action: 'Language learning before and after arrival' },
    { key: 'community', label: 'Community support', value: route.community, baseline: baseline.community, action: 'Community introductions and peer networks' },
    { key: 'employer_support', label: 'Employer support', value: route.employer_support, baseline: baseline.employer_support, action: 'Manager cadence and practical relocation support' },
    { key: 'local_friends', label: 'Local friendships', value: route.local_friends, baseline: baseline.local_friends, action: 'Structured local connection in year one' },
  ].map((factor) => {
    const difference = factor.value - factor.baseline
    const helpful = factor.lowerBetter ? difference < -0.15 : difference > 0.15
    const challenging = factor.lowerBetter ? difference > 0.15 : difference < -0.15
    return { ...factor, difference, signal: helpful ? 'helps explain' : challenging ? 'works against' : 'similar' }
  })

  const modelDrivers = analysis.structural_model.drivers
    .filter((driver) => !driver.key.startsWith('sex_') && !driver.key.startsWith('relocation_type_'))
    .slice(0, 8)

  return (
    <>
      <SectionHeading
        eyebrow="Multivariable why explorer"
        title="Separate route effects from mover profiles and support"
        copy="Observed outcomes are compared with a model that considers readiness, move context, family status, personality, and social support at the same time. This is explanatory modeling, not proof of causation."
      />

      <section className="route-selector" aria-label="Route comparison">
        <div>
          <MapPinned size={22} aria-hidden="true" />
          <span>Explore a route</span>
        </div>
        <label><span>Home region</span><select value={home} onChange={(event) => setHome(event.target.value)}>{homes.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select></label>
        <ArrowRight size={18} aria-hidden="true" />
        <label><span>Host region</span><select value={host} onChange={(event) => setHost(event.target.value)}>{hosts.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select></label>
      </section>

      <section className="route-answer">
        <div className="route-answer-main">
          <span className="eyebrow">What happened</span>
          <h3>{pretty(route.home)} to {pretty(route.host)}</h3>
          <p><strong>{fmtPct(route.stay_rate)}</strong> of {route.count.toLocaleString()} simulated records completed the relocation. The full-dataset rate is {fmtPct(baseline.stay_rate)}.</p>
        </div>
        <div className="route-expected">
          <span>Expected from measured factors</span>
          <strong>{fmtPct(route.expected_stay)}</strong>
          <small>Model estimate for records on this route</small>
        </div>
        <div className={`route-residual ${Math.abs(gapPoints) < 1.5 ? 'neutral' : gapPoints > 0 ? 'positive' : 'negative'}`}>
          <span>Unexplained route difference</span>
          <strong>{gapPoints > 0 ? '+' : ''}{gapPoints.toFixed(1)} pts</strong>
          <small>Observed minus expected</small>
        </div>
      </section>

      <section className="why-conclusion">
        <Lightbulb size={22} aria-hidden="true" />
        <div><span>Plain-language answer</span><strong>{routeConclusion}</strong><p>Large observed differences can come from who moved, why they moved, and what support they received. The residual is not automatically a location effect.</p></div>
      </section>

      <section className="section-block">
        <SectionHeading eyebrow="What may explain this route" title="Compare its conditions with the average move" copy="Small differences are labeled similar so normal variation is not overstated." />
        <div className="factor-comparison">
          {factors.map((factor) => (
            <article key={factor.key}>
              <div><strong>{factor.label}</strong><span className={`signal ${factor.signal.replace(' ', '-')}`}>{factor.signal}</span></div>
              <div className="factor-values"><span>Route <b>{fmt(factor.value)}</b></span><span>All moves <b>{fmt(factor.baseline)}</b></span></div>
              <div className="difference-track"><i style={{ left: `${Math.max(4, Math.min(92, 50 + factor.difference * 12))}%` }} /></div>
              <p>{factor.action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="two-column section-block">
        <div className="chart-panel">
          <div className="panel-title"><div><span className="eyebrow">Adjusted relationships</span><h3>What still matters when factors overlap</h3></div><TrendingUp size={20} /></div>
          <div className="chart-explainer compact">
            <strong>How to read it</strong>
            <p>Bars to the right are associated with higher odds of staying. Bars to the left are associated with lower odds. Every factor is evaluated while the others are held constant.</p>
          </div>
          <div className="chart-wrap tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelDrivers} layout="vertical" margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--line)" />
                <XAxis type="number" domain={[-0.75, 0.75]} tick={{ fill: 'var(--muted-text)', fontSize: 11 }} />
                <YAxis dataKey="label" type="category" width={126} tick={{ fill: 'var(--ink)', fontSize: 11 }} />
                <Tooltip formatter={(value, name, item) => [`${item.payload.odds_ratio}× odds`, item.payload.unit]} contentStyle={{ borderRadius: 6, borderColor: 'var(--line)' }} />
                <Bar dataKey="coefficient" barSize={18} radius={[0, 3, 3, 0]}>
                  {modelDrivers.map((driver) => <Cell key={driver.key} fill={driver.coefficient < 0 ? 'var(--coral)' : 'var(--teal)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-note">Model discrimination: AUC {analysis.structural_model.auc}. This describes separation within this dataset and is not a guarantee for an individual.</p>
        </div>
        <div className="driver-reading">
          <span className="eyebrow">What the model adds</span>
          <h3>Correlation alone can confuse overlapping influences.</h3>
          <div className="driver-list">
            {modelDrivers.slice(0, 5).map((driver, index) => (
              <div key={driver.key}><span>{String(index + 1).padStart(2, '0')}</span><p><strong>{driver.label}</strong>{driver.coefficient > 0 ? ' remains positively associated' : ' remains negatively associated'} with staying. The estimated odds are <b>{driver.odds_ratio}×</b> per comparison shown.</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <SectionHeading eyebrow="Move type is not the whole reason" title="Self-initiated moves are the largest group, not the most successful group" copy="Volume answers how common a pathway is. Completion rate answers how often records completed the move. Those are different questions." />
        <div className="type-explainer-grid">
          {analysis.relocation_types.sort((a, b) => b.count - a.count).map((item) => (
            <article key={item.type}>
              <span>{pretty(item.type)}</span>
              <strong>{fmtPct(item.share)} <small>of moves</small></strong>
              <div><span>Stay rate</span><b>{fmtPct(item.stay_rate)}</b></div>
              <div><span>Employer support</span><b>{fmt(item.employer_support)}</b></div>
              <p>{item.type === 'corporate_assignment' ? 'Higher employer support is a major measured distinction for this group.' : item.type === 'self_initiated' ? 'This pathway is common, but its stay rate is below corporate assignments.' : 'Compare the support mix before attributing the outcome to move type.'}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="missing-evidence">
        <div>
          <CircleAlert size={24} aria-hidden="true" />
          <span className="eyebrow">Socioeconomic questions remain open</span>
          <h3>This dataset cannot tell us whether money, education, visa security, or housing affordability caused a route to succeed.</h3>
          <p>Host gender inequality is a country-context measure, not a substitute for a person’s socioeconomic position. Answering those questions requires joining new sources or collecting additional fields.</p>
        </div>
        <ul>{analysis.missing_explanatory_fields.map((field) => <li key={field}>{field}</li>)}</ul>
      </section>
    </>
  )
}

function DefinitionsView() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('All definitions')
  const groups = ['All definitions', ...new Set(GLOSSARY.map((item) => item.group))]
  const normalizedQuery = query.trim().toLowerCase()
  const visible = GLOSSARY.filter((item) => {
    if (group !== 'All definitions' && item.group !== group) return false
    if (!normalizedQuery) return true
    return [item.term, item.field, item.technical, item.plain, item.scale]
      .some((value) => String(value).toLowerCase().includes(normalizedQuery))
  })

  return (
    <>
      <SectionHeading
        eyebrow="Definitions and provenance"
        title="Technical meaning, followed by everyday meaning"
        copy="Source fields come from the publisher’s data dictionary. Dashboard measures are calculations created for this analysis and are labeled separately."
      />

      <section className="synthetic-disclosure">
        <FlaskConical size={26} aria-hidden="true" />
        <div>
          <span className="eyebrow">Dataset provenance</span>
          <h3>These are 40,000 simulated relocations, not observations of real people.</h3>
          <p>The publisher describes the data as 100% synthetic and procedurally generated with a fixed seed. Its statistical structure was calibrated to expatriate-adjustment research. It is suitable for education and analytical demonstrations, not claims about actual populations or individual relocation advice.</p>
          <a href="https://www.kaggle.com/datasets/sergionefedov/expat-relocation-success-who-adjusts-goes-home/data" target="_blank" rel="noreferrer">View the publisher’s dataset description</a>
        </div>
      </section>

      <section className="region-definition section-block">
        <div>
          <MapPinned size={22} aria-hidden="true" />
          <span className="eyebrow">Geographic categories</span>
          <h3>“Gulf” is not defined at the country level.</h3>
          <p>The source uses <code>Gulf</code> as a host-region value but supplies no country list. The dashboard therefore displays <strong>Gulf region (publisher-defined)</strong>. It does not assume the category means only the GCC states or the entire Persian Gulf region.</p>
        </div>
        <div className="region-list">
          <span><b>W Europe</b> Western Europe</span>
          <span><b>E Europe</b> Eastern Europe</span>
          <span><b>N America</b> North America</span>
          <span><b>LatAm</b> Latin America</span>
          <span><b>SSA</b> Sub-Saharan Africa</span>
          <span><b>MENA</b> Middle East and North Africa</span>
          <span><b>E / S / SE Asia</b> East, South, and Southeast Asia</span>
          <span><b>Oceania</b> Oceania</span>
        </div>
      </section>

      <section className="definition-controls" aria-label="Filter definitions">
        <label className="definition-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search definitions</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a term or field" /></label>
        <label><span className="sr-only">Definition group</span><select value={group} onChange={(event) => setGroup(event.target.value)}>{groups.map((value) => <option key={value}>{value}</option>)}</select></label>
        <span>{visible.length} {visible.length === 1 ? 'definition' : 'definitions'}</span>
      </section>

      <section className="definition-list" aria-live="polite">
        {visible.map((item) => (
          <article key={`${item.field}-${item.term}`}>
            <div className="definition-term">
              <span>{item.group}</span>
              <h3>{item.term}</h3>
              <code>{item.field}</code>
              <small className={item.source ? 'source-field' : 'derived-field'}>{item.source ? 'Publisher field' : 'Dashboard-derived'}</small>
            </div>
            <div><span>Technical definition</span><p>{item.technical}</p></div>
            <div><span>In plain language</span><p>{item.plain}</p></div>
            <div><span>Scale or unit</span><p>{item.scale}</p></div>
          </article>
        ))}
        {!visible.length && <div className="empty-definitions">No definitions match that search.</div>}
      </section>
    </>
  )
}

function ScienceView({ rows, summary }) {
  const drivers = [
    'adjustment_satisfaction', 'family_adjustment', 'language_proficiency',
    'community_support', 'local_friends_first_year', 'employer_support',
    'cultural_empathy', 'cultural_intelligence', 'cultural_distance',
  ].map((key) => ({
    name: DRIVER_LABELS[key],
    value: +pearson(rows, key, 'stayed').toFixed(3),
  })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value))

  const bins = Array.from({ length: 10 }, (_, index) => ({ score: index + 1, stayed: 0, returned: 0 }))
  rows.forEach((row) => {
    const index = Math.min(9, Math.max(0, Math.floor(row.adjustment_satisfaction || 1) - 1))
    if (row.stayed === 1) bins[index].stayed += 1
    else bins[index].returned += 1
  })

  return (
    <>
      <SectionHeading
        eyebrow="Evidence lab"
        title="What the data supports, and what it does not"
        copy="A descriptive scientific overview designed to keep interpretation honest and reproducible."
      />

      <section className="science-summary">
        <div>
          <span className="eyebrow">High-level finding</span>
          <h3>Adjustment is multidimensional.</h3>
          <p>Language, cultural empathy and intelligence, community support, employer support, local friendships, and family adjustment all show positive relationships with satisfaction. Cultural distance shows the clearest negative relationship.</p>
        </div>
        <div>
          <span className="eyebrow">Outcome finding</span>
          <h3>Satisfaction is closest to staying.</h3>
          <p>Among available measures, adjustment satisfaction has the strongest correlation with the observed stay outcome. Family adjustment, language, and community support follow.</p>
        </div>
        <div>
          <span className="eyebrow">Interpretation boundary</span>
          <h3>Association is not causation.</h3>
          <p>The dataset is observational. Correlations can identify useful signals, but they do not prove that changing one factor will produce a specific outcome.</p>
        </div>
      </section>

      <section className="two-column section-block">
        <div className="chart-panel">
          <div className="panel-title"><div><span className="eyebrow">Relationship strength</span><h3>Correlation with staying</h3></div><FlaskConical size={20} /></div>
          <div className="chart-explainer">
            <strong>What this shows</strong>
            <p>A value near 0 means little linear relationship. Values farther from 0 indicate a stronger relationship. Positive values rise with staying; negative values fall as staying rises.</p>
            <span><b>Use it to:</b> identify questions worth testing. Do not rank interventions from this chart alone because each factor is viewed separately.</span>
          </div>
          <div className="chart-wrap tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drivers} layout="vertical" margin={{ top: 5, right: 28, bottom: 8, left: 22 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--line)" />
                <XAxis type="number" domain={[-0.35, 0.55]} tick={{ fill: 'var(--muted-text)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={126} tick={{ fill: 'var(--ink)', fontSize: 11 }} />
                <Tooltip formatter={(value) => [value, 'Pearson r']} contentStyle={{ borderRadius: 6, borderColor: 'var(--line)' }} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={18}>
                  {drivers.map((entry) => <Cell key={entry.name} fill={entry.value < 0 ? 'var(--coral)' : 'var(--teal)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-panel">
          <div className="panel-title"><div><span className="eyebrow">Outcome distribution</span><h3>Adjustment scores by outcome</h3></div><Activity size={20} /></div>
          <div className="chart-explainer">
            <strong>What this shows</strong>
            <p>The two shapes show where satisfaction scores concentrate for records that completed the relocation and returned early. Overlap means a score does not determine an individual outcome.</p>
            <span><b>Use it to:</b> set a program-level early-warning threshold, then combine it with support and family context.</span>
          </div>
          <div className="chart-wrap tall">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bins} margin={{ top: 12, right: 10, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="score" tick={{ fill: 'var(--muted-text)', fontSize: 12 }} label={{ value: 'Adjustment satisfaction', position: 'insideBottom', offset: -2, fill: 'var(--muted-text)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--muted-text)', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 6, borderColor: 'var(--line)' }} />
                <Area type="monotone" dataKey="stayed" name="Stayed" stroke="var(--teal)" fill="var(--teal-soft)" strokeWidth={2} />
                <Area type="monotone" dataKey="returned" name="Returned" stroke="var(--coral)" fill="var(--coral-soft)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="method-grid section-block">
        <article>
          <span>Dataset</span><strong>{summary.count.toLocaleString()} filtered records</strong><p>29 variables spanning demographics, move context, readiness, support, adjustment, and outcome.</p>
        </article>
        <article>
          <span>Missingness</span><strong>Family adjustment only</strong><p>Missing values primarily represent records that did not move with family and are excluded from family-specific calculations.</p>
        </article>
        <article>
          <span>Composite score</span><strong>Transparent mean</strong><p>Readiness averages six equally weighted 1–10 measures. It is an exploratory summary, not a validated psychometric scale.</p>
        </article>
        <article>
          <span>Ethical use</span><strong>Program insight</strong><p>Use aggregate patterns for support planning. Avoid individual-level screening, employment decisions, or claims of predicted success.</p>
        </article>
      </section>

      <section className="evidence-reading section-block">
        <div><Target size={22} /><span className="eyebrow">A practical reading order</span><h3>Move from signal to explanation before acting.</h3></div>
        <ol>
          <li><strong>Find the outcome gap.</strong><span>Choose a route, move type, or family cohort with enough records to compare.</span></li>
          <li><strong>Check the composition.</strong><span>Ask whether readiness, cultural distance, family status, or support differs from the baseline.</span></li>
          <li><strong>Review adjusted results.</strong><span>Use the Why explorer to see which relationships remain when measured factors overlap.</span></li>
          <li><strong>Test an action.</strong><span>Track a leading measure such as support uptake and an outcome such as adjustment, then reassess.</span></li>
        </ol>
      </section>
    </>
  )
}

export default function App() {
  const { rows, loading, error } = useDataset()
  const [view, setView] = useState('story')
  const [menuOpen, setMenuOpen] = useState(false)
  const [filters, setFilters] = useState({ host: 'all', type: 'all', family: 'all' })

  const filtered = useMemo(() => rows.filter((row) => {
    if (filters.host !== 'all' && row.host_region !== filters.host) return false
    if (filters.type !== 'all' && row.relocation_type !== filters.type) return false
    if (filters.family === 'family' && row.moved_with_family !== 1) return false
    if (filters.family === 'solo' && row.moved_with_family !== 0) return false
    return true
  }), [rows, filters])

  const summary = useMemo(() => ({
    count: filtered.length,
    stayRate: rate(filtered),
    adjustment: mean(filtered, 'adjustment_satisfaction'),
    readiness: mean(filtered, 'readiness_score'),
    community: mean(filtered, 'community_support'),
    highAdjustment: filtered.filter((d) => d.adjustment_satisfaction >= 7).length / filtered.length,
    familyShare: mean(filtered, 'moved_with_family'),
  }), [filtered])

  const profiles = useMemo(() => {
    const definitions = [
      { name: 'Ready and connected', description: 'Readiness ≥ 6 and support ≥ 5.5', tone: 'teal', icon: Sparkles, test: (d) => d.readiness_score >= 6 && d.support_score >= 5.5 },
      { name: 'Ready but isolated', description: 'Readiness ≥ 6 with support below 5', tone: 'blue', icon: Network, test: (d) => d.readiness_score >= 6 && d.support_score < 5 },
      { name: 'High cultural stretch', description: 'Cultural distance of 7 or higher', tone: 'gold', icon: Globe2, test: (d) => d.cultural_distance >= 7 },
      { name: 'Family under pressure', description: 'Moved with family; adjustment below 4', tone: 'coral', icon: House, test: (d) => d.moved_with_family === 1 && d.family_adjustment < 4 },
      { name: 'Low employer support', description: 'Employer support below 3', tone: 'purple', icon: BriefcaseBusiness, test: (d) => d.employer_support < 3 },
    ]
    return definitions.map((definition) => {
      const group = filtered.filter(definition.test)
      return { ...definition, count: group.length, stayRate: rate(group), adjustment: mean(group, 'adjustment_satisfaction') }
    })
  }, [filtered])

  if (loading) {
    return <main className="loading-screen"><Globe2 size={32} /><h1>Building the relocation picture</h1><p>Reading 40,000 simulated records…</p><div className="loading-line"><i /></div></main>
  }

  if (error) {
    return <main className="loading-screen"><CircleHelp size={32} /><h1>The dataset could not be loaded</h1><p>{error}</p></main>
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button type="button" className="mobile-menu" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="brand-mark"><Globe2 size={20} aria-hidden="true" /></div>
        <div className="brand-copy"><strong>Global Mobility</strong><span>Intelligence Observatory</span></div>
        <div className="dataset-status"><i /> Synthetic dataset <span>{rows.length.toLocaleString()} records</span></div>
      </header>

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <nav aria-label="Dashboard views">
          {VIEWS.map((item) => {
            const Icon = item.icon
            return (
              <button type="button" key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { setView(item.id); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                <Icon size={18} aria-hidden="true" /><span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="sidebar-foot">
          <Languages size={17} aria-hidden="true" />
          <p><strong>Evidence, then empathy.</strong><br />Aggregate insight for healthier moves.</p>
        </div>
      </aside>

      <main className="main-content">
        {!['why', 'definitions'].includes(view) && <>
          <FilterBar filters={filters} setFilters={setFilters} rows={rows} />
          <div className="cohort-line" aria-live="polite">
            Showing <strong>{filtered.length.toLocaleString()}</strong> of {rows.length.toLocaleString()} records
          </div>
        </>}
        {view === 'why' && <div className="analysis-scope"><FlaskConical size={16} /><span>The Why explorer uses all 40,000 records so route comparisons and adjusted estimates stay stable.</span></div>}
        {view === 'definitions' && <div className="analysis-scope"><LibraryBig size={16} /><span>Definitions cover the full source dataset and every measure created by this dashboard.</span></div>}
        {view === 'story' && <StoryView rows={filtered} summary={summary} profiles={profiles} />}
        {view === 'executive' && <ExecutiveView rows={filtered} summary={summary} />}
        {view === 'operations' && <OperationsView rows={filtered} profiles={profiles} />}
        {view === 'why' && <WhyView rows={rows} />}
        {view === 'science' && <ScienceView rows={filtered} summary={summary} />}
        {view === 'definitions' && <DefinitionsView />}
        <footer>
          <span>Expat Relocation Success synthetic dataset</span>
          <span>Educational modeling data · correlations do not establish causation</span>
        </footer>
      </main>
    </div>
  )
}
