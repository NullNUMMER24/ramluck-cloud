import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const hostSchema = z.object({
  name: z.string().min(1, "Host name is required"),
  ipAddress: z.string().min(1, "IP address is required").regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid IP address format"),
  cpuCores: z.coerce.number().min(1, "CPU cores must be at least 1"),
  memory: z.coerce.number().min(1, "Memory must be at least 1 GB"),
  storage: z.coerce.number().min(1, "Storage must be at least 1 GB"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
});

type HostFormValues = z.infer<typeof hostSchema>;

interface AddHostDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddHostDialog({ isOpen, onClose }: AddHostDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<HostFormValues>({
    resolver: zodResolver(hostSchema),
    defaultValues: {
      name: "",
      ipAddress: "",
      cpuCores: 1,
      memory: 4,
      storage: 100,
      location: "",
      description: "",
    },
  });

  const addHostMutation = useMutation({
    mutationFn: async (values: HostFormValues) => {
      const res = await apiRequest("POST", "/api/hosts", values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hosts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/host-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/status'] });
      toast({
        title: "Success",
        description: "Host has been added successfully",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add host: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: HostFormValues) {
    addHostMutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Host</DialogTitle>
          <DialogDescription>
            Enter the details of the new host to add to your infrastructure.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostname</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., host-04" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ipAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 192.168.1.10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpuCores"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPU Cores</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memory (GB)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 32" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage (GB)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="datacenter-1">Datacenter 1</SelectItem>
                        <SelectItem value="datacenter-2">Datacenter 2</SelectItem>
                        <SelectItem value="home-rack">Home Rack</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Host description..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={addHostMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={addHostMutation.isPending}
              >
                {addHostMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Host'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
