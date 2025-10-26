// analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/entities/user.entity';
import {
  Livestock,
  LivestockDocument,
} from 'src/livestock/entities/livestock.entity';
import { Claim, ClaimDocument } from 'src/claims/entities/claim.entity';
import { HealthRecord } from 'src/health-records/entities/health-record.entity';
import {
  InsurancePolicy,
  InsurancePolicyDocument,
} from 'src/insurance-policies/entities/insurance-policy.entity';
import {
  LivestockClassification,
  LivestockClassificationDocument,
} from 'src/livestock-classifications/entities/livestock-classification.entity';
import {
  MortalityCause,
  MortalityCauseDocument,
} from 'src/mortality-causes/entities/mortality-cause.entity';

// Export interfaces
export interface DashboardStats {
  totalLivestock: number;
  totalFarmers: number;
  totalTechnicians: number;
  activeClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  activeInsurancePolicies: number;
  healthRecordsThisMonth: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface TrendData {
  labels: string[];
  filed: number[];
  processed: number[];
}

interface MonthData {
  start: Date;
  label: string;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Livestock.name)
    private livestockModel: Model<LivestockDocument>,
    @InjectModel(Claim.name) private claimModel: Model<ClaimDocument>,
    @InjectModel(HealthRecord.name)
    private healthRecordModel: Model<HealthRecord>,
    @InjectModel(InsurancePolicy.name)
    private insurancePolicyModel: Model<InsurancePolicyDocument>,
    @InjectModel(LivestockClassification.name)
    private classificationModel: Model<LivestockClassificationDocument>,
    @InjectModel(MortalityCause.name)
    private mortalityCauseModel: Model<MortalityCauseDocument>,
  ) {}

  async getAdminData(userId: string) {
    const [
      stats,
      livestockBySpecies,
      claimsByStatus,
      monthlyHealthRecords,
      bodyConditions,
      mortalityCauses,
      livestockByLocation,
      claimsTrend,
    ] = await Promise.all([
      this.getAdminStats(),
      this.getLivestockBySpecies(),
      this.getClaimsByStatus(),
      this.getMonthlyHealthRecords(),
      this.getBodyConditionDistribution(),
      this.getMortalityCauses(),
      this.getLivestockByLocation(),
      this.getClaimsTrend(),
    ]);

    return {
      stats,
      livestockBySpecies,
      claimsByStatus,
      monthlyHealthRecords,
      bodyConditions,
      mortalityCauses,
      livestockByLocation,
      claimsTrend,
    };
  }

  async getFarmerData(farmerId: string) {
    const [
      stats,
      livestockBySpecies,
      claimsByStatus,
      monthlyHealthRecords,
      insuranceCoverage,
    ] = await Promise.all([
      this.getFarmerStats(farmerId),
      this.getFarmerLivestockBySpecies(farmerId),
      this.getFarmerClaimsByStatus(farmerId),
      this.getFarmerMonthlyHealthRecords(farmerId),
      this.getFarmerInsuranceCoverage(farmerId),
    ]);

    return {
      stats,
      livestockBySpecies,
      claimsByStatus,
      monthlyHealthRecords,
      insuranceCoverage,
    };
  }

  // Admin/Technician Methods
  private async getAdminStats(): Promise<DashboardStats> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalLivestock,
      totalFarmers,
      totalTechnicians,
      claimsCounts,
      activeInsurancePolicies,
      healthRecordsThisMonth,
    ] = await Promise.all([
      this.livestockModel.countDocuments({ isDeceased: false }),
      this.userModel.countDocuments({ role: 'farmer' }),
      this.userModel.countDocuments({ role: 'technician' }),
      this.claimModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      this.insurancePolicyModel.countDocuments({ status: 'approved' }),
      this.healthRecordModel.countDocuments({
        createdAt: { $gte: firstDayOfMonth },
      }),
    ]);

    const claimsMap: Record<string, number> = claimsCounts.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {},
    );

    return {
      totalLivestock,
      totalFarmers,
      totalTechnicians,
      activeClaims: claimsMap['draft'] || 0,
      pendingClaims: claimsMap['pending'] || 0,
      approvedClaims: claimsMap['approved'] || 0,
      rejectedClaims: claimsMap['rejected'] || 0,
      activeInsurancePolicies,
      healthRecordsThisMonth,
    };
  }

  private async getLivestockBySpecies(): Promise<ChartData> {
    const result = await this.livestockModel.aggregate([
      { $match: { isDeceased: false } },
      {
        $lookup: {
          from: 'livestock_classifications',
          localField: 'species',
          foreignField: '_id',
          as: 'speciesInfo',
        },
      },
      { $unwind: '$speciesInfo' },
      {
        $group: {
          _id: '$speciesInfo.name',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      labels: result.map((item) => item._id),
      data: result.map((item) => item.count),
    };
  }

  private async getClaimsByStatus(): Promise<ChartData> {
    const result = await this.claimModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusOrder = ['draft', 'pending', 'approved', 'rejected'];
    const statusLabels: Record<string, string> = {
      draft: 'Draft',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };

    const dataMap: Record<string, number> = result.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      labels: statusOrder.map((status) => statusLabels[status]),
      data: statusOrder.map((status) => dataMap[status] || 0),
    };
  }

  private async getMonthlyHealthRecords(): Promise<ChartData> {
    const months = this.getLastNMonths(7);
    const result = await this.healthRecordModel.aggregate([
      {
        $match: {
          createdAt: { $gte: months[0].start },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const dataMap: Record<string, number> = result.reduce((acc, item) => {
      const key = `${item._id.year}-${item._id.month}`;
      acc[key] = item.count;
      return acc;
    }, {});

    return {
      labels: months.map((m) => m.label),
      data: months.map((m) => {
        const key = `${m.start.getFullYear()}-${m.start.getMonth() + 1}`;
        return dataMap[key] || 0;
      }),
    };
  }

  private async getBodyConditionDistribution(): Promise<ChartData> {
    const result = await this.healthRecordModel.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$animal',
          latestCondition: { $first: '$bodyCondition' },
        },
      },
      {
        $group: {
          _id: '$latestCondition',
          count: { $sum: 1 },
        },
      },
    ]);

    const conditionLabels: Record<string, string> = {
      emaciated: 'Emaciated',
      thin: 'Thin',
      ideal: 'Ideal',
      fat: 'Fat',
      obese: 'Obese',
      pregnant: 'Pregnant',
      not_pregnant: 'Not Pregnant',
    };

    return {
      labels: result.map((item) => conditionLabels[item._id] || item._id),
      data: result.map((item) => item.count),
    };
  }

  private async getMortalityCauses(): Promise<ChartData> {
    const result = await this.claimModel.aggregate([
      { $match: { causeOfDeathCategory: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$causeOfDeathCategory',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      labels: result.map((item) => item._id),
      data: result.map((item) => item.count),
    };
  }

  private async getLivestockByLocation(): Promise<ChartData> {
    const result = await this.livestockModel.aggregate([
      { $match: { isDeceased: false } },
      {
        $lookup: {
          from: 'users',
          localField: 'farmer',
          foreignField: '_id',
          as: 'farmerInfo',
        },
      },
      { $unwind: '$farmerInfo' },
      {
        $group: {
          _id: '$farmerInfo.address.municipality',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      labels: result.map((item) => item._id),
      data: result.map((item) => item.count),
    };
  }

  private async getClaimsTrend(): Promise<TrendData> {
    const months = this.getLastNMonths(10);

    const [filedData, processedData] = await Promise.all([
      this.claimModel.aggregate([
        {
          $match: {
            filedAt: { $gte: months[0].start, $ne: null },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$filedAt' },
              month: { $month: '$filedAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      this.claimModel.aggregate([
        {
          $match: {
            processedAt: { $gte: months[0].start, $ne: null },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$processedAt' },
              month: { $month: '$processedAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const filedMap: Record<string, number> = filedData.reduce((acc, item) => {
      const key = `${item._id.year}-${item._id.month}`;
      acc[key] = item.count;
      return acc;
    }, {});

    const processedMap: Record<string, number> = processedData.reduce(
      (acc, item) => {
        const key = `${item._id.year}-${item._id.month}`;
        acc[key] = item.count;
        return acc;
      },
      {},
    );

    return {
      labels: months.map((m) => m.label),
      filed: months.map((m) => {
        const key = `${m.start.getFullYear()}-${m.start.getMonth() + 1}`;
        return filedMap[key] || 0;
      }),
      processed: months.map((m) => {
        const key = `${m.start.getFullYear()}-${m.start.getMonth() + 1}`;
        return processedMap[key] || 0;
      }),
    };
  }

  // Farmer-specific Methods
  private async getFarmerStats(farmerId: string) {
    const [myLivestock, claimsCounts, healthCheckups] = await Promise.all([
      this.livestockModel.countDocuments({
        farmer: farmerId,
        isDeceased: false,
      }),
      this.claimModel.aggregate([
        { $match: { farmer: farmerId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      this.healthRecordModel.aggregate([
        {
          $lookup: {
            from: 'livestocks',
            localField: 'animal',
            foreignField: '_id',
            as: 'animalInfo',
          },
        },
        { $unwind: '$animalInfo' },
        { $match: { 'animalInfo.farmer': farmerId } },
        { $count: 'total' },
      ]),
    ]);

    const claimsMap: Record<string, number> = claimsCounts.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {},
    );

    const totalClaims = Object.values(claimsMap).reduce(
      (sum: number, count: number) => sum + count,
      0,
    );

    return {
      myLivestock,
      myClaims: totalClaims,
      pendingClaims: claimsMap['pending'] || 0,
      healthCheckups: healthCheckups[0]?.total || 0,
    };
  }

  private async getFarmerLivestockBySpecies(
    farmerId: string,
  ): Promise<ChartData> {
    const result = await this.livestockModel.aggregate([
      { $match: { farmer: farmerId, isDeceased: false } },
      {
        $lookup: {
          from: 'livestock_classifications',
          localField: 'species',
          foreignField: '_id',
          as: 'speciesInfo',
        },
      },
      { $unwind: '$speciesInfo' },
      {
        $group: {
          _id: '$speciesInfo.name',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      labels: result.map((item) => item._id),
      data: result.map((item) => item.count),
    };
  }

  private async getFarmerClaimsByStatus(farmerId: string): Promise<ChartData> {
    const result = await this.claimModel.aggregate([
      { $match: { farmer: farmerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusOrder = ['draft', 'pending', 'approved', 'rejected'];
    const statusLabels: Record<string, string> = {
      draft: 'Draft',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };

    const dataMap: Record<string, number> = result.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      labels: statusOrder.map((status) => statusLabels[status]),
      data: statusOrder.map((status) => dataMap[status] || 0),
    };
  }

  private async getFarmerMonthlyHealthRecords(
    farmerId: string,
  ): Promise<ChartData> {
    const months = this.getLastNMonths(7);

    const result = await this.healthRecordModel.aggregate([
      {
        $match: {
          createdAt: { $gte: months[0].start },
        },
      },
      {
        $lookup: {
          from: 'livestocks',
          localField: 'animal',
          foreignField: '_id',
          as: 'animalInfo',
        },
      },
      { $unwind: '$animalInfo' },
      { $match: { 'animalInfo.farmer': farmerId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const dataMap: Record<string, number> = result.reduce((acc, item) => {
      const key = `${item._id.year}-${item._id.month}`;
      acc[key] = item.count;
      return acc;
    }, {});

    return {
      labels: months.map((m) => m.label),
      data: months.map((m) => {
        const key = `${m.start.getFullYear()}-${m.start.getMonth() + 1}`;
        return dataMap[key] || 0;
      }),
    };
  }

  private async getFarmerInsuranceCoverage(
    farmerId: string,
  ): Promise<ChartData> {
    const result = await this.livestockModel.aggregate([
      { $match: { farmer: farmerId, isDeceased: false } },
      {
        $group: {
          _id: '$isInsured',
          count: { $sum: 1 },
        },
      },
    ]);

    const dataMap: Record<string, number> = result.reduce((acc, item) => {
      acc[String(item._id)] = item.count;
      return acc;
    }, {});

    return {
      labels: ['Insured', 'Not Insured'],
      data: [dataMap['true'] || 0, dataMap['false'] || 0],
    };
  }

  // Utility Methods
  private getLastNMonths(n: number): MonthData[] {
    const months: MonthData[] = [];
    const now = new Date();

    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        start: date,
        label: date.toLocaleString('en-US', { month: 'short' }),
      });
    }

    return months;
  }
}
