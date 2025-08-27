'use client';

import { useState, useEffect } from 'react';
import { EventsApi } from '@/lib/api/events';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Calendar, Gift, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface EventFormData {
  title: string;
  description: string;
  reward: string;
  reward_image: File | null;
}

const initialFormData: EventFormData = {
  title: '',
  description: '',
  reward: '',
  reward_image: null,
};

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await EventsApi.list();
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, reward_image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setImagePreview(null);
    setEditingEvent(null);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.description || !formData.reward || !formData.reward_image) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields and select an image.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await EventsApi.create({
        title: formData.title,
        description: formData.description,
        reward: formData.reward,
        reward_image: formData.reward_image,
      });
      
      toast({
        title: 'Success',
        description: 'Event created successfully!',
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      loadEvents();
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      reward: event.reward,
      reward_image: null,
    });
    setImagePreview(null);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingEvent || !formData.title || !formData.description || !formData.reward) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await EventsApi.update(editingEvent.id, {
        title: formData.title,
        description: formData.description,
        reward: formData.reward,
        reward_image: formData.reward_image || undefined,
      });
      
      toast({
        title: 'Success',
        description: 'Event updated successfully!',
      });
      
      setIsEditDialogOpen(false);
      resetForm();
      loadEvents();
    } catch (error: any) {
      console.error('Failed to update event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId: number) => {
    try {
      await EventsApi.delete(eventId);
      toast({
        title: 'Success',
        description: 'Event deleted successfully!',
      });
      loadEvents();
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-mono bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            EVENT_MANAGEMENT
          </h2>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Create and manage platform events
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono">
              <Plus className="w-4 h-4 mr-2" />
              CREATE_EVENT
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-mono">CREATE_NEW_EVENT</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-mono">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter event title"
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="font-mono">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter event description"
                  className="font-mono min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reward" className="font-mono">Reward *</Label>
                <Input
                  id="reward"
                  value={formData.reward}
                  onChange={(e) => handleInputChange('reward', e.target.value)}
                  placeholder="e.g., 1000 XP, $100 USDC"
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reward_image" className="font-mono">Reward Image *</Label>
                <Input
                  id="reward_image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="font-mono"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  className="font-mono"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className="font-mono"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      CREATING...
                    </>
                  ) : (
                    'CREATE_EVENT'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-mono flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            EVENTS_LIST
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-mono">No events found</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first event to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono">IMAGE</TableHead>
                  <TableHead className="font-mono">TITLE</TableHead>
                  <TableHead className="font-mono">DESCRIPTION</TableHead>
                  <TableHead className="font-mono">REWARD</TableHead>
                  <TableHead className="font-mono">CREATED</TableHead>
                  <TableHead className="font-mono">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden border">
                        {event.reward_image ? (
                          <img
                            src={event.reward_image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium font-mono">{event.title}</TableCell>
                    <TableCell className="max-w-xs truncate font-mono text-sm">
                      {event.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        <Gift className="w-3 h-3 mr-1" />
                        {event.reward}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatDate(event.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(event)}
                          className="font-mono"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-mono text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-mono">DELETE_EVENT</AlertDialogTitle>
                              <AlertDialogDescription className="font-mono">
                                Are you sure you want to delete "{event.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-mono">CANCEL</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(event.id)}
                                className="font-mono bg-destructive hover:bg-destructive/90"
                              >
                                DELETE
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono">EDIT_EVENT</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="font-mono">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="font-mono">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter event description"
                className="font-mono min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-reward" className="font-mono">Reward *</Label>
              <Input
                id="edit-reward"
                value={formData.reward}
                onChange={(e) => handleInputChange('reward', e.target.value)}
                placeholder="e.g., 1000 XP, $100 USDC"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-reward_image" className="font-mono">Reward Image (optional)</Label>
              <Input
                id="edit-reward_image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="font-mono"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
              {editingEvent && !imagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground font-mono">Current image:</p>
                  <img
                    src={editingEvent.reward_image}
                    alt="Current"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
                className="font-mono"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="font-mono"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    UPDATING...
                  </>
                ) : (
                  'UPDATE_EVENT'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}