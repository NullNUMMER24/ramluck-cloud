import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { eq, and, desc } from "drizzle-orm";
import { 
  users,
  groups,
  vms,
  applications,
  operatingSystems,
  hosts,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // API routes
  const apiPrefix = "/api";

  // Dashboard data
  app.get(`${apiPrefix}/dashboard/status`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const hostsCount = await storage.getHostsCount();
      const activeVmsCount = await storage.getActiveVmsCount();
      const usersCount = await storage.getUsersCount();
      const applicationsCount = await storage.getApplicationsCount();
      
      res.json({
        hosts: {
          total: hostsCount,
          change: 8
        },
        vms: {
          active: activeVmsCount,
          change: 12
        },
        users: {
          total: usersCount,
          change: 6
        },
        applications: {
          total: applicationsCount,
          change: -2
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard status:", error);
      res.status(500).json({ message: "Failed to fetch dashboard status" });
    }
  });

  app.get(`${apiPrefix}/dashboard/host-status`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const hostStatusCounts = await storage.getHostStatusCounts();
      res.json(hostStatusCounts);
    } catch (error) {
      console.error("Error fetching host status:", error);
      res.status(500).json({ message: "Failed to fetch host status" });
    }
  });

  app.get(`${apiPrefix}/dashboard/activities`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });
  
  // User management
  app.get(`${apiPrefix}/users`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post(`${apiPrefix}/users`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const newUser = await storage.createCloudUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get(`${apiPrefix}/users/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const user = await storage.getCloudUserById(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put(`${apiPrefix}/users/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const updatedUser = await storage.updateCloudUser(parseInt(req.params.id), req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete(`${apiPrefix}/users/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const result = await storage.deleteCloudUser(parseInt(req.params.id));
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Group management
  app.get(`${apiPrefix}/groups`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const allGroups = await storage.getAllGroups();
      res.json(allGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post(`${apiPrefix}/groups`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const newGroup = await storage.createGroup(req.body);
      res.status(201).json(newGroup);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.get(`${apiPrefix}/groups/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const group = await storage.getGroupById(parseInt(req.params.id));
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.put(`${apiPrefix}/groups/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const updatedGroup = await storage.updateGroup(parseInt(req.params.id), req.body);
      if (!updatedGroup) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(updatedGroup);
    } catch (error) {
      console.error("Error updating group:", error);
      res.status(500).json({ message: "Failed to update group" });
    }
  });

  app.delete(`${apiPrefix}/groups/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const result = await storage.deleteGroup(parseInt(req.params.id));
      if (!result) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting group:", error);
      res.status(500).json({ message: "Failed to delete group" });
    }
  });
  
  // VM management
  app.get(`${apiPrefix}/vms`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const allVms = await storage.getAllVms();
      res.json(allVms);
    } catch (error) {
      console.error("Error fetching VMs:", error);
      res.status(500).json({ message: "Failed to fetch VMs" });
    }
  });

  app.post(`${apiPrefix}/vms`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const newVm = await storage.createVm(req.body);
      res.status(201).json(newVm);
    } catch (error) {
      console.error("Error creating VM:", error);
      res.status(500).json({ message: "Failed to create VM" });
    }
  });

  app.get(`${apiPrefix}/vms/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const vm = await storage.getVmById(parseInt(req.params.id));
      if (!vm) {
        return res.status(404).json({ message: "VM not found" });
      }
      res.json(vm);
    } catch (error) {
      console.error("Error fetching VM:", error);
      res.status(500).json({ message: "Failed to fetch VM" });
    }
  });

  app.put(`${apiPrefix}/vms/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const updatedVm = await storage.updateVm(parseInt(req.params.id), req.body);
      if (!updatedVm) {
        return res.status(404).json({ message: "VM not found" });
      }
      res.json(updatedVm);
    } catch (error) {
      console.error("Error updating VM:", error);
      res.status(500).json({ message: "Failed to update VM" });
    }
  });

  app.delete(`${apiPrefix}/vms/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const result = await storage.deleteVm(parseInt(req.params.id));
      if (!result) {
        return res.status(404).json({ message: "VM not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting VM:", error);
      res.status(500).json({ message: "Failed to delete VM" });
    }
  });
  
  // Application management
  app.get(`${apiPrefix}/applications`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const allApplications = await storage.getAllApplications();
      res.json(allApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post(`${apiPrefix}/applications`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const newApplication = await storage.createApplication(req.body);
      res.status(201).json(newApplication);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // OS management
  app.get(`${apiPrefix}/operating-systems`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const allOs = await storage.getAllOperatingSystems();
      res.json(allOs);
    } catch (error) {
      console.error("Error fetching operating systems:", error);
      res.status(500).json({ message: "Failed to fetch operating systems" });
    }
  });

  app.post(`${apiPrefix}/operating-systems`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const newOs = await storage.createOperatingSystem(req.body);
      res.status(201).json(newOs);
    } catch (error) {
      console.error("Error creating operating system:", error);
      res.status(500).json({ message: "Failed to create operating system" });
    }
  });
  
  // Host management
  app.get(`${apiPrefix}/hosts`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const allHosts = await storage.getAllHosts();
      res.json(allHosts);
    } catch (error) {
      console.error("Error fetching hosts:", error);
      res.status(500).json({ message: "Failed to fetch hosts" });
    }
  });

  app.post(`${apiPrefix}/hosts`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const newHost = await storage.createHost(req.body);
      
      // Add activity log
      await storage.addActivity({
        type: 'host',
        message: `Host '${newHost.name}' created`,
        userId: req.user!.id
      });
      
      res.status(201).json(newHost);
    } catch (error) {
      console.error("Error creating host:", error);
      res.status(500).json({ message: "Failed to create host" });
    }
  });

  app.get(`${apiPrefix}/hosts/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const host = await storage.getHostById(parseInt(req.params.id));
      if (!host) {
        return res.status(404).json({ message: "Host not found" });
      }
      res.json(host);
    } catch (error) {
      console.error("Error fetching host:", error);
      res.status(500).json({ message: "Failed to fetch host" });
    }
  });

  app.put(`${apiPrefix}/hosts/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const updatedHost = await storage.updateHost(parseInt(req.params.id), req.body);
      if (!updatedHost) {
        return res.status(404).json({ message: "Host not found" });
      }
      
      // Add activity log
      await storage.addActivity({
        type: 'host',
        message: `Host '${updatedHost.name}' updated`,
        userId: req.user!.id
      });
      
      res.json(updatedHost);
    } catch (error) {
      console.error("Error updating host:", error);
      res.status(500).json({ message: "Failed to update host" });
    }
  });

  app.delete(`${apiPrefix}/hosts/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const host = await storage.getHostById(parseInt(req.params.id));
      if (!host) {
        return res.status(404).json({ message: "Host not found" });
      }
      
      const result = await storage.deleteHost(parseInt(req.params.id));
      
      // Add activity log
      await storage.addActivity({
        type: 'host',
        message: `Host '${host.name}' deleted`,
        userId: req.user!.id
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting host:", error);
      res.status(500).json({ message: "Failed to delete host" });
    }
  });
  
  // Project management
  app.get(`${apiPrefix}/projects`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      // If user is admin, get all projects, otherwise get user's projects
      const isAdmin = req.user && req.user.isAdmin;
      const projects = isAdmin 
        ? await storage.getAllProjects() 
        : await storage.getUserProjects(req.user!.id);
      
      res.json(projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  
  app.post(`${apiPrefix}/projects`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const projectData = {
        ...req.body,
        ownerId: req.user!.id
      };
      
      const newProject = await storage.createProject(projectData);
      
      // Add activity log
      await storage.addActivity({
        type: 'project',
        message: `Project '${newProject.name}' created`,
        userId: req.user!.id,
        timestamp: new Date().toISOString()
      });
      
      res.status(201).json(newProject);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  
  app.get(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const project = await storage.getProjectById(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // If not admin and not owner, deny access
      const isAdmin = req.user && req.user.isAdmin;
      if (!isAdmin && project.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });
  
  app.patch(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const project = await storage.getProjectById(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // If not admin and not owner, deny access
      const isAdmin = req.user && req.user.isAdmin;
      if (!isAdmin && project.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedProject = await storage.updateProject(parseInt(req.params.id), req.body);
      
      // Add activity log
      await storage.addActivity({
        type: 'project',
        message: `Project '${project.name}' updated`,
        userId: req.user!.id,
        timestamp: new Date().toISOString()
      });
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  
  app.patch(`${apiPrefix}/projects/:id/billing`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      // Only admins can update billing
      const isAdmin = req.user && req.user.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ message: "Access denied. Only administrators can update billing status." });
      }
      
      const project = await storage.getProjectById(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const { enabled } = req.body;
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ message: "Invalid billing data. 'enabled' must be a boolean." });
      }
      
      const updatedProject = await storage.updateProjectBilling(parseInt(req.params.id), enabled);
      
      // Add activity log
      await storage.addActivity({
        type: 'billing',
        message: `Billing for project '${project.name}' ${enabled ? 'enabled' : 'disabled'}`,
        userId: req.user!.id,
        timestamp: new Date().toISOString()
      });
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project billing:", error);
      res.status(500).json({ message: "Failed to update project billing" });
    }
  });
  
  app.delete(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const project = await storage.getProjectById(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // If not admin and not owner, deny access
      const isAdmin = req.user && req.user.isAdmin;
      if (!isAdmin && project.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const result = await storage.deleteProject(parseInt(req.params.id));
      
      // Add activity log
      await storage.addActivity({
        type: 'project',
        message: `Project '${project.name}' deleted`,
        userId: req.user!.id,
        timestamp: new Date().toISOString()
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  
  // Customer portal completion
  app.post(`${apiPrefix}/customer-portal/complete`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      // Update user to no longer be a new user
      await storage.updateUserNewStatus(req.user!.id, false);
      
      // Create the project if provided
      if (req.body.projectData) {
        const projectData = {
          ...req.body.projectData,
          ownerId: req.user!.id
        };
        
        const newProject = await storage.createProject(projectData);
        
        // Add activity log
        await storage.addActivity({
          type: 'project',
          message: `Project '${newProject.name}' created through customer portal`,
          userId: req.user!.id,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing customer portal:", error);
      res.status(500).json({ message: "Failed to complete customer portal setup" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
