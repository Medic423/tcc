# Revenue Settings Enhancement Plan

## Overview
Based on the revenue routes analysis document (`2_revenue_routes_af.md`) and our current database schema, this plan outlines comprehensive enhancements to the revenue calculation system to support advanced route optimization and cost modeling.

## Current State Analysis

### Existing Revenue Fields (Trip Model)
- `tripCost` - Basic trip cost calculation
- `distanceMiles` - Total trip distance
- `loadedMiles` - Revenue-generating miles
- `deadheadMiles` - Empty return miles
- `perMileRate` - Per-mile pricing
- `insurancePayRate` - Insurance-specific rates
- `revenuePerHour` - Revenue efficiency metric

### Existing Revenue Settings (Frontend)
- Base rates by transport level (BLS/ALS/CCT)
- Per-mile rates by transport level
- Priority multipliers (LOW/MEDIUM/HIGH/URGENT)
- Special requirements surcharge
- Insurance rate multipliers (Medicare/Medicaid/Private)

## Recommended Enhancements

### 1. Crew Cost Management

#### Database Schema Additions
**Unit Model Enhancements:**
```prisma
model Unit {
  // ... existing fields ...
  
  // Crew Cost Fields
  crewSize                Int?       // Number of crew members
  crewComposition         Json?      // Array of crew roles and certifications
  baseHourlyRate          Decimal?   @db.Decimal(8,2)  // Base crew cost per hour
  overtimeMultiplier      Decimal?   @db.Decimal(3,2)  // Overtime rate multiplier
  shiftLengthHours        Decimal?   @db.Decimal(4,2)   // Standard shift length
  maxOvertimeHours        Decimal?   @db.Decimal(4,2)   // Maximum overtime allowed
  
  // Operational Costs
  vehicleCostPerMile      Decimal?   @db.Decimal(6,2)   // Vehicle operational cost per mile
  fuelCostPerMile         Decimal?   @db.Decimal(6,2)   // Fuel cost per mile
  maintenanceCostPerMile  Decimal?   @db.Decimal(6,2)   // Maintenance cost per mile
  
  // Location & Staging
  homeBaseLocation        Json?      // Home base coordinates
  stagingLocations        Json?      // Array of staging locations
  maxServiceRadius        Decimal?   @db.Decimal(6,2)   // Maximum service radius in miles
  interceptCapability     Boolean    @default(false)    // Can perform intercepts
}
```

**Crew Role Model (New):**
```prisma
model CrewRole {
  id                String   @id @default(cuid())
  roleName          String   // EMT, Paramedic, RN, CCT Specialist
  certificationLevel String  // BLS, ALS, CCT, RN, etc.
  hourlyRate        Decimal  @db.Decimal(8,2)
  overtimeMultiplier Decimal @db.Decimal(3,2)
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@map("crew_roles")
}
```

#### Revenue Settings Enhancements
**Crew Cost Configuration:**
- Base hourly rates by crew role (EMT, Paramedic, RN, CCT Specialist)
- Overtime multipliers and rules
- Shift length configurations
- Crew composition requirements by transport level

### 2. Advanced Pricing Models

#### Database Schema Additions
**Pricing Model (New):**
```prisma
model PricingModel {
  id                    String   @id @default(cuid())
  agencyId              String?  // Agency-specific pricing
  name                  String   // Model name (e.g., "Standard", "Peak Hours")
  isActive              Boolean  @default(true)
  
  // Base Pricing
  baseRates             Json     // Transport level base rates
  perMileRates          Json     // Per-mile rates by transport level
  priorityMultipliers   Json     // Priority-based multipliers
  
  // Time-based Pricing
  peakHourMultipliers   Json     // Time-of-day multipliers
  weekendMultipliers    Json     // Weekend/holiday multipliers
  seasonalMultipliers   Json     // Seasonal pricing adjustments
  
  // Geographic Pricing
  zoneMultipliers       Json     // Geographic zone multipliers
  distanceTiers         Json     // Distance-based pricing tiers
  
  // Service-specific Pricing
  specialRequirements   Json     // Special equipment/needs pricing
  isolationPricing      Decimal? @db.Decimal(8,2)
  bariatricPricing      Decimal? @db.Decimal(8,2)
  oxygenPricing         Decimal? @db.Decimal(8,2)
  monitoringPricing     Decimal? @db.Decimal(8,2)
  
  // Insurance-specific Rates
  insuranceRates        Json     // Insurance company specific rates
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("pricing_models")
}
```

