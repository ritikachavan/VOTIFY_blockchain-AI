// =============================================================================
// Votify – Election Mock Data (100% static / deterministic – zero PRNG)
// =============================================================================

// Fixed base timestamp (2026-02-16 10:00 UTC) – no Date.now()
const BASE_TS = Date.UTC(2026, 1, 16, 10, 0, 0)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type BoothStatus = "online" | "offline" | "delayed"
export type RiskLevel = "low" | "medium" | "high"
export type AlertSeverity = "low" | "medium" | "high" | "critical"
export type AlertType = "anomaly" | "hardware" | "fraud" | "sync" | "integrity"

export interface Booth {
  id: string
  name: string
  region: string
  state: string
  district: string
  status: BoothStatus
  lastSync: string
  totalVotes: number
  expectedVotes: number
  riskLevel: RiskLevel
  latitude: number
  longitude: number
  officerName: string
  officerContact: string
}

export interface Candidate {
  id: string; name: string; party: string; partyColor: string; votes: number; percentage: number
}
export interface HourlyVote { hour: string; votes: number; cumulative: number }
export interface Alert {
  id: string; type: AlertType; severity: AlertSeverity; boothId: string; boothName: string
  region: string; timestamp: string; title: string; description: string; resolved: boolean; aiConfidence?: number
}
export interface LedgerRecord {
  id: string; hash: string; prevHash: string; boothId: string; boothName: string
  timestamp: string; voteCount: number; dataHash: string; verified: boolean; blockNumber: number
}
export interface RegionStats {
  name: string; state: string; totalBooths: number; activeBooths: number
  totalVotes: number; expectedVotes: number; turnoutPercentage: number
  leadingCandidate: string; leadingParty: string
}
export interface BoothLog {
  id: string; timestamp: string; action: string; details: string; type: "vote" | "sync" | "alert" | "system"
}

// ---------------------------------------------------------------------------
// States & Regions (static)
// ---------------------------------------------------------------------------
const states = [
  "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat",
]

