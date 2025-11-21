import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Mail, Phone } from "lucide-react";

const Clinic = () => {
  const navigate = useNavigate();

  const { data: practitioners, isLoading } = useQuery({
    queryKey: ["practitioners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practitioners")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Practitioners</h1>
            <p className="text-muted-foreground text-lg">
              Meet our experienced healthcare professionals
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardHeader>
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practitioners?.map((practitioner) => (
                <Card key={practitioner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {practitioner.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={practitioner.image_url}
                        alt={practitioner.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{practitioner.name}</CardTitle>
                    <CardDescription className="text-base">
                      {practitioner.specialization}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {practitioner.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {practitioner.bio}
                      </p>
                    )}
                    <div className="space-y-2 mb-4">
                      {practitioner.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{practitioner.email}</span>
                        </div>
                      )}
                      {practitioner.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{practitioner.phone}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => navigate(`/clinic/practitioner/${practitioner.id}`)}
                      className="w-full"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Clinic;