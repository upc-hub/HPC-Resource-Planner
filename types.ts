
export type InfrastructureType = 'HPCI' | 'mdx';

export interface ResourceOption {
  id: string;
  name: string; // e.g. "General Queue", "Vector Engine"
  limit: number; // The max quantity
  price: number; // Unit price
}

export interface MdxSystemSpec {
  totalCpuNodes: number;
  cpuNodeSpec: string;
  cpuPacksPerNode: number;
  cpuCoresPerNode: number; // Total cores per node (physical)
  cpuMemoryPerNode: number; // GB per node
  
  totalGpuNodes: number;
  gpuNodeSpec: string;
  gpuPacksPerNode: number;
  gpuCoresPerNode: number; // Total cores per node
  gpuMemoryPerNode: number; // GB per node
  gpuModelName: string; // e.g., "A100", "H200"

  storageInfo: string;
}

export interface CenterSpec {
  id: string;
  name: string;
  type: InfrastructureType;
  description: string;
  mdxSpecs?: MdxSystemSpec;
  
  // Arrays of available resources
  cpuOptions: ResourceOption[];
  gpuOptions: ResourceOption[];
  storageOptions: ResourceOption[];
}

export interface ResourceRequest {
  centerId: string;
  isSelected?: boolean; // For mdx centers to indicate active usage (flat fee)
  // Maps option.id to quantity
  cpuSelections: Record<string, number>;
  gpuSelections: Record<string, number>;
  storageSelections: Record<string, number>;
}

export interface CostBreakdown {
  centerId: string;
  cpuCost: number;
  gpuCost: number;
  storageCost: number;
  total: number;
  isOverLimit: boolean; // For HPCI 3M limit
}

export interface AiEstimateResponse {
  nodeHours: number;
  gpuHours: number;
  reasoning: string;
  confidence: 'High' | 'Medium' | 'Low';
}
