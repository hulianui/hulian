import { copy } from "./site.content";
import { demoHref } from "../../_components/demo-locale";
// 瀚云 HanCloud 官网内容 SSoT。纯数据 + lucide 图标引用，被各 section 与子页消费。
import {
  Rocket,
  Cpu,
  Globe,
  Activity,
  ShieldCheck,
  Users,
  GitBranch,
  Container,
  Boxes,
  MessageSquare,
  Database,
  Gauge,
  type LucideIcon,
} from "lucide-react";

export const brand = {
  name: copy("hancloud"),
  nameEn: "HanCloud",
  tagline: copy("theIntegratedCloudNativeApplicationPlatform"),
  description: copy("hancloudTakesYouFromGitPushToAGlobalReleaseWithDeploymentElasticComputeAndEndToEndObservabilityO"),
} as const;

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: copy("capabilities"), href: demoHref("/demos/website#features") },
  { label: copy("customers"), href: demoHref("/demos/website#testimonials") },
  { label: copy("pricing"), href: demoHref("/demos/website/pricing") },
  { label: copy("contact"), href: demoHref("/demos/website/contact") },
];

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}

export const stats: Stat[] = [
  { label: copy("totalDeployments"), value: 2.4, suffix: "M+", decimals: 1 },
  { label: copy("enterpriseCustomers"), value: 18000, suffix: "+" },
  { label: copy("serviceAvailability"), value: 99.99, suffix: "%", decimals: 2 },
  { label: copy("globalEdgeNodes"), value: 320, suffix: "" },
];

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  /** BentoCard 跨列/跨行的 className。 */
  span?: string;
}

export const features: Feature[] = [
  {
    icon: Rocket,
    title: copy("oneClickDeployment"),
    description: copy("deployOnGitPushCompleteCachedBuildsInSecondsAndRollBackAFailedReleaseToAnyPreviousVersionInOneCl"),
    span: "sm:col-span-2",
  },
  {
    icon: Cpu,
    title: copy("elasticCompute"),
    description: copy("automaticallyScalesUpAndDownBasedOnRequestsAndReturnsToZeroWhenIdleWithoutBilling"),
  },
  {
    icon: Globe,
    title: copy("globalEdgeNetwork"),
    description: copy("serveStaticAssetsAndFunctionsCloseToUsersFrom320EdgeNodes"),
  },
  {
    icon: Activity,
    title: copy("endToEndObservability"),
    description: copy("metricsLogsAndDistributedTracesWorkOutOfTheBoxWithNoCollectionStackToMaintain"),
    span: "sm:col-span-2",
  },
  {
    icon: ShieldCheck,
    title: copy("enterpriseGradeSecurity"),
    description: copy("soc2TypeIiAndMlpsLevel3ComplianceWithManagedSecretsAndCompleteAuditing"),
  },
  {
    icon: Users,
    title: copy("teamwork"),
    description: copy("fineGrainedRolePermissionsEnvironmentIsolationAndChangeAuditingAllowMultipleTeamsToSafelyShareAP"),
    span: "sm:col-span-2",
  },
];

export interface Integration {
  name: string;
  icon: LucideIcon;
}

export const integrations: Integration[] = [
  { name: "GitHub", icon: GitBranch },
  { name: "Docker", icon: Container },
  { name: "Kubernetes", icon: Boxes },
  { name: "Slack", icon: MessageSquare },
  { name: "Postgres", icon: Database },
  { name: "Datadog", icon: Gauge },
];

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  initial: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: copy("afterMovingToHancloudWeWentFromOneReleaseAWeekToMoreThanTenADayAndOurOnCallEngineersCanRollBackW"),
    name: copy("chenHang"),
    title: copy("auroraTechnologyEngineeringVp"),
    initial: copy("chen"),
  },
  {
    quote: copy("scalingElasticComputeToZeroWhenIdleCutOurStagingBillBy70"),
    name: copy("linYue"),
    title: copy("yuntuDataHeadOfInfrastructure"),
    initial: copy("lin"),
  },
  {
    quote: copy("observabilityWorksOutOfTheBoxSoNewEngineersCanTraceProductionIssuesOnDayOneWithoutBuildingATelem"),
    name: "Marco Reyes",
    title: "Northwind · Platform Lead",
    initial: "M",
  },
  {
    quote: copy("globalEdgeNodesCutInitialPageLoadTimeForInternationalUsersFrom18STo04SWithAClearLiftInConversion"),
    name: copy("suQing"),
    title: copy("farsailGlobalCto"),
    initial: copy("su"),
  },
  {
    quote: copy("complianceUsedToConsumeAnEngineerSEntireQuarterHancloudSAuditTrailAndManagedKeysHelpedUsPassTheS"),
    name: copy("zhaoMingyuan"),
    title: copy("wenxinFinancialSecurityDirector"),
    initial: copy("zhao"),
  },
  {
    quote: copy("theSameWorkflowTookUsFromDemoToProductionHancloudStaysOutOfTheWayBetterThanAnyPlatformWeVeUsed"),
    name: "Aisha Khan",
    title: "Lumen AI · Head of Eng",
    initial: "A",
  },
];

