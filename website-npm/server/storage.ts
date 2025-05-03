import { db, pool } from "@db";
import { 
  users,
  insertUserSchema,
  groups,
  vms,
  applications,
  operatingSystems,
  hosts,
  activities,
  projects,
  User,
  CloudUser,
  Group,
  VirtualMachine,
  Application,
  OperatingSystem,
  Host,
  Activity,
  Project,
  InsertUser,
  hostStatusCounts
} from "@shared/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { z } from "zod";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Auth related
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUserNewStatus(userId: number, isNewUser: boolean): Promise<User | undefined>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined>;
  
  // Dashboard
  getHostsCount(): Promise<number>;
  getActiveVmsCount(): Promise<number>;
  getUsersCount(): Promise<number>;
  getApplicationsCount(): Promise<number>;
  getHostStatusCounts(): Promise<hostStatusCounts>;
  getRecentActivities(): Promise<Activity[]>;
  
  // Users
  getAllUsers(): Promise<CloudUser[]>;
  getCloudUserById(id: number): Promise<CloudUser | undefined>;
  createCloudUser(userData: any): Promise<CloudUser>;
  updateCloudUser(id: number, userData: any): Promise<CloudUser | undefined>;
  deleteCloudUser(id: number): Promise<boolean>;
  
  // Groups
  getAllGroups(): Promise<Group[]>;
  getGroupById(id: number): Promise<Group | undefined>;
  createGroup(groupData: any): Promise<Group>;
  updateGroup(id: number, groupData: any): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  
  // VMs
  getAllVms(): Promise<VirtualMachine[]>;
  getVmById(id: number): Promise<VirtualMachine | undefined>;
  createVm(vmData: any): Promise<VirtualMachine>;
  updateVm(id: number, vmData: any): Promise<VirtualMachine | undefined>;
  deleteVm(id: number): Promise<boolean>;
  
  // Applications
  getAllApplications(): Promise<Application[]>;
  createApplication(appData: any): Promise<Application>;
  
  // OS
  getAllOperatingSystems(): Promise<OperatingSystem[]>;
  createOperatingSystem(osData: any): Promise<OperatingSystem>;
  
  // Hosts
  getAllHosts(): Promise<Host[]>;
  getHostById(id: number): Promise<Host | undefined>;
  createHost(hostData: any): Promise<Host>;
  updateHost(id: number, hostData: any): Promise<Host | undefined>;
  deleteHost(id: number): Promise<boolean>;
  
  // Projects
  getAllProjects(): Promise<Project[]>;
  getUserProjects(userId: number): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  createProject(projectData: any): Promise<Project>;
  updateProject(id: number, projectData: any): Promise<Project | undefined>;
  updateProjectBilling(id: number, enabled: boolean): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Activities
  addActivity(activityData: Partial<Activity>): Promise<Activity>;
  
  // Session store
  sessionStore: any;
}

