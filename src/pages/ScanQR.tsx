// ScanQR component
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCodeScanner from "@/components/QRCodeScanner";
import { useToast } from "@/hooks/use-toast";
import { useJoinEvent } from "@/hooks/useJoinEvent";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  QrCode,
  CheckCircle,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ScanQR = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { joinEvent, isJoining } = useJoinEvent();
  const { currentUser, logout } = useAuth();
  const [scanSuccess, setScanSuccess] = useState(false);
  const [eventName, setEventName] = useState("");
  const [activeTab, setActiveTab] = useState<"scan" | "code">("scan");
  const [eventCode, setEventCode] = useState("");

  // Check if user is admin/host and show restriction message
  if (currentUser?.role === "host") {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Access Restricted</h1>
          </div>

          <Card>
            <CardContent className="py-16 text-center">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-700 mb-4">
                Admin Account Detected
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Admin accounts cannot join events by scanning QR codes. This
                feature is only available for attendees.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Please sign out of your admin account to join events as an
                attendee.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => logout()}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
                <Button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2"
                >
                  Go to Admin Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const handleScanSuccess = (decodedText: string) => {
    console.log("QR Code decoded:", decodedText);

    try {
      // Handle different QR code formats
      let accessCode = "";
      let eventId = "";

      // Check if it's a /join/ URL format
      if (decodedText.includes("/join/")) {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split("/");
        const joinIndex = pathParts.indexOf("join");
        if (joinIndex !== -1 && pathParts[joinIndex + 1]) {
          accessCode = pathParts[joinIndex + 1];
        }
      }
      // Check if it's a URL with access code parameter
      else if (decodedText.includes("code=")) {
        const url = new URL(decodedText);
        accessCode = url.searchParams.get("code") || "";
      }
      // Check if it's just a 6-digit access code
      else if (/^\d{6}$/.test(decodedText.trim())) {
        accessCode = decodedText.trim();
      }
      // Handle connect:// protocol URLs
      else if (decodedText.startsWith("connect://")) {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split("/");
        if (pathParts.length >= 2 && pathParts[1] === "event") {
          eventId = pathParts[2];
          if (eventId) {
            // Store eventId and navigate directly to register for attendee
            sessionStorage.setItem("pendingEventId", eventId);
            localStorage.setItem("pendingEventId", eventId);
            navigate(`/register?eventId=${eventId}&role=attendee`, { replace: true });
            return;
          }
        }
      }

      if (accessCode && /^\d{6}$/.test(accessCode)) {
        console.log("Extracted access code:", accessCode);

        joinEvent(accessCode, {
          onSuccess: (data: any) => {
            console.log("Join event success:", data);
            setScanSuccess(true);
            setEventName(data?.event_name || "Event");

            // Navigate to dashboard after a short delay
            setTimeout(() => {
              navigate("/attendee/dashboard", { replace: true });
            }, 2000);
          },
          onError: (error: any) => {
            console.error("Join event error:", error);

            // Check if the error is due to authentication or user not found
            if (
              error?.message?.includes("not authenticated") ||
              error?.message?.includes("login") ||
              error?.code === "PGRST301" ||
              !currentUser
            ) {
              // Store the access code in both storages and redirect to register with the code
              sessionStorage.setItem("pendingEventCode", accessCode);
              localStorage.setItem("pendingEventCode", accessCode);
              navigate(`/register?eventCode=${accessCode}&role=attendee`, {
                replace: true,
              });
              return;
            }

            toast({
              title: "Failed to Join Event",
              description:
                error?.message || "Could not join the event. Please try again.",
              variant: "destructive",
            });
          },
        });
      } else {
        toast({
          title: "Invalid QR Code",
          description: "This doesn't appear to be a valid Connect event code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("QR Code parsing error:", error);
      toast({
        title: "Invalid QR Code",
        description: "This doesn't appear to be a valid Connect event code.",
        variant: "destructive",
      });
    }
  };

  const handleScanError = (error: string) => {
    console.error("QR Scanner error:", error);
    if (
      error.includes("NotAllowedError") ||
      error.includes("Permission denied")
    ) {
      toast({
        title: "Camera Permission Required",
        description:
          "Please allow camera access to scan QR codes. Check your browser settings and try again.",
        variant: "destructive",
      });
    }
  };

  // Show success state
  if (scanSuccess) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">
                Successfully Joined!
              </h2>
              <p className="text-muted-foreground mb-4">
                You've joined <span className="font-semibold">{eventName}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const handleManualJoin = () => {
    const trimmed = eventCode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      toast({
        title: "Invalid event code",
        description:
          "Invalid event code. Please check with your event organizer.",
        variant: "destructive",
      });
      return;
    }

    joinEvent(trimmed, {
      onSuccess: (data: any) => {
        setScanSuccess(true);
        setEventName(data?.event_name || "Event");
        setTimeout(() => {
          navigate("/attendee/dashboard", { replace: true });
        }, 1000);
      },
      onError: (error: any) => {
        if (
          error?.message?.includes("not authenticated") ||
          error?.message?.includes("login") ||
          error?.code === "PGRST301" ||
          !currentUser
        ) {
          sessionStorage.setItem("pendingEventCode", trimmed);
          localStorage.setItem("pendingEventCode", trimmed);
          navigate(`/register?eventCode=${trimmed}&role=attendee`, {
            replace: true,
          });
          return;
        }
        toast({
          title: "Invalid event code",
          description:
            "Invalid event code. Please check with your event organizer.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Scan QR Code</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Event QR Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "scan" | "code")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
                <TabsTrigger value="code">Enter Event Code</TabsTrigger>
              </TabsList>

              <TabsContent value="scan" className="mt-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Position the QR code within the camera frame to join an
                    event.
                  </p>

                  <QRCodeScanner
                    onScanSuccess={handleScanSuccess}
                    onScanError={handleScanError}
                    width="100%"
                    height="400px"
                  />

                  {isJoining && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Joining event...
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="event-code">Enter 6-digit Event Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="event-code"
                        value={eventCode}
                        onChange={(e) =>
                          setEventCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        inputMode="numeric"
                        pattern="\d{6}"
                        placeholder="e.g. 123456"
                        maxLength={6}
                        className="tracking-widest text-center"
                      />
                      <Button
                        onClick={handleManualJoin}
                        disabled={isJoining || eventCode.length !== 6}
                      >
                        Join
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ask your organizer for the 6-digit event code if you can’t
                      scan the QR.
                    </p>
                  </div>

                  {isJoining && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Joining event...
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {activeTab === "scan" && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Make sure to allow camera permissions when prompted by your
              browser.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ScanQR;