#### Revenue Settings Enhancements
**Advanced Pricing Controls:**
- Time-based pricing (peak hours, weekends, holidays)
- Geographic zone pricing
- Distance tier pricing
- Service-specific surcharges
- Dynamic pricing based on demand

### 3. Route Optimization Parameters

#### Database Schema Additions
**Route Optimization Settings (New):**
```prisma
model RouteOptimizationSettings {
  id                    String   @id @default(cuid())
  agencyId              String?  // Agency-specific settings
  
  // Optimization Weights
  deadheadMileWeight    Decimal  @db.Decimal(5,2)  // α - penalty for deadhead miles
  waitTimeWeight        Decimal  @db.Decimal(5,2)  // β - penalty for wait time
  backhaulBonusWeight   Decimal  @db.Decimal(5,2)  // γ - bonus for backhaul pairs
  overtimeRiskWeight    Decimal  @db.Decimal(5,2)  // δ - penalty for overtime risk
  revenueWeight         Decimal  @db.Decimal(5,2)  // Revenue optimization weight
  
  // Constraints
  maxDeadheadMiles      Decimal  @db.Decimal(6,2)  // Maximum deadhead miles
  maxWaitTimeMinutes    Int      // Maximum wait time
  maxOvertimeHours      Decimal  @db.Decimal(4,2)  // Maximum overtime allowed
  maxBackhaulDistance   Decimal  @db.Decimal(6,2)  // Maximum backhaul distance
  maxBackhaulTimeWindow Int      // Maximum backhaul time window (minutes)
  
  // Backhaul Optimization
  backhaulTimeWindow    Int      // Time window for backhaul pairing (minutes)
  backhaulDistanceLimit Decimal  @db.Decimal(6,2)  // Maximum distance for backhaul
  backhaulRevenueBonus  Decimal  @db.Decimal(8,2)  // Base bonus for backhaul pairs
  
  // Performance Targets
  targetLoadedMileRatio Decimal  @db.Decimal(3,2)  // Target loaded mile ratio (0.0-1.0)
  targetRevenuePerHour  Decimal  @db.Decimal(8,2)  // Target revenue per hour
  targetResponseTime    Int      // Target response time (minutes)
  
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("route_optimization_settings")
}
```

#### Revenue Settings Enhancements
**Route Optimization Controls:**
- Optimization weight sliders (deadhead, wait time, backhaul, overtime)
- Constraint settings (max distances, times, overtime limits)
- Backhaul pairing parameters
- Performance target settings

### 4. Cost Analysis & Profitability

#### Database Schema Additions
**Trip Cost Breakdown (New):**
```prisma
model TripCostBreakdown {
  id                    String   @id @default(cuid())
  tripId                String   // Reference to Trip
  
  // Revenue Components
  baseRevenue           Decimal  @db.Decimal(10,2)
  mileageRevenue        Decimal  @db.Decimal(10,2)
  priorityRevenue       Decimal  @db.Decimal(10,2)
  specialRequirementsRevenue Decimal @db.Decimal(10,2)
  insuranceAdjustment   Decimal  @db.Decimal(10,2)
  totalRevenue          Decimal  @db.Decimal(10,2)
  
  // Cost Components
  crewLaborCost         Decimal  @db.Decimal(10,2)
  vehicleCost           Decimal  @db.Decimal(10,2)
  fuelCost              Decimal  @db.Decimal(10,2)
  maintenanceCost       Decimal  @db.Decimal(10,2)
  overheadCost          Decimal  @db.Decimal(10,2)
  totalCost             Decimal  @db.Decimal(10,2)
  
  // Profitability Metrics
  grossProfit           Decimal  @db.Decimal(10,2)
  profitMargin          Decimal  @db.Decimal(5,2)  // Percentage
  revenuePerMile        Decimal  @db.Decimal(8,2)
  costPerMile           Decimal  @db.Decimal(8,2)
  
  // Efficiency Metrics
  loadedMileRatio       Decimal  @db.Decimal(3,2)
  deadheadMileRatio     Decimal  @db.Decimal(3,2)
  utilizationRate       Decimal  @db.Decimal(3,2)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("trip_cost_breakdowns")
}
```

#### Revenue Settings Enhancements
**Cost Analysis Controls:**
- Overhead cost allocation methods
- Fuel cost tracking and adjustment
- Maintenance cost per mile settings
- Profit margin targets
- Cost center allocation

### 5. Real-time Revenue Optimization

