import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const AppointmentsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          practitioner:practitioners(name),
          service:services(name)
        `)
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      
      // Fetch user profiles separately
      const userIds = [...new Set(data?.map(a => a.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);
      
      // Merge profiles into appointments
      return data?.map(appointment => ({
        ...appointment,
        profile: profiles?.find(p => p.id === appointment.user_id)
      }));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      toast({ title: "Appointment status updated" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Practitioner</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments?.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.profile?.name || "Unknown"}</TableCell>
                <TableCell>{appointment.practitioner?.name}</TableCell>
                <TableCell>{appointment.service?.name}</TableCell>
                <TableCell>
                  {format(new Date(appointment.appointment_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{appointment.appointment_time}</TableCell>
                <TableCell>
                  <Select
                    value={appointment.status}
                    onValueChange={(status) =>
                      updateStatusMutation.mutate({ id: appointment.id, status })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {appointment.notes || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AppointmentsManagement;