import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Base user for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  group: text("group"),
  status: text("status").default("active"),
  createdAt: text("created_at"),
  isNewUser: boolean("is_new_user").default(true),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CloudUser = typeof users.$inferSelect;

// Groups
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  colorScheme: text("color_scheme"),
  permissions: json("permissions").$type<string[]>(),
  createdAt: text("created_at"),
});

export type Group = typeof groups.$inferSelect;

// Virtual Machines
export const vms = pgTable("vms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ipAddress: text("ip_address"),
  host: text("host"),
  cpu: integer("cpu"),
  memory: integer("memory"),
  storage: integer("storage"),
  os: text("os"),
  status: text("status").default("stopped"),
  createdAt: text("created_at"),
});

export type VirtualMachine = typeof vms.$inferSelect;

// Applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  version: text("version"),
  host: text("host"),
  port: integer("port"),
  status: text("status").default("stopped"),
  installedDate: text("installed_date"),
});

export type Application = typeof applications.$inferSelect;

// Operating Systems
export const operatingSystems = pgTable("operating_systems", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  version: text("version"),
  type: text("type"),
  architecture: text("architecture"),
  size: integer("size"),
  usage: integer("usage"),
  usagePercentage: integer("usage_percentage"),
  createdAt: text("created_at"),
});

export type OperatingSystem = typeof operatingSystems.$inferSelect;

// Hosts
export const hosts = pgTable("hosts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ipAddress: text("ip_address"),
  status: text("status").default("healthy"),
  cpuCores: integer("cpu_cores"),
  cpuUsage: integer("cpu_usage"),
  memoryTotal: integer("memory_total"),
  memoryUsed: integer("memory_used"),
  storageTotal: integer("storage_total"),
  storageUsed: integer("storage_used"),
  location: text("location"),
  description: text("description"),
  createdAt: text("created_at"),
});

export type Host = typeof hosts.$inferSelect;

// Activities log
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  userId: integer("user_id"),
  timestamp: text("timestamp").notNull(),
});

export type Activity = typeof activities.$inferSelect;

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type", { enum: ["website", "application", "nerd"] }).notNull(),
  estimatedUsers: integer("estimated_users").default(1),
  allowedDowntime: text("allowed_downtime"),
  ownerId: integer("owner_id").references(() => users.id),
  billingEnabled: boolean("billing_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;

// Custom types
export interface hostStatusCounts {
  healthy: number;
  warning: number;
  critical: number;
  offline: number;
}

// Relations
export const usersToGroupsRelations = relations(users, ({ many }) => ({
  groups: many(groups),
  projects: many(projects),
}));

export const hostToVmsRelations = relations(hosts, ({ many }) => ({
  vms: many(vms),
}));

export const hostToApplicationsRelations = relations(hosts, ({ many }) => ({
  applications: many(applications),
}));

export const projectRelations = relations(projects, ({ one }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
}));