#### Database Schema Additions
**Revenue Optimization Engine (New):**
```prisma
model RevenueOptimizationRun {
  id                    String   @id @default(cuid())
  agencyId              String?  // Agency-specific run
  
  // Run Parameters
  optimizationType      String   // "REAL_TIME", "DAILY_PLAN", "WHAT_IF"
  timeWindow            String   // "1H", "4H", "8H", "24H"
  includedTrips         String[] // Array of trip IDs included
  
  // Optimization Results
  totalRevenue          Decimal  @db.Decimal(12,2)
  totalCost             Decimal  @db.Decimal(12,2)
  netProfit             Decimal  @db.Decimal(12,2)
  loadedMileRatio       Decimal  @db.Decimal(3,2)
  backhaulPairs         Int
  averageResponseTime   Decimal  @db.Decimal(5,2)
  
  // Optimization Settings Used
  settingsSnapshot      Json     // Snapshot of settings used
  
  // Performance Metrics
  optimizationTimeMs    Int      // Time taken to optimize (milliseconds)
  tripsOptimized        Int      // Number of trips optimized
  unitsUtilized         Int      // Number of units utilized
  
  createdAt             DateTime @default(now())
  
  @@map("revenue_optimization_runs")
}
```

#### Revenue Settings Enhancements
**Real-time Optimization Controls:**
- Optimization frequency settings
- Real-time vs. batch optimization toggles
- What-if scenario modeling
- Performance monitoring dashboards

### 6. Enhanced Revenue Settings UI

#### New Settings Sections

**1. Crew Management**
- Crew role definitions and hourly rates
- Shift length and overtime rules
- Crew composition by transport level
- Labor cost tracking and adjustment

**2. Vehicle & Operational Costs**
- Vehicle cost per mile
- Fuel cost tracking and adjustment
- Maintenance cost allocation
- Insurance and registration costs

**3. Advanced Pricing**
- Time-based pricing rules
- Geographic zone pricing
- Service-specific surcharges
- Dynamic pricing controls

**4. Route Optimization**
- Optimization weight controls
- Constraint settings
- Backhaul pairing parameters
- Performance targets

**5. Cost Analysis**
- Overhead allocation methods
- Cost center management
- Profitability targets
- Break-even analysis

**6. Real-time Controls**
- Optimization frequency
- Live vs. batch processing
- What-if scenario modeling
- Performance monitoring

### 7. Implementation Phases

#### Phase 1: Crew Cost Management (Week 1-2)
- Add crew role model and unit cost fields
- Implement crew cost calculation in revenue settings
- Add crew management UI to revenue settings

#### Phase 2: Advanced Pricing Models (Week 3-4)
- Create pricing model system
- Implement time-based and geographic pricing
- Add advanced pricing controls to UI

#### Phase 3: Route Optimization Parameters (Week 5-6)
- Add route optimization settings model
- Implement optimization weight controls
- Add constraint and target settings

#### Phase 4: Cost Analysis & Profitability (Week 7-8)
- Create trip cost breakdown system
- Implement detailed cost tracking
- Add profitability analysis tools

#### Phase 5: Real-time Optimization (Week 9-10)
- Build revenue optimization engine
- Implement real-time optimization
- Add what-if scenario modeling

### 8. Expected Benefits

**Revenue Optimization:**
- 15-25% increase in loaded mile ratio
- 10-20% increase in net revenue per trip
- 20-30% reduction in deadhead miles
- 5-15% improvement in backhaul pairing

**Cost Management:**
- Accurate crew cost tracking
- Better overhead allocation
- Improved profitability analysis
- Real-time cost monitoring

**Operational Efficiency:**
- Optimized route planning
- Reduced response times
- Better resource utilization
- Improved customer satisfaction

**Business Intelligence:**
- Detailed cost breakdowns
- Profitability analysis
- Performance benchmarking
- What-if scenario planning

### 9. Technical Considerations

**Database Performance:**
- Index optimization for route calculations
- Caching for frequently accessed pricing data
- Partitioning for large trip datasets

**Real-time Processing:**
- Event-driven optimization triggers
- Background job processing
- WebSocket updates for live data

**Scalability:**
- Microservices architecture for optimization engine
- Horizontal scaling for high-volume agencies
- Cloud-based optimization services

**Integration:**
- API endpoints for external optimization services
- Webhook support for real-time updates
- Export capabilities for external analysis tools

This comprehensive enhancement plan will transform the revenue calculation system from a basic pricing tool into a sophisticated revenue optimization platform that maximizes profitability while maintaining operational efficiency.
