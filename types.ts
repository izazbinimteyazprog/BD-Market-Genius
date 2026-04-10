
export interface ProductMarketFit {
  core_problem: string;
  urgency_level: 'High' | 'Medium' | 'Low';
  demand_type: 'Impulse' | 'Considered' | 'Necessity';
  cultural_relevance: string;
  seasonality: string;
  market_fit_score: number;
  price_sensitivity: 'Low' | 'Medium' | 'High';
}

export interface AdSaturation {
  facebook_instagram: number;
  google_ads: number;
  marketplaces: number;
}

export interface CompetitionAnalysis {
  estimated_active_sellers: 'Low' | 'Medium' | 'High';
  avg_daily_sales_per_seller: 'Low' | 'Medium' | 'High';
  price_range_bdt: string;
  competition_type: 'Brand-led' | 'Commodity-led' | 'Mixed';
  ad_saturation: AdSaturation;
  entry_difficulty: 'Easy' | 'Moderate' | 'Hard';
}

export interface CompetitorAd {
  platform: 'Meta' | 'TikTok' | 'YouTube' | 'Google';
  brand_name: string;
  ad_type: string;
  estimated_duration: string;
  strategy_insight: string;
  performance_score: number;
}

export interface CompetitorBrand {
  name: string;
  active_platforms: string[]; // e.g. ['facebook', 'instagram', 'youtube']
  estimated_sales_volume: string;
}

export interface CompetitorResearch {
  top_competitors: CompetitorBrand[];
  live_ad_trends: CompetitorAd[];
  winning_creative_elements: string[];
  ad_library_links: {
    meta: string;
    tiktok: string;
    google: string;
  };
}

export interface CustomerAvatar {
  avatar_name: string;
  age_range: string;
  gender: string;
  location: 'Urban' | 'Semi-Urban' | 'Rural';
  income_level: string;
  pain_points: string[];
  hidden_fears: string[];
  desired_transformation: string;
  buying_objections: string[];
  purchase_triggers: string[];
}

export interface AdVariation {
  headline: string;
  hook: string;
  body: string;
  cta: string;
}

export interface ContentPiece {
  id: string;
  title: string;
  hooks: string[];
  ideas: string[];
  variations: AdVariation[];
  connection_psychology: string;
  recommended_format: string;
  generatedImageUrl?: string;
}

export interface AdCopies {
  top_of_funnel: ContentPiece[];
  middle_of_funnel: ContentPiece[];
  bottom_of_funnel: ContentPiece[];
  retention: ContentPiece[];
}

export interface RetargetingLogic {
  top_to_middle: string;
  middle_to_bottom: string;
  retention_strategy: string;
  recommended_sequence_days: string[];
}

export interface DecisionFactor {
  factor: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
  score: number;
}

export interface ChannelRecommendation {
  channel: string;
  allocation_percentage: number;
  reason: string;
}

export interface NicheTrendPoint {
  period: string;
  interest_level: number;
}

export interface FinalDecision {
  verdict: 'YES' | 'NO' | 'TEST';
  decision_reasoning: string;
  niche_potential_description: string;
  market_fit_detailed_reason: string;
  budget_breakdown_detail: string;
  optimization_requirements: string[];
  starting_budget_bdt: number;
  major_risks: string[];
  decision_factors: DecisionFactor[];
  marketing_channels: ChannelRecommendation[];
  entrepreneur_advice: string[];
  niche_trends: NicheTrendPoint[];
}

export interface SourcingInformation {
  estimated_cost_bdt: string;
  potential_suppliers: string[];
  sourcing_strategy: string;
}

export interface MarketResearchResponse {
  product_market_fit: ProductMarketFit;
  competition_analysis: CompetitionAnalysis;
  competitor_research: CompetitorResearch;
  customer_avatars: CustomerAvatar[];
  ad_copies: AdCopies;
  retargeting_funnel_logic: RetargetingLogic;
  final_decision: FinalDecision;
  sourcing_information: SourcingInformation;
}