const regions: Record<string, string[]> = {
  Maharashtra: ["Mumbai North", "Mumbai South", "Pune", "Nagpur", "Nashik"],
  Karnataka: ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangalore", "Hubli"],
  "Tamil Nadu": ["Chennai North", "Chennai South", "Coimbatore", "Madurai", "Salem"],
  "Uttar Pradesh": ["Lucknow", "Varanasi", "Noida", "Agra", "Kanpur"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
}

// ---------------------------------------------------------------------------
// Candidates (static)
// ---------------------------------------------------------------------------
export const candidates: Candidate[] = [
  { id: "c1", name: "Arvind Sharma", party: "National Democratic Alliance", partyColor: "hsl(217, 91%, 60%)", votes: 1248760, percentage: 34.2 },
  { id: "c2", name: "Priya Mehta", party: "United Progressive Front", partyColor: "hsl(160, 84%, 39%)", votes: 1102340, percentage: 30.2 },
  { id: "c3", name: "Rajesh Kumar", party: "People's Reform Party", partyColor: "hsl(38, 92%, 50%)", votes: 724560, percentage: 19.8 },
  { id: "c4", name: "Sunita Desai", party: "Independent Alliance", partyColor: "hsl(340, 75%, 55%)", votes: 389120, percentage: 10.7 },
  { id: "c5", name: "Others", party: "Various", partyColor: "hsl(215, 16%, 47%)", votes: 186430, percentage: 5.1 },
]

// ---------------------------------------------------------------------------
// Booths – FULLY STATIC: each booth is a pre-computed seed row.
// 3 booths per region * 25 regions = 75 booths, deterministic.
// ---------------------------------------------------------------------------

// Pre-computed per-booth seeds: [status, riskLevel, totalVotes, expectedVotes, minutesAgo, lat, lng]
// status: 0=online 1=delayed 2=offline | risk: 0=low 1=medium 2=high
const boothSeeds: [number, number, number, number, number, number, number][] = [
  // Maharashtra – Mumbai North (3)
  [0,0,1842,2500,2,19.12,72.85],[0,0,1654,2300,1,19.08,72.91],[0,1,920,2100,18,19.15,72.88],
  // Maharashtra – Mumbai South (3)
  [0,0,1756,2400,0,18.93,72.83],[1,1,1230,2600,22,18.96,72.80],[0,0,1580,2200,3,18.91,72.82],
  // Maharashtra – Pune (3)
  [0,0,1920,2700,1,18.52,73.86],[0,0,1380,2100,4,18.55,73.80],[2,2,450,2000,95,18.48,73.83],
  // Maharashtra – Nagpur (3)
  [0,0,1710,2300,2,21.15,79.09],[0,0,1550,2500,0,21.12,79.12],[0,1,1100,2400,16,21.18,79.06],
  // Maharashtra – Nashik (3)
  [0,0,1480,2200,3,20.00,73.79],[0,0,1320,2100,1,19.97,73.82],[1,1,980,2300,28,20.03,73.76],
  // Karnataka – Bengaluru Urban (3)
  [0,0,1890,2600,1,12.97,77.59],[0,0,1670,2400,2,12.93,77.63],[0,0,1440,2200,0,12.99,77.56],
  // Karnataka – Bengaluru Rural (3)
  [0,0,1350,2100,4,13.15,77.45],[1,1,1020,2300,25,13.18,77.42],[0,0,1560,2500,2,13.12,77.48],
  // Karnataka – Mysuru (3)
  [0,0,1680,2400,1,12.30,76.65],[0,0,1420,2200,3,12.33,76.62],[0,1,950,2100,20,12.27,76.68],
  // Karnataka – Mangalore (3)
  [0,0,1530,2300,2,12.87,74.88],[0,0,1740,2600,0,12.90,74.85],[2,2,380,2000,110,12.84,74.91],
  // Karnataka – Hubli (3)
  [0,0,1610,2400,1,15.36,75.12],[0,0,1290,2100,3,15.39,75.09],[0,1,1080,2300,17,15.33,75.15],
  // Tamil Nadu – Chennai North (3)
  [0,0,1820,2500,0,13.12,80.29],[0,0,1560,2300,2,13.15,80.26],[0,0,1380,2100,1,13.09,80.32],
  // Tamil Nadu – Chennai South (3)
  [0,0,1950,2700,1,12.90,80.22],[0,1,1210,2400,19,12.93,80.19],[0,0,1630,2200,3,12.87,80.25],
  // Tamil Nadu – Coimbatore (3)
  [0,0,1470,2200,2,11.02,76.96],[0,0,1350,2100,0,10.99,76.99],[1,1,870,2300,30,11.05,76.93],
  // Tamil Nadu – Madurai (3)
  [0,0,1720,2500,1,9.92,78.12],[0,0,1540,2300,4,9.95,78.09],[0,0,1310,2100,2,9.89,78.15],
  // Tamil Nadu – Salem (3)
  [0,0,1580,2400,0,11.66,78.15],[0,0,1430,2200,3,11.69,78.12],[0,1,1060,2300,21,11.63,78.18],
  // Uttar Pradesh – Lucknow (3)
  [0,0,1860,2600,1,26.85,80.95],[0,0,1620,2400,2,26.88,80.92],[0,0,1410,2100,0,26.82,80.98],
  // Uttar Pradesh – Varanasi (3)
  [0,0,1750,2500,3,25.32,83.00],[1,1,1180,2300,24,25.35,82.97],[0,0,1530,2200,1,25.29,83.03],
  // Uttar Pradesh – Noida (3)
  [0,0,1920,2700,0,28.57,77.32],[0,0,1680,2400,2,28.60,77.29],[0,2,890,2100,15,28.54,77.35],
  // Uttar Pradesh – Agra (3)
  [0,0,1590,2300,1,27.18,78.02],[0,0,1340,2100,4,27.21,77.99],[1,1,1070,2400,26,27.15,78.05],
  // Uttar Pradesh – Kanpur (3)
  [0,0,1810,2600,2,26.45,80.35],[0,0,1520,2200,0,26.48,80.32],[0,0,1370,2300,3,26.42,80.38],
  // Gujarat – Ahmedabad (3)
  [0,0,1870,2500,1,23.02,72.57],[0,0,1640,2400,3,23.05,72.54],[0,1,1150,2200,18,22.99,72.60],
  // Gujarat – Surat (3)
  [0,0,1760,2600,0,21.17,72.83],[0,0,1490,2300,2,21.20,72.80],[0,0,1320,2100,1,21.14,72.86],
  // Gujarat – Vadodara (3)
  [0,0,1680,2400,4,22.31,73.19],[1,1,1230,2200,22,22.34,73.16],[0,0,1550,2500,2,22.28,73.22],
  // Gujarat – Rajkot (3)
  [0,0,1610,2300,1,22.30,70.80],[0,0,1440,2100,0,22.33,70.77],[0,0,1280,2200,3,22.27,70.83],
  // Gujarat – Gandhinagar (3)
  [0,0,1930,2700,2,23.22,72.64],[0,0,1710,2500,1,23.25,72.61],[2,2,520,2000,85,23.19,72.67],
]

const statusMap: BoothStatus[] = ["online", "delayed", "offline"]
const riskMap: RiskLevel[] = ["low", "medium", "high"]

function buildBooths(): Booth[] {
  const result: Booth[] = []
  let idx = 0
  for (const state of states) {
    for (const region of regions[state]) {
      for (let i = 0; i < 3; i++) {
        const s = boothSeeds[idx]
        const status = statusMap[s[0]]
        const syncDate = new Date(BASE_TS - s[4] * 60 * 1000)
        const boothNum = idx + 1
        result.push({
          id: `BTH-${String(boothNum).padStart(4, "0")}`,
          name: `${region} Booth ${i + 1}`,
          region,
          state,
          district: region,
          status,
          lastSync: syncDate.toISOString(),
          totalVotes: s[2],
          expectedVotes: s[3],
          riskLevel: riskMap[s[1]],
          latitude: s[5],
          longitude: s[6],
          officerName: `Officer ${boothNum}`,
          officerContact: `+91 98765 ${String(10000 + boothNum).slice(1)}`,
        })
        idx++
      }
    }
  }
  return result
}

export const booths: Booth[] = buildBooths()

// ---------------------------------------------------------------------------
// Hourly Vote Trend – static base values with simple deterministic noise
// ---------------------------------------------------------------------------
export const hourlyVoteTrend: HourlyVote[] = (() => {
  const data: [string, number][] = [
    ["07:00", 43200], ["08:00", 118500], ["09:00", 276800], ["10:00", 378400],
    ["11:00", 418200], ["12:00", 308600], ["13:00", 248300], ["14:00", 338100],
    ["15:00", 376500], ["16:00", 348900], ["17:00", 287400], ["18:00", 178200],
  ]
  let cumulative = 0
  return data.map(([hour, votes]) => {
    cumulative += votes
    return { hour, votes, cumulative }
  })
})()

// ---------------------------------------------------------------------------
// Alerts – fully static
// ---------------------------------------------------------------------------
export const alerts: Alert[] = [
  {
    id: "ALT-001", type: "fraud", severity: "critical", boothId: "BTH-0007",
    boothName: "Pune Booth 1", region: "Pune",
    timestamp: new Date(BASE_TS - 8 * 60 * 1000).toISOString(),
    title: "Unusual Vote Spike Detected",
    description: "AI detected 340% vote increase in 15-min window. Pattern consistent with ballot stuffing. Immediate review recommended.",
    resolved: false, aiConfidence: 94.2,
  },
  {
    id: "ALT-002", type: "hardware", severity: "high", boothId: "BTH-0051",
    boothName: "Varanasi Booth 3", region: "Varanasi",
    timestamp: new Date(BASE_TS - 22 * 60 * 1000).toISOString(),
    title: "EVM Communication Lost",
    description: "Electronic Voting Machine has not responded for 18 minutes. Hardware failure or tampering suspected.",
    resolved: false,
  },
  {
    id: "ALT-003", type: "anomaly", severity: "high", boothId: "BTH-0031",
    boothName: "Chennai North Booth 1", region: "Chennai North",
    timestamp: new Date(BASE_TS - 35 * 60 * 1000).toISOString(),
    title: "Statistical Deviation in Vote Pattern",
    description: "Vote distribution deviates 3.2 std deviations from regional average. Benford's Law analysis flagged anomaly.",
    resolved: false, aiConfidence: 87.1,
  },
  {
    id: "ALT-004", type: "sync", severity: "medium", boothId: "BTH-0061",
    boothName: "Ahmedabad Booth 1", region: "Ahmedabad",
    timestamp: new Date(BASE_TS - 45 * 60 * 1000).toISOString(),
    title: "Data Sync Delay",
    description: "Booth data synchronization delayed by 42 minutes. Network connectivity intermittent.",
    resolved: false,
  },
  {
    id: "ALT-005", type: "integrity", severity: "medium", boothId: "BTH-0024",
    boothName: "Mysuru Booth 3", region: "Mysuru",
    timestamp: new Date(BASE_TS - 62 * 60 * 1000).toISOString(),
    title: "Hash Chain Inconsistency",
    description: "Ledger record hash does not match expected chain. Data re-verification in progress.",
    resolved: false,
  },
  {
    id: "ALT-006", type: "anomaly", severity: "low", boothId: "BTH-0037",
    boothName: "Coimbatore Booth 1", region: "Coimbatore",
    timestamp: new Date(BASE_TS - 90 * 60 * 1000).toISOString(),
    title: "Minor Turnout Fluctuation",
    description: "Slight above-average turnout detected in early morning hours. Within acceptable threshold.",
    resolved: true, aiConfidence: 42.5,
  },
  {
    id: "ALT-007", type: "hardware", severity: "low", boothId: "BTH-0066",
    boothName: "Surat Booth 3", region: "Surat",
    timestamp: new Date(BASE_TS - 120 * 60 * 1000).toISOString(),
    title: "Printer Malfunction",
    description: "VVPAT printer reported paper jam. Resolved by on-site engineer.",
    resolved: true,
  },
  {
    id: "ALT-008", type: "fraud", severity: "high", boothId: "BTH-0055",
    boothName: "Noida Booth 1", region: "Noida",
    timestamp: new Date(BASE_TS - 15 * 60 * 1000).toISOString(),
    title: "Duplicate Voter ID Attempt",
    description: "Multiple voting attempts detected using the same voter ID within 10-minute window. Biometric mismatch flagged.",
    resolved: false, aiConfidence: 91.8,
  },
  {
    id: "ALT-009", type: "sync", severity: "medium", boothId: "BTH-0046",
    boothName: "Lucknow Booth 1", region: "Lucknow",
    timestamp: new Date(BASE_TS - 55 * 60 * 1000).toISOString(),
    title: "Intermittent Connectivity",
    description: "Booth experiencing periodic network drops. Data batching enabled for resilience.",
    resolved: false,
  },
  {
    id: "ALT-010", type: "integrity", severity: "critical", boothId: "BTH-0034",
    boothName: "Chennai South Booth 1", region: "Chennai South",
    timestamp: new Date(BASE_TS - 5 * 60 * 1000).toISOString(),
    title: "Ledger Tampering Suspected",
    description: "Multiple consecutive hash chain breaks detected. Possible data manipulation. Forensic audit initiated.",
    resolved: false, aiConfidence: 96.7,
  },
]

// ---------------------------------------------------------------------------
// Ledger Records – deterministic hash from index, no PRNG
// ---------------------------------------------------------------------------
function makeHash(seed: number): string {
  const hex = "0123456789abcdef"
  let h = ""
  let v = seed * 2654435761
  for (let i = 0; i < 64; i++) {
    v = ((v * 16807) + 12345) & 0x7fffffff
    h += hex[v % 16]
  }
  return h
}

export const ledgerRecords: LedgerRecord[] = (() => {
  const records: LedgerRecord[] = []
  let prevHash = "0000000000000000000000000000000000000000000000000000000000000000"
  const voteCounts = [18,24,31,15,27,22,19,33,26,14,29,21,16,30,25,20,28,17,23,32,18,26,14,31,22,19,27,33,15,24,20,29,16,28,23,17,30,21,25,34]

  for (let i = 0; i < 40; i++) {
    const booth = booths[i % booths.length]
    const ts = new Date(BASE_TS - (40 - i) * 3 * 60 * 1000)
    const hash = makeHash(i + 1)
    const dataHash = makeHash(i + 1001)
    // Records 7 and 23 are unverified for variety
    const verified = i !== 7 && i !== 23

    records.push({
      id: `REC-${String(i + 1).padStart(5, "0")}`,
      hash, prevHash,
      boothId: booth.id, boothName: booth.name,
      timestamp: ts.toISOString(),
      voteCount: voteCounts[i],
      dataHash, verified,
      blockNumber: i + 1,
    })
    prevHash = hash
  }
  return records
})()

// ---------------------------------------------------------------------------
// Region Stats – derived from booths, purely deterministic
// ---------------------------------------------------------------------------
export const regionStats: RegionStats[] = (() => {
  let idx = 0
  return states.flatMap((state) =>
    regions[state].map((region) => {
      const rb = booths.filter((b) => b.region === region)
      const tv = rb.reduce((s, b) => s + b.totalVotes, 0)
      const ev = rb.reduce((s, b) => s + b.expectedVotes, 0)
      const cIdx = idx % 3
      idx++
      return {
        name: region, state,
        totalBooths: rb.length,
        activeBooths: rb.filter((b) => b.status === "online").length,
        totalVotes: tv, expectedVotes: ev,
        turnoutPercentage: Math.round((tv / ev) * 100),
        leadingCandidate: candidates[cIdx].name,
        leadingParty: candidates[cIdx].party,
      }
    })
  )
})()

// ---------------------------------------------------------------------------
// Booth Logs – deterministic from boothId (no PRNG)
// ---------------------------------------------------------------------------
export function generateBoothLogs(boothId: string): BoothLog[] {
  const logs: BoothLog[] = []
  const types: BoothLog["type"][] = ["vote", "sync", "system", "vote", "vote", "sync"]
  const actions: Record<string, string[]> = {
    vote: ["Batch recorded", "Vote verified", "VVPAT confirmed"],
    sync: ["Data synced to server", "Acknowledgment received", "Checkpoint created"],
    alert: ["Anomaly flagged", "Alert generated"],
    system: ["Health check passed", "Integrity verified", "Connection stable"],
  }
  const seed = parseInt(boothId.replace(/\D/g, ""), 10) || 1

  for (let i = 0; i < 25; i++) {
    const ts = new Date(BASE_TS - (25 - i) * 7 * 60 * 1000)
    const type = types[i % types.length]
    const actionList = actions[type]
    const action = actionList[(seed + i) % actionList.length]
    logs.push({
      id: `LOG-${boothId}-${String(i + 1).padStart(3, "0")}`,
      timestamp: ts.toISOString(),
      action,
      details: `${action} for booth ${boothId} at ${ts.toISOString().slice(11, 19)}`,
      type,
    })
  }
  return logs
}

// ---------------------------------------------------------------------------
// Booth Hourly Votes – deterministic from boothId
// ---------------------------------------------------------------------------
export function generateBoothHourlyVotes(boothId: string): HourlyVote[] {
  const hours = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
  const base = [20,65,140,190,210,155,125,170,190,175,145,90]
  const seed = parseInt(boothId.replace(/\D/g, ""), 10) || 1
  let cumulative = 0

  return hours.map((hour, i) => {
    const votes = Math.max(base[i] + ((seed * (i + 1) * 7) % 60) - 30, 10)
    cumulative += votes
    return { hour, votes, cumulative }
  })
}

// ---------------------------------------------------------------------------
// KPI Stats – derived, fully deterministic
// ---------------------------------------------------------------------------
export const kpiStats = {
  totalVotes: candidates.reduce((s, c) => s + c.votes, 0),
  activeBooths: booths.filter((b) => b.status === "online").length,
  totalBooths: booths.length,
  alertsCount: alerts.filter((a) => !a.resolved).length,
  criticalAlerts: alerts.filter((a) => a.severity === "critical" && !a.resolved).length,
  turnoutPercentage: Math.round(
    (candidates.reduce((s, c) => s + c.votes, 0) /
      booths.reduce((s, b) => s + b.expectedVotes, 0)) * 100
  ),
  verifiedRecords: ledgerRecords.filter((r) => r.verified).length,
  totalRecords: ledgerRecords.length,
}

// ---------------------------------------------------------------------------
// Voter Activity – deterministic from booth index math (no PRNG)
// ---------------------------------------------------------------------------
export type GeofenceStatus = "inside" | "outside"
export type VoterFlag = "duplicate" | "outside_geofence" | "rapid_entry" | null

export interface VoterActivity {
  id: string; voterId: string; boothId: string; boothName: string
  timestamp: string; imageUrl: string; latitude: number; longitude: number
  geofenceStatus: GeofenceStatus; flag: VoterFlag; verified: boolean
}

function buildVoterActivities(): VoterActivity[] {
  const entries: VoterActivity[] = []
  const targetBooths = booths.slice(0, 8)
  let entryNum = 1

  // static suffixes so voter IDs are deterministic
  const suffixes = [
    1234,5678,9012,3456,7890,2345,6789,1357,2468,8024,
    1593,7531,9517,3571,8642,4826,6204,2048,4680,8260,
  ]

  for (let bIdx = 0; bIdx < targetBooths.length; bIdx++) {
    const booth = targetBooths[bIdx]
    const count = 14 + (bIdx % 3) // 14, 15, or 16 per booth – deterministic

    for (let i = 0; i < count; i++) {
      const minutesAgo = (bIdx * 17 + i * 23 + 5) % 360
      const ts = new Date(BASE_TS - minutesAgo * 60 * 1000)
      const suffix = suffixes[(bIdx * count + i) % suffixes.length]
      const voterId = `****${suffix}`

      let flag: VoterFlag = null
      let geofenceStatus: GeofenceStatus = "inside"

      // deterministic flagging: every 25th entry = duplicate, every 19th = outside_geofence, every 31st = rapid_entry
      const globalIdx = entryNum
      if (globalIdx % 25 === 0) {
        flag = "duplicate"
      } else if (globalIdx % 19 === 0) {
        flag = "outside_geofence"
        geofenceStatus = "outside"
      } else if (globalIdx % 31 === 0) {
        flag = "rapid_entry"
      }

      entries.push({
        id: `VA-${String(entryNum).padStart(5, "0")}`,
        voterId, boothId: booth.id, boothName: booth.name,
        timestamp: ts.toISOString(),
        imageUrl: `/api/placeholder/${60 + (i % 4)}`,
        latitude: booth.latitude + ((i % 5) - 2) * 0.002,
        longitude: booth.longitude + ((i % 7) - 3) * 0.002,
        geofenceStatus, flag,
        verified: flag === null,
      })
      entryNum++
    }
  }

  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return entries
}

export const voterActivities: VoterActivity[] = buildVoterActivities()

export const activityBooths = [...new Set(voterActivities.map((v) => v.boothId))].map(
  (id) => booths.find((b) => b.id === id)!
)

// ---------------------------------------------------------------------------
// State-level stats – derived from booths
// ---------------------------------------------------------------------------
export const stateStats = states.map((state) => {
  const sb = booths.filter((b) => b.state === state)
  const tv = sb.reduce((s, b) => s + b.totalVotes, 0)
  const ev = sb.reduce((s, b) => s + b.expectedVotes, 0)
  return {
    name: state,
    totalBooths: sb.length,
    activeBooths: sb.filter((b) => b.status === "online").length,
    totalVotes: tv, expectedVotes: ev,
    turnoutPercentage: Math.round((tv / ev) * 100),
    highRiskBooths: sb.filter((b) => b.riskLevel === "high").length,
    districts: regions[state],
  }
})

// ---------------------------------------------------------------------------
// Full Voter Registry (for Voter Lookup page) – deterministic
// ---------------------------------------------------------------------------
export interface RegisteredVoter {
  id: string
  voterId: string
  name: string
  age: number
  gender: "Male" | "Female"
  address: string
  constituency: string
  boothId: string
  boothName: string
  state: string
  district: string
  hasVoted: boolean
  voteTimestamp: string | null
  serialNumber: number
  fatherOrHusbandName: string
  epicNumber: string
}

const maleFirstNames = ["Amit","Rahul","Vikram","Suresh","Mohan","Rakesh","Arun","Vijay","Sanjay","Ramesh","Deepak","Manoj","Kiran","Arjun","Nikhil","Ravi","Ajay","Sachin","Gaurav","Rohit"]
const femaleFirstNames = ["Priya","Sunita","Anita","Kavita","Deepa","Meera","Geeta","Nandini","Pooja","Lakshmi","Sneha","Anjali","Rekha","Seema","Neha","Swati","Divya","Sapna","Renu","Aarti"]
const registryLastNames = ["Sharma","Patel","Singh","Kumar","Desai","Mehta","Reddy","Nair","Gupta","Joshi","Iyer","Rao","Malhotra","Chauhan","Das","Pillai","Verma","Yadav","Bhat","Kulkarni","Chopra","Banerjee","Mishra","Saxena","Thakur"]
const streets = ["MG Road","Gandhi Nagar","Station Road","Temple Street","Market Lane","Lake View","Park Avenue","Hill Colony","River Side","Old Town","New Colony","Phase 1","Sector 4","Block B","Ward 12"]

function buildVoterRegistry(): RegisteredVoter[] {
  const voters: RegisteredVoter[] = []
  let serial = 1

  for (let bIdx = 0; bIdx < booths.length; bIdx++) {
    const booth = booths[bIdx]
    // 20 voters per booth for demonstration (1500 total across 75 booths)
    const voterCount = 20
    const votedCount = Math.round(voterCount * (booth.totalVotes / booth.expectedVotes))

    for (let i = 0; i < voterCount; i++) {
      const isMale = (bIdx + i) % 3 !== 0 // ~2/3 male
      const fnIdx = isMale
        ? (bIdx * 7 + i * 3) % maleFirstNames.length
        : (bIdx * 5 + i * 4) % femaleFirstNames.length
      const lnIdx = (bIdx * 11 + i * 7) % registryLastNames.length
      const fatherLnIdx = (bIdx * 13 + i * 9) % registryLastNames.length
      const fatherFnIdx = (bIdx * 3 + i * 11) % maleFirstNames.length
      const streetIdx = (bIdx * 4 + i * 6) % streets.length
      const houseNum = 10 + ((bIdx * 17 + i * 29) % 490)
      const age = 21 + ((bIdx * 3 + i * 7) % 55)
      const hasVoted = i < votedCount
      const minutesBefore = hasVoted ? 10 + ((i * 17 + bIdx * 3) % 340) : 0
      const voteTimestamp = hasVoted ? new Date(BASE_TS - minutesBefore * 60 * 1000).toISOString() : null

      const firstName = isMale ? maleFirstNames[fnIdx] : femaleFirstNames[fnIdx]
      const lastName = registryLastNames[lnIdx]
      const epicSuffix = String(10000000 + serial * 7919).slice(-7)

      voters.push({
        id: `REG-${String(serial).padStart(5, "0")}`,
        voterId: `IND/${booth.state.slice(0, 3).toUpperCase()}/${epicSuffix}`,
        name: `${firstName} ${lastName}`,
        age,
        gender: isMale ? "Male" : "Female",
        address: `${houseNum}, ${streets[streetIdx]}, ${booth.district}`,
        constituency: booth.region,
        boothId: booth.id,
        boothName: booth.name,
        state: booth.state,
        district: booth.district,
        hasVoted,
        voteTimestamp,
        serialNumber: serial,
        fatherOrHusbandName: `${maleFirstNames[fatherFnIdx]} ${registryLastNames[fatherLnIdx]}`,
        epicNumber: `${booth.state.slice(0, 3).toUpperCase()}${epicSuffix}`,
      })
      serial++
    }
  }
  return voters
}

export const voterRegistry: RegisteredVoter[] = buildVoterRegistry()

// ---------------------------------------------------------------------------
// Assigned Voters (for Booth Locator) – deterministic from booth index
// ---------------------------------------------------------------------------
export interface AssignedVoter {
  id: string; name: string; maskedId: string; hasVoted: boolean; voteTime: string | null; boothId: string
}

const firstNames = ["Amit","Priya","Rahul","Sunita","Vikram","Anita","Suresh","Kavita","Mohan","Deepa","Rakesh","Meera","Arun","Geeta","Vijay","Nandini","Sanjay","Pooja","Ramesh","Lakshmi"]
const lastNames = ["Sharma","Patel","Singh","Kumar","Desai","Mehta","Reddy","Nair","Gupta","Joshi","Iyer","Rao","Malhotra","Chauhan","Das","Pillai","Verma","Yadav","Bhat","Kulkarni"]

// ---------------------------------------------------------------------------
// EVM Audit Trail – deterministic hardware diagnostics
// ---------------------------------------------------------------------------
export type EvmStatus = "operational" | "warning" | "faulty" | "replaced"

export interface EvmDevice {
  id: string
  serialNumber: string
  boothId: string
  boothName: string
  state: string
  model: string
  firmwareVersion: string
  status: EvmStatus
  batteryLevel: number
  temperature: number
  totalVotesRecorded: number
  lastCalibration: string
  sealIntact: boolean
  vvpatSynced: boolean
  uptimeMinutes: number
}

export interface EvmAuditEvent {
  id: string
  evmId: string
  timestamp: string
  event: string
  severity: "info" | "warning" | "error"
  details: string
}

function buildEvmDevices(): EvmDevice[] {
  const models = ["BEL M3", "ECIL Mark II", "BEL M3+", "ECIL Mark III"]
  const firmwares = ["v4.2.1", "v4.3.0", "v4.1.8", "v4.3.2"]
  const devices: EvmDevice[] = []

  for (let i = 0; i < booths.length; i++) {
    const booth = booths[i]
    const statusIdx = booth.status === "offline" ? 2 : booth.riskLevel === "high" ? 1 : booth.riskLevel === "medium" ? (i % 5 === 0 ? 1 : 0) : 0
    const evmStatuses: EvmStatus[] = ["operational", "warning", "faulty", "replaced"]
    const battery = booth.status === "offline" ? 8 + (i % 12) : 45 + ((i * 7) % 55)
    const temp = 28 + ((i * 3) % 18)

    devices.push({
      id: `EVM-${String(i + 1).padStart(4, "0")}`,
      serialNumber: `SN${String(200000 + i * 1031).slice(-6)}`,
      boothId: booth.id,
      boothName: booth.name,
      state: booth.state,
      model: models[i % models.length],
      firmwareVersion: firmwares[i % firmwares.length],
      status: evmStatuses[statusIdx],
      batteryLevel: battery,
      temperature: temp,
      totalVotesRecorded: booth.totalVotes,
      lastCalibration: new Date(BASE_TS - (24 + (i % 48)) * 60 * 60 * 1000).toISOString(),
      sealIntact: statusIdx < 2,
      vvpatSynced: statusIdx === 0,
      uptimeMinutes: 180 + ((i * 13) % 420),
    })
  }
  return devices
}

export const evmDevices: EvmDevice[] = buildEvmDevices()

function buildEvmAuditEvents(): EvmAuditEvent[] {
  const events: EvmAuditEvent[] = []
  const infoEvents = ["System health check passed", "Vote batch recorded", "Data synced to server", "Seal integrity verified", "VVPAT slip printed"]
  const warnEvents = ["Battery below 30%", "Temperature above 40C", "Sync delayed by 5+ minutes", "Firmware update available"]
  const errorEvents = ["Communication lost", "VVPAT mismatch detected", "Tamper alert triggered", "Calibration drift detected"]
  let idx = 1

  for (let d = 0; d < Math.min(evmDevices.length, 20); d++) {
    const dev = evmDevices[d]
    const eventCount = 6 + (d % 4)
    for (let e = 0; e < eventCount; e++) {
      const minutesAgo = (d * 11 + e * 19 + 3) % 300
      const isWarn = dev.status === "warning" && e < 2
      const isError = dev.status === "faulty" && e === 0
      const severity: "info" | "warning" | "error" = isError ? "error" : isWarn ? "warning" : "info"
      const eventList = severity === "error" ? errorEvents : severity === "warning" ? warnEvents : infoEvents
      const event = eventList[(d + e) % eventList.length]

      events.push({
        id: `AUD-${String(idx).padStart(5, "0")}`,
        evmId: dev.id,
        timestamp: new Date(BASE_TS - minutesAgo * 60 * 1000).toISOString(),
        event,
        severity,
        details: `${event} on ${dev.id} (${dev.serialNumber}) at ${dev.boothName}`,
      })
      idx++
    }
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return events
}

export const evmAuditEvents: EvmAuditEvent[] = buildEvmAuditEvents()

// ---------------------------------------------------------------------------
// Election Analytics – vote velocity, candidate race tracker
// ---------------------------------------------------------------------------
export interface VoteVelocity {
  hour: string
  velocity: number     // votes per minute
  acceleration: number // change vs previous
}

export const voteVelocity: VoteVelocity[] = (() => {
  const raw: [string, number][] = [
    ["07:00", 720], ["08:00", 1975], ["09:00", 4613], ["10:00", 6307],
    ["11:00", 6970], ["12:00", 5143], ["13:00", 4138], ["14:00", 5635],
    ["15:00", 6275], ["16:00", 5815], ["17:00", 4790], ["18:00", 2970],
  ]
  return raw.map(([hour, velocity], i) => ({
    hour,
    velocity,
    acceleration: i === 0 ? 0 : velocity - raw[i - 1][1],
  }))
})()

export interface CandidateRacePoint {
  hour: string
  [candidateName: string]: string | number
}

export const candidateRaceData: CandidateRacePoint[] = (() => {
  // cumulative vote share over time for top 4 candidates
  const shares: Record<string, number[]> = {
    "Arvind Sharma": [33, 34, 35, 34, 34, 33, 34, 34, 35, 34, 34, 34],
    "Priya Mehta": [28, 29, 30, 30, 31, 31, 30, 30, 30, 30, 30, 30],
    "Rajesh Kumar": [22, 21, 20, 20, 19, 20, 20, 20, 19, 20, 20, 20],
    "Sunita Desai": [12, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11],
  }
  const hours = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
  return hours.map((hour, i) => {
    const point: CandidateRacePoint = { hour }
    for (const name of Object.keys(shares)) {
      point[name] = shares[name][i]
    }
    return point
  })
})()

export interface StateTurnoutComparison {
  state: string
  current: number
  previous: number
  delta: number
}

export const stateTurnoutComparison: StateTurnoutComparison[] = stateStats.map((s, i) => {
  const previous = s.turnoutPercentage - ([-3, 5, -2, 7, -1][i] ?? 0)
  return {
    state: s.name,
    current: s.turnoutPercentage,
    previous,
    delta: s.turnoutPercentage - previous,
  }
})

export function getAssignedVoters(boothId: string): AssignedVoter[] {
  const booth = booths.find((b) => b.id === boothId)
  if (!booth) return []

  const boothIdx = booths.indexOf(booth)
  const voterCount = booth.expectedVotes > 2400 ? 30 : booth.expectedVotes > 2200 ? 25 : 20
  const votedCount = Math.round(voterCount * (booth.totalVotes / booth.expectedVotes))
  const voters: AssignedVoter[] = []

  for (let i = 0; i < voterCount; i++) {
    const fnIdx = (boothIdx * 7 + i * 3) % firstNames.length
    const lnIdx = (boothIdx * 11 + i * 5) % lastNames.length
    const suffix = String(1000 + ((boothIdx * 100 + i * 37) % 9000))
    const hasVoted = i < votedCount
    const minutesBefore = hasVoted ? 10 + ((i * 17 + boothIdx * 3) % 340) : 0
    const voteTime = hasVoted ? new Date(BASE_TS - minutesBefore * 60 * 1000).toISOString() : null

    voters.push({
      id: `VTR-${boothId}-${String(i + 1).padStart(3, "0")}`,
      name: `${firstNames[fnIdx]} ${lastNames[lnIdx]}`,
      maskedId: `****${suffix}`,
      hasVoted, voteTime, boothId,
    })
  }
  return voters
}