class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: pool,
      createTableIfMissing: true,
    });
  }
  
  // Auth related
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  // Dashboard
  async getHostsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(hosts);
    return result[0].count;
  }
  
  async getActiveVmsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(vms).where(eq(vms.status, 'running'));
    return result[0].count;
  }
  
  async getUsersCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0].count;
  }
  
  async getApplicationsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(applications);
    return result[0].count;
  }
  
  async getHostStatusCounts(): Promise<hostStatusCounts> {
    const healthyCount = await db.select({ count: count() }).from(hosts).where(eq(hosts.status, 'healthy'));
    const warningCount = await db.select({ count: count() }).from(hosts).where(eq(hosts.status, 'warning'));
    const criticalCount = await db.select({ count: count() }).from(hosts).where(eq(hosts.status, 'critical'));
    const offlineCount = await db.select({ count: count() }).from(hosts).where(eq(hosts.status, 'offline'));
    
    return {
      healthy: healthyCount[0].count,
      warning: warningCount[0].count,
      critical: criticalCount[0].count,
      offline: offlineCount[0].count
    };
  }
  
  async getRecentActivities(): Promise<Activity[]> {
    return db.select().from(activities).orderBy(desc(activities.timestamp)).limit(4);
  }
  
  // Users
  async getAllUsers(): Promise<CloudUser[]> {
    return db.select().from(users);
  }
  
  async getCloudUserById(id: number): Promise<CloudUser | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  
  async createCloudUser(userData: any): Promise<CloudUser> {
    const [user] = await db.insert(users).values({
      username: userData.username,
      password: userData.password,
      email: userData.email,
      fullName: userData.fullName,
      group: userData.group,
      status: userData.isActive ? 'active' : 'inactive',
      createdAt: new Date().toISOString()
    }).returning();
    
    // Add activity log
    await this.addActivity({
      type: 'user',
      message: `New user '${userData.username}' created`,
    });
    
    return user;
  }
  
  async updateCloudUser(id: number, userData: any): Promise<CloudUser | undefined> {
    const [user] = await db.update(users)
      .set({
        email: userData.email,
        fullName: userData.fullName,
        group: userData.group,
        status: userData.isActive ? 'active' : 'inactive',
      })
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }
  
  async deleteCloudUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
  
  // Groups
  async getAllGroups(): Promise<Group[]> {
    return db.select().from(groups);
  }
  
  async getGroupById(id: number): Promise<Group | undefined> {
    const result = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
    return result[0];
  }
  
  async createGroup(groupData: any): Promise<Group> {
    const [group] = await db.insert(groups).values({
      name: groupData.name,
      description: groupData.description || '',
      colorScheme: groupData.colorScheme,
      permissions: groupData.permissions,
      createdAt: new Date().toISOString()
    }).returning();
    
    // Add activity log
    await this.addActivity({
      type: 'user',
      message: `New group '${groupData.name}' created`,
    });
    
    return group;
  }
  
  async updateGroup(id: number, groupData: any): Promise<Group | undefined> {
    const [group] = await db.update(groups)
      .set({
        name: groupData.name,
        description: groupData.description,
        colorScheme: groupData.colorScheme,
        permissions: groupData.permissions,
      })
      .where(eq(groups.id, id))
      .returning();
    
    return group;
  }
  
  async deleteGroup(id: number): Promise<boolean> {
    const result = await db.delete(groups).where(eq(groups.id, id)).returning();
    return result.length > 0;
  }
  
  // VMs
  async getAllVms(): Promise<VirtualMachine[]> {
    return db.select().from(vms);
  }
  
  async getVmById(id: number): Promise<VirtualMachine | undefined> {
    const result = await db.select().from(vms).where(eq(vms.id, id)).limit(1);
    return result[0];
  }
  
  async createVm(vmData: any): Promise<VirtualMachine> {
    const [vm] = await db.insert(vms).values({
      name: vmData.name,
      ipAddress: vmData.ipAddress,
      host: vmData.host,
      cpu: vmData.cpu,
      memory: vmData.memory,
      storage: vmData.storage,
      os: vmData.os,
      status: vmData.status || 'stopped',
      createdAt: new Date().toISOString()
    }).returning();
    
    // Add activity log
    await this.addActivity({
      type: 'vm',
      message: `VM '${vmData.name}' created`,
    });
    
    return vm;
  }
  
  async updateVm(id: number, vmData: any): Promise<VirtualMachine | undefined> {
    const [vm] = await db.update(vms)
      .set({
        name: vmData.name,
        ipAddress: vmData.ipAddress,
        host: vmData.host,
        cpu: vmData.cpu,
        memory: vmData.memory,
        storage: vmData.storage,
        os: vmData.os,
        status: vmData.status,
      })
      .where(eq(vms.id, id))
      .returning();
    
    return vm;
  }
  
  async deleteVm(id: number): Promise<boolean> {
    const result = await db.delete(vms).where(eq(vms.id, id)).returning();
    return result.length > 0;
  }
  
  // Applications
  async getAllApplications(): Promise<Application[]> {
    return db.select().from(applications);
  }
  
  async createApplication(appData: any): Promise<Application> {
    const [app] = await db.insert(applications).values({
      name: appData.name,
      description: appData.description,
      version: appData.version,
      host: appData.host,
      port: appData.port,
      status: appData.status || 'stopped',
      installedDate: new Date().toISOString()
    }).returning();
    
    // Add activity log
    await this.addActivity({
      type: 'app',
      message: `Application '${appData.name}' installed`,
    });
    
    return app;
  }
  
  // OS
  async getAllOperatingSystems(): Promise<OperatingSystem[]> {
    return db.select().from(operatingSystems);
  }
  
  async createOperatingSystem(osData: any): Promise<OperatingSystem> {
    const [os] = await db.insert(operatingSystems).values({
      name: osData.name,
      version: osData.version,
      type: osData.type,
      architecture: osData.architecture,
      size: osData.size,
      usage: 0,
      usagePercentage: 0,
      createdAt: new Date().toISOString()
    }).returning();
    
    return os;
  }
  
  // Hosts
  async getAllHosts(): Promise<Host[]> {
    return db.select().from(hosts);
  }
  
  async getHostById(id: number): Promise<Host | undefined> {
    const result = await db.select().from(hosts).where(eq(hosts.id, id)).limit(1);
    return result[0];
  }
  
  async createHost(hostData: any): Promise<Host> {
    const [host] = await db.insert(hosts).values({
      name: hostData.name,
      ipAddress: hostData.ipAddress,
      status: 'healthy',
      cpuCores: hostData.cpuCores,
      cpuUsage: 0,
      memoryTotal: hostData.memory,
      memoryUsed: 0,
      storageTotal: hostData.storage,
      storageUsed: 0,
      location: hostData.location,
      description: hostData.description || '',
      createdAt: new Date().toISOString()
    }).returning();
    
    return host;
  }
  
  async updateHost(id: number, hostData: any): Promise<Host | undefined> {
    const [host] = await db.update(hosts)
      .set({
        name: hostData.name,
        ipAddress: hostData.ipAddress,
        status: hostData.status,
        cpuCores: hostData.cpuCores,
        cpuUsage: hostData.cpuUsage,
        memoryTotal: hostData.memoryTotal,
        memoryUsed: hostData.memoryUsed,
        storageTotal: hostData.storageTotal,
        storageUsed: hostData.storageUsed,
        location: hostData.location,
        description: hostData.description,
      })
      .where(eq(hosts.id, id))
      .returning();
    
    return host;
  }
  
  async deleteHost(id: number): Promise<boolean> {
    const result = await db.delete(hosts).where(eq(hosts.id, id)).returning();
    return result.length > 0;
  }
  
  // Projects
  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projects);
  }
  
  async getUserProjects(userId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.ownerId, userId));
  }
  
  async getProjectById(id: number): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }
  
  async createProject(projectData: any): Promise<Project> {
    const [project] = await db.insert(projects).values({
      name: projectData.name,
      description: projectData.description || '',
      type: projectData.type,
      estimatedUsers: projectData.estimatedUsers || 1,
      allowedDowntime: projectData.allowedDowntime || 'anytime',
      ownerId: projectData.ownerId,
      billingEnabled: projectData.billingEnabled || false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return project;
  }
  
  async updateProject(id: number, projectData: any): Promise<Project | undefined> {
    const [project] = await db.update(projects)
      .set({
        name: projectData.name,
        description: projectData.description,
        type: projectData.type,
        estimatedUsers: projectData.estimatedUsers,
        allowedDowntime: projectData.allowedDowntime,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning();
    
    return project;
  }
  
  async updateProjectBilling(id: number, enabled: boolean): Promise<Project | undefined> {
    const [project] = await db.update(projects)
      .set({
        billingEnabled: enabled,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning();
    
    return project;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }
  
  // User update for new user status
  async updateUserNewStatus(userId: number, isNewUser: boolean): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({
        isNewUser: isNewUser
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  // Update Stripe customer ID for a user
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({
        stripeCustomerId: customerId
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }
  
  // Update user Stripe information (customer ID and subscription ID)
  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({
        stripeCustomerId: stripeInfo.customerId,
        stripeSubscriptionId: stripeInfo.subscriptionId
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }
  
  // Activities
  async addActivity(activityData: Partial<Activity>): Promise<Activity> {
    const [activity] = await db.insert(activities).values({
      type: activityData.type || 'system',
      message: activityData.message || '',
      userId: activityData.userId,
      timestamp: activityData.timestamp || new Date().toISOString()
    }).returning();
    
    return activity;
  }
}

export const storage = new DatabaseStorage();
