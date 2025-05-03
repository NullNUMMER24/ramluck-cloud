import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Create admin user
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "admin")
    });

    if (!existingAdmin) {
      const hashedPassword = await hashPassword("admin");
      
      await db.insert(schema.users).values({
        username: "admin",
        password: hashedPassword,
        email: "admin@ramluck-cloud.com",
        fullName: "Admin User",
        group: "admin",
        status: "active",
        createdAt: new Date().toISOString()
      });
      
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    // Create groups
    const groups = [
      {
        name: "Admin",
        description: "Full system administrators with all privileges",
        colorScheme: "primary",
        permissions: ["full_access", "user_management", "vm_management", "app_management", "os_management", "host_management"],
        createdAt: new Date().toISOString()
      },
      {
        name: "Developer",
        description: "Development team with access to development VMs and applications",
        colorScheme: "green",
        permissions: ["vm_management", "app_management"],
        createdAt: new Date().toISOString()
      },
      {
        name: "User",
        description: "Standard users with limited access",
        colorScheme: "blue",
        permissions: ["app_management"],
        createdAt: new Date().toISOString()
      }
    ];

    const existingGroups = await db.query.groups.findMany();
    
    if (existingGroups.length === 0) {
      await db.insert(schema.groups).values(groups);
      console.log("Groups created");
    } else {
      console.log("Groups already exist");
    }

    // Create sample hosts
    const hosts = [
      {
        name: "host-01",
        ipAddress: "192.168.1.10",
        status: "healthy",
        cpuCores: 8,
        cpuUsage: 25,
        memoryTotal: 20,
        memoryUsed: 8,
        storageTotal: 1000,
        storageUsed: 400,
        location: "datacenter-1",
        description: "Primary application server",
        createdAt: new Date().toISOString()
      },
      {
        name: "host-02",
        ipAddress: "192.168.1.11",
        status: "warning",
        cpuCores: 6,
        cpuUsage: 82,
        memoryTotal: 20,
        memoryUsed: 14,
        storageTotal: 500,
        storageUsed: 350,
        location: "datacenter-1",
        description: "Database server",
        createdAt: new Date().toISOString()
      },
      {
        name: "host-03",
        ipAddress: "192.168.1.12",
        status: "critical",
        cpuCores: 4,
        cpuUsage: 95,
        memoryTotal: 20,
        memoryUsed: 18,
        storageTotal: 500,
        storageUsed: 450,
        location: "home-rack",
        description: "Development server",
        createdAt: new Date().toISOString()
      }
    ];

    const existingHosts = await db.query.hosts.findMany();
    
    if (existingHosts.length === 0) {
      await db.insert(schema.hosts).values(hosts);
      console.log("Hosts created");
    } else {
      console.log("Hosts already exist");
    }

    // Create sample VMs
    const vms = [
      {
        name: "web-prod-01",
        ipAddress: "192.168.1.101",
        host: "host-01",
        cpu: 4,
        memory: 8,
        storage: 100,
        os: "Ubuntu 20.04 LTS",
        status: "running",
        createdAt: new Date().toISOString()
      },
      {
        name: "db-prod-01",
        ipAddress: "192.168.1.102",
        host: "host-02",
        cpu: 2,
        memory: 16,
        storage: 200,
        os: "CentOS 8",
        status: "running",
        createdAt: new Date().toISOString()
      },
      {
        name: "dev-test-01",
        ipAddress: "192.168.1.103",
        host: "host-03",
        cpu: 2,
        memory: 4,
        storage: 50,
        os: "Debian 11",
        status: "stopped",
        createdAt: new Date().toISOString()
      }
    ];

    const existingVms = await db.query.vms.findMany();
    
    if (existingVms.length === 0) {
      await db.insert(schema.vms).values(vms);
      console.log("VMs created");
    } else {
      console.log("VMs already exist");
    }

    // Create sample applications
    const applications = [
      {
        name: "NextCloud",
        description: "File storage and collaboration platform",
        version: "23.0.1",
        host: "web-prod-01",
        port: 8080,
        status: "running",
        installedDate: new Date().toISOString()
      },
      {
        name: "PostgreSQL",
        description: "Enterprise database server",
        version: "14.2",
        host: "db-prod-01",
        port: 5432,
        status: "running",
        installedDate: new Date().toISOString()
      },
      {
        name: "Jenkins",
        description: "Continuous integration server",
        version: "2.319.3",
        host: "dev-test-01",
        port: 8080,
        status: "stopped",
        installedDate: new Date().toISOString()
      }
    ];

    const existingApps = await db.query.applications.findMany();
    
    if (existingApps.length === 0) {
      await db.insert(schema.applications).values(applications);
      console.log("Applications created");
    } else {
      console.log("Applications already exist");
    }

    // Create sample operating systems
    const operatingSystems = [
      {
        name: "Ubuntu",
        version: "20.04 LTS",
        type: "linux",
        architecture: "x86_64",
        size: 10,
        usage: 2,
        usagePercentage: 66,
        createdAt: new Date().toISOString()
      },
      {
        name: "CentOS",
        version: "8.4",
        type: "linux",
        architecture: "x86_64",
        size: 8,
        usage: 1,
        usagePercentage: 33,
        createdAt: new Date().toISOString()
      },
      {
        name: "Debian",
        version: "11",
        type: "linux",
        architecture: "x86_64",
        size: 5,
        usage: 1,
        usagePercentage: 33,
        createdAt: new Date().toISOString()
      },
      {
        name: "Windows Server",
        version: "2022",
        type: "windows",
        architecture: "x86_64",
        size: 20,
        usage: 0,
        usagePercentage: 0,
        createdAt: new Date().toISOString()
      }
    ];

    const existingOs = await db.query.operatingSystems.findMany();
    
    if (existingOs.length === 0) {
      await db.insert(schema.operatingSystems).values(operatingSystems);
      console.log("Operating systems created");
    } else {
      console.log("Operating systems already exist");
    }

    // Create sample activities
    const activities = [
      {
        type: "user",
        message: "New user created",
        userId: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        type: "vm",
        message: "VM 'web-prod-03' started",
        userId: 1,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      },
      {
        type: "warning",
        message: "Host 'srv-02' CPU warning",
        userId: 1,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
      },
      {
        type: "app",
        message: "App 'NextCloud' updated",
        userId: 1,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // yesterday
      }
    ];

    const existingActivities = await db.query.activities.findMany();
    
    if (existingActivities.length === 0) {
      await db.insert(schema.activities).values(activities);
      console.log("Activities created");
    } else {
      console.log("Activities already exist");
    }

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
