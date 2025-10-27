"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Eye, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { useSocket } from "@/components/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const { data: notifications, isLoading } = trpc.notification.getNotifications.useQuery({
    unreadOnly: false,
    pageSize: 10,
  });

  const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery();

  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      toast({
        title: "Notification marked as read",
      });
    },
  });

  const deleteNotificationMutation = trpc.notification.deleteNotification.useMutation({
    onSuccess: () => {
      toast({
        title: "Notification deleted",
      });
    },
  });

  // Real-time: listen for new notifications and refresh caches
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNew = () => {
      queryClient.invalidateQueries({ queryKey: [["notification","getNotifications"]] as any });
      queryClient.invalidateQueries({ queryKey: [["notification","getUnreadCount"]] as any });
    };

    socket.on('notification:new', handleNew);
    return () => {
      socket.off('notification:new', handleNew);
    };
  }, [socket, isConnected, queryClient]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync({ notificationId });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync({ notificationId });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push("/notifications");
  };

  const allNotifications = notifications?.notifications || [];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount && unreadCount.count > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount.count}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden z-50">
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount && unreadCount.count > 0 && (
                <p className="text-sm text-muted-foreground">
                  {unreadCount.count} unread
                </p>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <>
                  {allNotifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-gray-50 ${
                        !notification.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm ${
                            !notification.isRead ? "text-gray-900" : "text-gray-700"
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                </>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={handleViewAll}
                className="w-full flex items-center justify-center gap-2"
              >
                View All Notifications
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
