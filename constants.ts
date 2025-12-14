import { CenterSpec } from './types';

// Data derived from the user provided table.
// Resource Options are named generically (Type A, B, etc.) or descriptively where known.

export const CENTERS: CenterSpec[] = [
  // --- HPCI Centers ---
  {
    id: 'hpci-hokkaido',
    name: 'Hokkaido University',
    type: 'HPCI',
    description: 'Grand Chariot',
    url: 'https://www.iic.hokudai.ac.jp/',
    cpuOptions: [
        { id: 'hok-cpu-1', name: 'General', limit: 42000, price: 18 }
    ],
    gpuOptions: [
        { id: 'hok-gpu-1', name: 'GPU Queue', limit: 13000, price: 56 }
    ],
    storageOptions: [
        { id: 'hok-str-1', name: 'Storage', limit: 40, price: 7500 }
    ]
  },
  {
    id: 'hpci-tohoku',
    name: 'Tohoku University',
    type: 'HPCI',
    description: 'AOBA',
    url: 'https://www.cyberscience.tohoku.ac.jp/',
    cpuOptions: [
        { id: 'toh-cpu-1', name: 'Type A', limit: 40000, price: 75 },
        { id: 'toh-cpu-2', name: 'Type B', limit: 136000, price: 22 },
        { id: 'toh-cpu-3', name: 'Type C', limit: 30000, price: 100 }
    ],
    gpuOptions: [],
    storageOptions: [
        { id: 'toh-str-1', name: 'Storage A', limit: 150, price: 3000 },
        { id: 'toh-str-2', name: 'Storage B', limit: 300, price: 3000 }
    ]
  },
  {
    id: 'hpci-tokyo',
    name: 'University of Tokyo',
    type: 'HPCI',
    description: 'Wisteria/BDEC-01',
    url: 'https://www.cc.u-tokyo.ac.jp/system/wisteria/',
    cpuOptions: [
        { id: 'tok-cpu-1', name: 'Odyssey', limit: 276480, price: 10 },
        { id: 'tok-cpu-2', name: 'Miyabi-C (Xeon Max 9480)', limit: 103680, price: 28 }
    ],
    gpuOptions: [
        { id: 'tok-gpu-1', name: 'Aquarius: Shared Use', limit: 95040, price: 31 },
        { id: 'tok-gpu-2', name: 'Aquarius: Occupied Use', limit: 69120, price: 42 },
        { id: 'tok-gpu-3', name: 'Miyabi-G (GH200)', limit: 86400, price: 35 }
    ],
    storageOptions: [
        { id: 'tok-str-1', name: 'Storage A', limit: 100, price: 6480 },
        { id: 'tok-str-2', name: 'Storage B', limit: 50, price: 6480 }
    ]
  },
  {
    id: 'hpci-science-tokyo',
    name: 'Science Tokyo (Tokyo Tech)',
    type: 'HPCI',
    description: 'TSUBAME4.0',
    url: 'https://www.t3.gsic.titech.ac.jp/',
    cpuOptions: [],
    gpuOptions: [
        { id: 'st-gpu-1', name: 'GPU Node', limit: 34000, price: 275 }
    ],
    storageOptions: [
        { id: 'st-str-1', name: 'Storage', limit: 103, price: 1650 }
    ]
  },
  {
    id: 'hpci-nagoya',
    name: 'Nagoya University',
    type: 'HPCI',
    description: 'Flow',
    url: 'https://www.itc.nagoya-u.ac.jp/',
    cpuOptions: [
        { id: 'nag-cpu-1', name: 'Type I', limit: 24590, price: 122 }
    ],
    gpuOptions: [
        { id: 'nag-gpu-1', name: 'Type II (GPU)', limit: 9490, price: 316 }
    ],
    storageOptions: [
        { id: 'nag-str-1', name: 'Storage', limit: 600, price: 3500 }
    ]
  },
  {
    id: 'hpci-osaka',
    name: 'Osaka University',
    type: 'HPCI',
    description: 'SQUID',
    url: 'http://www.hpc.cmc.osaka-u.ac.jp/',
    // Prices not provided in update, retaining previous estimates for functionality
    cpuOptions: [
        { id: 'osa-cpu-1', name: 'SQUID General Purpose', limit: 114000, price: 70 },
        { id: 'osa-cpu-2', name: 'OCTOPUS General Purpose', limit: 65000, price: 70 },
        { id: 'osa-cpu-3', name: 'SQUID Vector', limit: 30000, price: 70 }
    ],
    gpuOptions: [
        { id: 'osa-gpu-1', name: 'SQUID GPU', limit: 18000, price: 220 }
    ],
    storageOptions: [
        { id: 'osa-str-1', name: 'Storage A', limit: 500, price: 12000 },
        { id: 'osa-str-2', name: 'Storage B', limit: 100, price: 12000 },
        { id: 'osa-str-3', name: 'Storage C', limit: 80, price: 12000 }
    ]
  },
  {
    id: 'hpci-kyoto',
    name: 'Kyoto University',
    type: 'HPCI',
    description: 'Camphor 3',
    url: 'http://www.iimc.kyoto-u.ac.jp/',
    cpuOptions: [
        { id: 'kyo-cpu-1', name: 'Type A', limit: 144230, price: 21 },
        { id: 'kyo-cpu-2', name: 'Type B', limit: 56074, price: 54 }
    ],
    gpuOptions: [],
    storageOptions: [
        { id: 'kyo-str-1', name: 'Storage A', limit: 1000, price: 1000 },
        { id: 'kyo-str-2', name: 'Storage B', limit: 100, price: 5000 }
    ]
  },
  {
    id: 'hpci-kyushu',
    name: 'Kyushu University',
    type: 'HPCI',
    description: 'ITO',
    url: 'https://www.riit.kyushu-u.ac.jp/',
    cpuOptions: [
        { id: 'kyu-cpu-1', name: 'Subsystem A', limit: 16000, price: 30 },
        { id: 'kyu-cpu-2', name: 'Subsystem B', limit: 4000, price: 120 }
    ],
    gpuOptions: [],
    // Storage prices not provided, retaining previous estimate
    storageOptions: [
        { id: 'kyu-str-1', name: 'Storage A', limit: 100, price: 9000 },
        { id: 'kyu-str-2', name: 'Storage B', limit: 10, price: 9000 }
    ]
  },

  // --- mdx Centers ---
  {
    id: 'mdx-tokyo',
    name: 'mdx-I (Tokyo)',
    type: 'mdx',
    description: 'Kashiwa II',
    url: 'https://mdx.jp/',
    mdxSpecs: {
      totalCpuNodes: 368,
      cpuNodeSpec: 'Xeon Platinum 8368 x2',
      cpuPacksPerNode: 152, // 1 Pack = 1 vCPU
      cpuCoresPerNode: 76, // 38 cores x 2
      cpuMemoryPerNode: 256, // 256 GB

      totalGpuNodes: 40,
      gpuNodeSpec: 'Xeon Platinum 8368 x2 + Tesla A100 x8',
      gpuPacksPerNode: 8, // 1 Pack = 1 GPU
      gpuCoresPerNode: 76,
      gpuMemoryPerNode: 512, // 512 GB
      gpuModelName: 'A100',
      
      storageInfo: 'Shared Storage: 12.3 PB'
    },
    // Prices removed (set to 0) as requested
    cpuOptions: [
        { id: 'mdx-t-cpu-1', name: 'CPU Pack (vCPU)', limit: 55936, price: 0 } // 368 * 152
    ],
    gpuOptions: [
        { id: 'mdx-t-gpu-1', name: 'GPU Pack (A100)', limit: 320, price: 0 } // 40 * 8
    ],
    storageOptions: [] // Removed as requested
  },
  {
    id: 'mdx-osaka',
    name: 'mdx-II (Osaka)',
    type: 'mdx',
    description: 'Grand Front Osaka',
    url: 'https://mdx.jp/',
    mdxSpecs: {
      totalCpuNodes: 60, // 54 Standard + 6 Interoperable
      cpuNodeSpec: 'Xeon Platinum 8480+ x2',
      cpuPacksPerNode: 224, // 1 Pack = 1 vCPU (112 cores x 2 threads = 224)
      cpuCoresPerNode: 112, // 56 cores x 2
      cpuMemoryPerNode: 512, // 512 GB

      totalGpuNodes: 7,
      gpuNodeSpec: 'Xeon Gold 6530 x2 + H200 SXM x4',
      gpuPacksPerNode: 4, // 1 Pack = 1 GPU
      gpuCoresPerNode: 64, // 32 cores x 2
      gpuMemoryPerNode: 1024, // 1 TB
      gpuModelName: 'H200',

      storageInfo: 'Lustre: 1.1 PB / Object: 432 TB'
    },
    // Prices removed (set to 0) as requested
    cpuOptions: [
        { id: 'mdx-o-cpu-1', name: 'CPU Pack (vCPU)', limit: 13440, price: 0 } // 60 * 224
    ],
    gpuOptions: [
        { id: 'mdx-o-gpu-1', name: 'GPU Pack (H200)', limit: 28, price: 0 } // 7 * 4
    ],
    storageOptions: [] // Removed as requested
  },
];

export const HPCI_SINGLE_CENTER_LIMIT = 3000000; // 3M JPY
export const HPCI_TOTAL_LIMIT = 3600000; // 3.6M JPY
export const MDX_TOTAL_LIMIT = 1000000; // 1M JPY (Shared between mdx-I and mdx-II)
