import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

interface Service {
  _id: string;
  title: string;
  description: string;
  type: "offer" | "request";
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({ title: "", description: "", type: "offer" });

  useEffect(() => {
    async function fetchUserServices() {
      try {
        const response = await axios.get(`/api/services/user/${user?.id}`);
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services", error);
      }
    }
    if (user) fetchUserServices();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewService({ ...newService, [e.target.name]: e.target.value });
  };

  const handleServiceSubmit = async () => {
    try {
      const response = await axios.post("/api/services", { ...newService, userId: user?.id });
      setServices([...services, response.data]);
      setNewService({ title: "", description: "", type: "offer" });
    } catch (error) {
      console.error("Error adding service", error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{user?.name}'s Profile</h1>
      <h2 className="text-xl font-semibold mb-2">Your Services</h2>
      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service._id}>
            <CardContent>
              <h3 className="text-lg font-semibold">{service.title}</h3>
              <p>{service.description}</p>
              <span className={`badge ${service.type === "offer" ? "bg-green-500" : "bg-blue-500"}`}>{service.type}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Add a New Service</h2>
        <Input name="title" placeholder="Service Title" value={newService.title} onChange={handleInputChange} className="mb-2" />
        <Input name="description" placeholder="Description" value={newService.description} onChange={handleInputChange} className="mb-2" />
        <select name="type" value={newService.type} onChange={handleInputChange} className="mb-2">
          <option value="offer">Offering</option>
          <option value="request">Requesting</option>
        </select>
        <Button onClick={handleServiceSubmit}>Submit</Button>
      </div>
    </div>
  );
}