export interface Plan {
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  /** 价格无意义时（如企业版）展示的自定义文案。 */
  customPrice?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export const plans: Plan[] = [
  {
    name: copy("gettingStarted"),
    tagline: copy("personalProjectsAndPrototypeVerification"),
    monthly: 0,
    yearly: 0,
    features: [copy("text1ProductionProject"), copy("text100GbPerMonth"), copy("communitySupport"), copy("automaticHttpsAndGlobalCdn"), copy("forIndividuals")],
    cta: copy("startForFree"),
  },
  {
    name: copy("professional"),
    tagline: copy("growingTeamAndProductionOperations"),
    monthly: 199,
    yearly: 1990,
    features: [
      copy("unlimitedProjects"),
      copy("text1TbPerMonth"),
      copy("autoscalingCompute"),
      copy("metricsLogsDistributedTraces"),
      copy("upTo10Members"),
      copy("fourHourTicketResponse"),
    ],
    cta: copy("startA14DayTrial"),
    highlight: true,
  },
  {
    name: copy("enterprise"),
    tagline: copy("compliancePrivateDeploymentAndDedicatedSupport"),
    monthly: 0,
    yearly: 0,
    customPrice: copy("custom"),
    features: [
      copy("dedicatedEdgeNodesAndComputePool"),
      copy("soc2ClassIiiCompliance"),
      copy("ssoAndFineGrainedAuditing"),
      copy("dedicatedCustomerSuccessManager"),
      copy("text9999SlaGuaranteed"),
      copy("privateDeploymentOptional"),
    ],
    cta: copy("bookADemo"),
  },
];

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: copy("isItDifficultToMigrateToHancloud"),
    answer:
      copy("mostProjectsNeedNoCodeChangesConnectARepositoryAndHancloudDetectsTheFrameworkAndCreatesTheBuildC"),
  },
  {
    question: copy("areThereAnyHiddenLimitationsInTheFreeVersion"),
    answer:
      copy("freeIncludesOneProductionProject100GbOfMonthlyTrafficAndAGlobalCdnEnoughForRealPersonalProjectsW"),
  },
  {
    question: copy("howIsElasticComputeBilled"),
    answer:
      copy("payOnlyForRequestExecutionTimeWithNoIdleChargesAfterScalingToZeroSetABudgetCapForEachEnvironment"),
  },
  {
    question: copy("whatComplianceCertificationsAreSupported"),
    answer:
      copy("proAndEnterpriseRunOnSoc2TypeIiAuditedInfrastructureEnterpriseAlsoIncludesMlpsLevel3ComplianceSs"),
  },
  {
    question: copy("howDoIGetHelpDuringAnIncident"),
    answer:
      copy("freeIncludesCommunitySupportProIncludesAFourHourTicketResponseAndEnterpriseIncludesADedicatedCus"),
  },
];

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: copy("products"),
    links: [
      { label: copy("oneClickDeployment"), href: demoHref("/demos/website#features") },
      { label: copy("elasticCompute"), href: demoHref("/demos/website#features") },
      { label: copy("edgeNetwork"), href: demoHref("/demos/website#features") },
      { label: copy("observability"), href: demoHref("/demos/website#features") },
    ],
  },
  {
    title: copy("solutions"),
    links: [
      { label: copy("startups"), href: demoHref("/demos/website#testimonials") },
      { label: copy("globalEcommerce"), href: demoHref("/demos/website#testimonials") },
      { label: copy("aiApplications"), href: demoHref("/demos/website#testimonials") },
    ],
  },
  {
    title: copy("resources"),
    links: [
      { label: copy("documentation"), href: demoHref("/demos/website") },
      { label: copy("blog"), href: demoHref("/demos/website") },
      { label: copy("serviceStatus"), href: demoHref("/demos/website") },
      { label: copy("changelog"), href: demoHref("/demos/website") },
    ],
  },
  {
    title: copy("company"),
    links: [
      { label: copy("aboutUs"), href: demoHref("/demos/website") },
      { label: copy("careers"), href: demoHref("/demos/website") },
      { label: copy("contactSales"), href: demoHref("/demos/website/contact") },
      { label: copy("privacyPolicy"), href: demoHref("/demos/website") },
    ],
  },
];
