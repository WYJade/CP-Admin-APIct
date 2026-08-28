// ── 枚举类型 ──────────────────────────────────────────────
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type Channel = 'PORTAL' | 'EXTERNAL' | 'ONTOLOGY' | 'AGENT'
export type RiskLevel = 'L1' | 'L2' | 'L3' | 'L4'
export type AiMode = 'READ_ONLY' | 'CONFIRM' | 'DENY'
export type LifecycleStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'RETIRED'
export type DataDimension = 'TENANT' | 'CUSTOMER' | 'FACILITY'
export type CredentialType = 'API_KEY' | 'OAUTH2' | 'MTLS'
export type ProfileType = 'AGENT' | 'ONTOLOGY'
export type CallerType = 'PORTAL_USER' | 'EXTERNAL_APP' | 'AI_AGENT'
export type DecisionResult = 'ALLOW' | 'DENY'
export type StepResult = 'PASS' | 'FAIL' | 'SKIP'

// ── API Catalog ───────────────────────────────────────────
export interface ApiEntry {
  id: string
  apiAction: string
  method: HttpMethod
  path: string
  businessDomain: string
  requiredBusinessPermissions: string[]
  allowedChannels: Channel[]
  riskLevel: RiskLevel
  dataDimensions: DataDimension[]
  aiMode: AiMode
  owner: string
  lifecycle: LifecycleStatus
  policyVersion: string
  createdAt: string
  updatedAt: string
}

// ── Business Permission Mapping ───────────────────────────
export interface BusinessPermission {
  id: string
  key: string
  displayName: string
  description: string
}

export interface BusinessMapping {
  id: string
  businessPermissionKey: string
  apiAction: string
  createdAt: string
}

// ── Integration ───────────────────────────────────────────
export interface ExternalApp {
  id: string
  name: string
  servicePrincipalId: string
  status: 'ACTIVE' | 'INACTIVE'
  description: string
  createdAt: string
  updatedAt: string
}

export interface ProfileActionOverride {
  apiAction: string
  dataDimensionOverride: DataDimension[] | null
}

export interface IntegrationProfile {
  id: string
  appId: string
  name: string
  description: string
  actions: ProfileActionOverride[]
  dataScope: DataDimension[]
  credentialType: CredentialType
  qpsLimit: number
  dailyQuota: number
  status: 'ACTIVE' | 'INACTIVE'
  version: string
  createdAt: string
  updatedAt: string
  last7DayCalls: number
  successRate: number
}

// ── AI Capability ─────────────────────────────────────────
export interface RiskConfirmPolicy {
  minRiskLevel: 'L2' | 'L3' | 'L4'
  timeoutMinutes: number
  timeoutAction: 'AUTO_DENY' | 'AUTO_APPROVE'
}

export interface ToolActionBinding {
  toolName: string
  apiActions: string[]
  aiModeOverride: AiMode | null
  confirmPolicy: RiskConfirmPolicy | null
}

export interface AiCapabilityProfile {
  id: string
  name: string
  profileType: ProfileType
  description: string
  defaultAiMode: AiMode
  tools: ToolActionBinding[]
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

// ── AuthZ Simulator ───────────────────────────────────────
export interface SimulatorInput {
  callerType: CallerType
  callerId: string
  apiAction: string
  tenant: string
  customers: string[]
  facilities: string[]
}

export interface DecisionStep {
  stepId: string
  stepName: string
  result: StepResult
  evidence: string
  description: string
  fixSuggestion?: string
}

export interface SimulatorResult {
  id: string
  input: SimulatorInput
  steps: DecisionStep[]
  finalDecision: DecisionResult
  policyVersion: string
  simulatedAt: string
}

// ── Audit ─────────────────────────────────────────────────
export interface AuditLog {
  id: string
  timestamp: string
  callerType: CallerType
  callerId: string
  apiAction: string
  tenant: string
  customer: string
  facility: string
  decision: DecisionResult
  errorCode?: string
  durationMs: number
}

export interface ApiDependencyConsumer {
  profileId: string
  profileName: string
  profileType: 'INTEGRATION' | 'AI'
  last7DayCalls: number
  lastCalledAt: string
}

export interface ApiDependency {
  apiAction: string
  consumers: ApiDependencyConsumer[]
}

// ── 表单相关辅助类型 ──────────────────────────────────────
export type ApiEntryForm = Omit<ApiEntry, 'id' | 'policyVersion' | 'createdAt' | 'updatedAt'>
export type IntegrationProfileForm = Omit<IntegrationProfile, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'last7DayCalls' | 'successRate'>
export type AiCapabilityProfileForm = Omit<AiCapabilityProfile, 'id' | 'createdAt' | 'updatedAt'>
