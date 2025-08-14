import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  CheckCircle,
  Plus,
  ShoppingCart,
  Sparkles,
  Users,
  Star,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TicketQRModal from "@/components/attendee/TicketQRModal";

interface MyTicket {
  id: string;
  ticket_number: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  price: number;
  check_in_status: boolean;
  checked_in_at?: string;
  purchase_date: string;
  qr_code_data: string;
  ticket_types?: {
    name: string;
    description?: string;
  } | null;
  events?: {
    name: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    banner_url?: string;
  } | null;
}

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  available_quantity: number;
  is_active: boolean;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  banner_url?: string;
}

export default function AttendeeMyTickets() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ticketUrl, setTicketUrl] = useState("");
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: currentUser?.email || "",
    phone: "",
  });
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // QR Code modal state
  const [selectedTicketForQR, setSelectedTicketForQR] =
    useState<MyTicket | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Check for pending ticketing URL on component mount
  useEffect(() => {
    const pendingUrl = localStorage.getItem("pendingTicketingUrl");
    if (pendingUrl) {
      setTicketUrl(pendingUrl);
      localStorage.removeItem("pendingTicketingUrl");

      // Automatically show the purchase form
      const key = extractEventKey(pendingUrl);
      if (key) {
        setShowPurchaseForm(true);
      }
    }
  }, []);

  // Extract event key from URL
  const extractEventKey = (url: string) => {
    const match = url.match(/\/buy-tickets\/([^\/\?]+)/);
    return match ? match[1] : null;
  };

  const eventKey = extractEventKey(ticketUrl);

  // Fetch my existing tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["my-tickets", currentUser?.id],
    queryFn: async (): Promise<MyTicket[]> => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from("event_tickets")
        .select(
          `
          *,
          ticket_types (
            name,
            description
          ),
          events (
            name,
            description,
            start_time,
            end_time,
            location,
            banner_url
          )
        `
        )
        .or(`user_id.eq.${currentUser.id},guest_email.eq.${currentUser.email}`)
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id,
  });

  // Fetch event and ticket types when URL is provided
  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ["purchase-event", eventKey],
    queryFn: async () => {
      if (!eventKey) return null;

      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("event_key", eventKey)
        .single();

      if (eventError) throw eventError;

      const { data: ticketTypes, error: ticketError } = await supabase
        .from("ticket_types")
        .select("*")
        .eq("event_id", event.id)
        .eq("is_active", true)
        .gt("available_quantity", 0);

      if (ticketError) throw ticketError;

      return { event, ticketTypes };
    },
    enabled: !!eventKey,
  });

  // Purchase tickets mutation
  const purchaseTickets = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !eventData) {
        throw new Error("User or event data not available");
      }

      // Validate user information
      if (
        !userInfo.fullName.trim() ||
        !userInfo.email.trim() ||
        !userInfo.phone.trim()
      ) {
        throw new Error(
          "Please provide your full name, email, and phone number before purchasing."
        );
      }

      // Calculate total price to determine if this is a free ticket
      const totalPrice = getTotalPrice();
      const isFreeTicket = totalPrice === 0;

      const ticketPurchases = [];

      for (const [ticketTypeId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          const ticketType = eventData.ticketTypes.find(
            (t) => t.id === ticketTypeId
          );
          if (!ticketType) continue;

          for (let i = 0; i < quantity; i++) {
            const ticketNumber = `TKT-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`;
            ticketPurchases.push({
              ticket_number: ticketNumber,
              user_id: currentUser.id,
              ticket_type_id: ticketTypeId,
              event_id: eventData.event.id,
              price: ticketType.price,
              guest_name: userInfo.fullName.substring(0, 100), // Trim to prevent length issues
              guest_email: userInfo.email.substring(0, 100),
              guest_phone: userInfo.phone.substring(0, 20), // Trim phone to 20 chars
              qr_code_data: JSON.stringify({
                ticketNumber,
                eventId: eventData.event.id,
                userId: currentUser.id,
                ticketTypeId,
              }),
              // Add payment status for free tickets
              payment_status: isFreeTicket ? "completed" : "pending",
            });
          }
        }
      }

      // For free tickets, insert directly without wallet operations
      if (isFreeTicket) {
        const { data: tickets, error } = await supabase
          .from("event_tickets")
          .insert(ticketPurchases)
          .select();

        if (error) throw error;

        // Update available quantities
        for (const [ticketTypeId, quantity] of Object.entries(
          selectedTickets
        )) {
          if (quantity > 0) {
            const { data: currentTicketType } = await supabase
              .from("ticket_types")
              .select("available_quantity")
              .eq("id", ticketTypeId)
              .single();

            if (currentTicketType) {
              await supabase
                .from("ticket_types")
                .update({
                  available_quantity:
                    currentTicketType.available_quantity - quantity,
                })
                .eq("id", ticketTypeId);
            }
          }
        }

        return tickets;
      }

      // For paid tickets, proceed with existing payment logic
      const { data: tickets, error } = await supabase
        .from("event_tickets")
        .insert(ticketPurchases)
        .select();

      if (error) throw error;

      // Update available quantities
      for (const [ticketTypeId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          const { data: currentTicketType } = await supabase
            .from("ticket_types")
            .select("available_quantity")
            .eq("id", ticketTypeId)
            .single();

          if (currentTicketType) {
            await supabase
              .from("ticket_types")
              .update({
                available_quantity:
                  currentTicketType.available_quantity - quantity,
              })
              .eq("id", ticketTypeId);
          }
        }
      }

      return tickets;
    },
    onSuccess: () => {
      toast({
        title: "Tickets Purchased Successfully!",
        description: `${getTotalTickets()} ticket(s) purchased successfully.`,
      });
      setSelectedTickets({});
      setTicketUrl("");
      setShowPurchaseForm(false);
      setShowUserInfoForm(false);
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
    },
    onError: (error: any) => {
      if (error.message.includes("full name, email, and phone")) {
        setShowUserInfoForm(true);
      }
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase tickets",
        variant: "destructive",
      });
    },
  });

  // Delete ticket mutation
  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from("event_tickets")
        .delete()
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Ticket deleted",
        description: "The ticket has been successfully removed.",
      });
      
      // Refetch tickets
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error deleting ticket",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Handle delete ticket
  const handleDeleteTicket = (ticketId: string) => {
    if (window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      deleteTicketMutation.mutate(ticketId);
    }
  };

  const handleQuantityChange = (ticketTypeId: string, quantity: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketTypeId]: Math.max(0, quantity),
    }));
  };

  const getTotalPrice = () => {
    if (!eventData?.ticketTypes) return 0;
    return eventData.ticketTypes.reduce((total, ticket) => {
      const quantity = selectedTickets[ticket.id] || 0;
      return total + ticket.price * quantity;
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const handleUrlSubmit = () => {
    if (!ticketUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid ticket purchase URL",
        variant: "destructive",
      });
      return;
    }

    const key = extractEventKey(ticketUrl);
    if (!key) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid ticket purchase URL",
        variant: "destructive",
      });
      return;
    }

    // Navigate to the BuyTickets page instead of showing the purchase form
    window.location.href = `/buy-tickets/${key}`;
  };

  const handlePurchase = () => {
    // Check if user info is complete
    if (
      !userInfo.fullName.trim() ||
      !userInfo.email.trim() ||
      !userInfo.phone.trim()
    ) {
      setShowUserInfoForm(true);
      return;
    }

    purchaseTickets.mutate();
  };

  const showQRCode = (ticket: MyTicket) => {
    setSelectedTicketForQR(ticket);
    setShowQRModal(true);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setSelectedTicketForQR(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilteredTickets = () => {
    const now = new Date();
    switch (activeTab) {
      case "upcoming":
        return tickets.filter((t) => t.events?.start_time && new Date(t.events.start_time) > now);
      case "past":
        return tickets.filter((t) => t.events?.end_time && new Date(t.events.end_time) < now);
      case "checked-in":
        return tickets.filter((t) => t.check_in_status);
      default:
        return tickets;
    }
  };

  const filteredTickets = getFilteredTickets();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Modern Header */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-2xl">
              <Ticket className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                My Tickets
              </h1>
              <p className="text-muted-foreground">
                Manage and view your event tickets
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border rounded-xl p-4">
              <div className="text-2xl font-bold text-foreground">{tickets.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">
                {tickets.filter((t) => t.events?.start_time && new Date(t.events.start_time) > new Date()).length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">
                {tickets.filter((t) => t.check_in_status).length}
              </div>
              <div className="text-sm text-muted-foreground">Checked In</div>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-600">
                {tickets.filter((t) => t.events?.end_time && new Date(t.events.end_time) < new Date()).length}
              </div>
              <div className="text-sm text-muted-foreground">Past</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 p-1 bg-muted rounded-lg overflow-x-auto">
            {[
              { key: "all", label: "All Tickets" },
              { key: "upcoming", label: "Upcoming" },
              { key: "past", label: "Past" },
              { key: "checked-in", label: "Checked In" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {ticketsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Ticket className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                <p className="text-muted-foreground">
                  {activeTab === "all" 
                    ? "You haven't purchased any tickets yet." 
                    : `No ${activeTab.replace('-', ' ')} tickets.`}
                </p>
              </div>
              <Button 
                onClick={() => setTicketUrl("")}
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Purchase Tickets
              </Button>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    {/* Ticket Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold line-clamp-1">
                          {ticket.events?.name || 'Unknown Event'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {ticket.ticket_types?.name || 'Unknown Ticket Type'}
                          </Badge>
                          <Badge 
                            variant={ticket.check_in_status ? "default" : "outline"}
                            className={ticket.check_in_status ? "bg-green-100 text-green-800 border-green-200" : ""}
                          >
                            {ticket.check_in_status ? (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Checked In
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Not Checked In
                              </div>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          onClick={() => showQRCode(ticket)}
                          size="sm"
                          className="flex-1 sm:flex-none"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          View QR Code
                        </Button>
                        <Button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          size="sm"
                          variant="destructive"
                          className="px-3"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{ticket.events?.start_time ? formatDate(ticket.events.start_time) : 'Unknown Date'}</span>
                      </div>
                       {ticket.events?.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{ticket.events.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">#{ticket.ticket_number}</span>
                      </div>
                    </div>

                    {/* Guest Info */}
                    {ticket.guest_name && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="text-sm">
                          <span className="font-medium">Guest:</span> {ticket.guest_name}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Purchase Ticket URL Input */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Purchase New Tickets
            </CardTitle>
            <CardDescription>
              Enter a ticket purchase URL to buy tickets for a new event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Paste event ticket URL here..."
                value={ticketUrl}
                onChange={(e) => setTicketUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleUrlSubmit}
                disabled={!ticketUrl.trim()}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Purchase Tickets
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Information Form Modal */}
        {showUserInfoForm && (
          <Card className="mt-8 border-amber-200 bg-amber-50">
            <CardHeader className="bg-amber-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Users className="h-5 w-5" />
                Complete Your Information
              </CardTitle>
              <CardDescription className="text-amber-700">
                Please provide your information before purchasing tickets.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={userInfo.fullName}
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={userInfo.phone}
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) =>
                    setUserInfo((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Enter your email"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    if (
                      userInfo.fullName.trim() &&
                      userInfo.email.trim() &&
                      userInfo.phone.trim()
                    ) {
                      setShowUserInfoForm(false);
                      purchaseTickets.mutate();
                    } else {
                      toast({
                        title: "Information Required",
                        description: "Please fill in all required fields.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={purchaseTickets.isPending}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  {purchaseTickets.isPending
                    ? "Processing..."
                    : "Continue with Purchase"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUserInfoForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Form */}
        {showPurchaseForm && eventData && (
          <Card className="mb-8 border border-purple-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Star className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {eventData.event.name}
                  </h2>
                  <p className="text-purple-100 mt-1">
                    {eventData.event.description}
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="font-medium">
                    {formatDate(eventData.event.start_time)}
                  </span>
                </div>
                {eventData.event.location && (
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium">
                      {eventData.event.location}
                    </span>
                  </div>
                )}
              </div>

              {/* Ticket Types */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-purple-600" />
                  Available Tickets
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {eventData.ticketTypes.map((ticket) => (
                    <Card
                      key={ticket.id}
                      className="border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg"
                    >
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-lg text-gray-800">
                              {ticket.name}
                            </h4>
                            {ticket.description && (
                              <p className="text-gray-600 text-sm mt-1">
                                {ticket.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              ₦{(ticket.price / 100).toLocaleString()}
                            </div>
                            <Badge
                              variant="outline"
                              className="mt-1 border-purple-200 text-purple-700"
                            >
                              {ticket.available_quantity} left
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Label
                            htmlFor={`quantity-${ticket.id}`}
                            className="font-medium"
                          >
                            Quantity:
                          </Label>
                          <Input
                            id={`quantity-${ticket.id}`}
                            type="number"
                            min="0"
                            max={ticket.available_quantity}
                            value={selectedTickets[ticket.id] || 0}
                            onChange={(e) =>
                              handleQuantityChange(
                                ticket.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-24 text-center border-purple-200 focus:border-purple-400"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Purchase Summary */}
              {getTotalTickets() > 0 && (
                <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-purple-900">
                        Total: {getTotalTickets()} ticket
                        {getTotalTickets() !== 1 ? "s" : ""}
                      </span>
                      <span className="text-2xl font-bold text-purple-600">
                        ₦{getTotalPrice().toLocaleString()}
                      </span>
                    </div>
                    <Button
                      onClick={handlePurchase}
                      disabled={purchaseTickets.isPending}
                      className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg"
                    >
                      {purchaseTickets.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Purchase Tickets
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {/* My Existing Tickets */}
        <Card className="border border-purple-200 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-white/20 p-2 rounded-lg">
                <Ticket className="h-6 w-6" />
              </div>
              My Ticket Collection ({tickets.length})
            </CardTitle>
            <CardDescription className="text-purple-100">
              View, manage, and access your event tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {ticketsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">
                  Loading your amazing tickets...
                </p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No Tickets Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your journey by purchasing tickets to exciting events!
                </p>
                <Button
                  onClick={() =>
                    (
                      document.querySelector(
                        'input[placeholder*="Paste"]'
                      ) as HTMLInputElement
                    )?.focus()
                  }
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Get Your First Ticket
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tickets.map((ticket, index) => (
                  <Card
                    key={ticket.id}
                    className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 group-hover:text-purple-700 transition-colors">
                            {ticket.events?.name}
                          </h3>
                          <p className="text-purple-600 font-medium">
                            {ticket.ticket_types?.name || 'Unknown Ticket Type'}
                          </p>
                          <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                            #{ticket.ticket_number}
                          </p>
                          {ticket.guest_name && (
                            <p className="text-sm font-medium text-indigo-700 mt-1 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {ticket.guest_name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-800">
                            ₦{(ticket.price / 100).toLocaleString()}
                          </div>
                          <Badge
                            variant={
                              ticket.check_in_status ? "default" : "secondary"
                            }
                            className={
                              ticket.check_in_status
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {ticket.check_in_status ? (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Checked In
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                              </div>
                            )}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">
                            {ticket.events?.start_time ? formatDate(ticket.events.start_time) : 'Unknown Date'}
                          </span>
                        </div>
                        {ticket.events?.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-indigo-500" />
                            <span>{ticket.events.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            Purchased: {formatDate(ticket.purchase_date)}
                          </span>
                        </div>
                        {ticket.checked_in_at && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>
                              Checked in: {formatDate(ticket.checked_in_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => showQRCode(ticket)}
                        className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        View QR Code
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Modal */}
        <TicketQRModal
          isOpen={showQRModal}
          onClose={closeQRModal}
          ticket={selectedTicketForQR}
        />
      </div>
    </div>
  );
}
