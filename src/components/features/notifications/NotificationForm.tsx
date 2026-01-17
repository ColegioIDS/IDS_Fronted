// src/components/features/notifications/NotificationForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendNotificationSchema, SendNotificationInput } from '@/schemas/notification.schema';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationRecipients } from '@/hooks/data/notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '@/utils/handleApiError';
import { ErrorAlert } from '@/components/shared/feedback/ErrorAlert';

interface NotificationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const notificationTypes = [
  'GRADE_PUBLISHED',
  'ATTENDANCE_ALERT',
  'ASSIGNMENT_DUE',
  'SYSTEM_ALERT',
  'CUSTOM',
];

const priorities = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];

const channels = ['IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WHATSAPP'];

export function NotificationForm({ onSuccess, onCancel }: NotificationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [recipientType, setRecipientType] = useState<'all' | 'users' | 'roles'>('all');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['IN_APP']);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  
  // Hook para obtener roles y usuarios
  const { roles, usersByRole, isLoading: recipientsLoading, error: recipientsError } = useNotificationRecipients();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<SendNotificationInput>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      priority: 'NORMAL',
      recipients: {
        sendToAll: true,
      },
      channels: ['IN_APP'],
    },
    mode: 'onBlur',
  });

  const handleSubmitForm = async (data: SendNotificationInput) => {
    try {
      setIsSubmitting(true);
      setApiError(null);

      // Asegurar que solo un tipo de destinatario está configurado
      const recipients: any = {};
      if (recipientType === 'all') {
        recipients.sendToAll = true;
      } else if (recipientType === 'users' && selectedUsers.length > 0) {
        recipients.userIds = selectedUsers;
      } else if (recipientType === 'roles' && selectedRoles.length > 0) {
        recipients.roleIds = selectedRoles;
      } else {
        setApiError('Debes seleccionar al menos un destinatario');
        return;
      }

      const payload: SendNotificationInput = {
        ...data,
        recipients,
        channels: selectedChannels.length > 0 ? (selectedChannels as any) : ['IN_APP'],
      };

      const result = await notificationsService.sendNotification(payload);
      
      toast.success(`Notificación enviada a ${result.totalRecipients} destinatarios`);
      reset();
      setSelectedChannels(['IN_APP']);
      setSelectedUsers([]);
      setSelectedRoles([]);
      setRecipientType('all');
      onSuccess?.();
    } catch (error) {
      const handled = handleApiError(error);
      setApiError(handled.message);
      // toast.error already called by handleApiError
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enviar Notificación</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
          {apiError && <ErrorAlert title="Error" message={apiError} />}

          {/* Título y Mensaje */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Título de la notificación"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Contenido de la notificación"
                rows={4}
                {...register('message')}
                className={errors.message ? 'border-red-500' : ''}
              />
              {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>}
            </div>
          </div>

          {/* Tipo y Prioridad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de Notificación</Label>
              <Select defaultValue="CUSTOM" onValueChange={(value) => setValue('type', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select defaultValue="NORMAL" onValueChange={(value) => setValue('priority', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Canales */}
          <div>
            <Label className="block mb-3">Canales de Entrega</Label>
            <div className="space-y-2">
              {channels.map((channel) => (
                <div key={channel} className="flex items-center">
                  <Checkbox
                    id={channel}
                    checked={selectedChannels.includes(channel)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedChannels([...selectedChannels, channel]);
                      } else {
                        setSelectedChannels(selectedChannels.filter((c) => c !== channel));
                      }
                    }}
                    disabled={channel !== 'IN_APP'}
                  />
                  <Label htmlFor={channel} className="ml-2 cursor-pointer font-normal">
                    {channel}
                    {channel !== 'IN_APP' && <span className="text-xs text-gray-500 ml-1">(Próximamente)</span>}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Destinatarios */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Label className="block font-semibold">Destinatarios</Label>
            
            {recipientsError && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  {recipientsError}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Opción 1: Todos */}
              <div className="p-3 border rounded-lg cursor-pointer hover:bg-white transition" onClick={() => setRecipientType('all')}>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all"
                    name="recipientType"
                    value="all"
                    checked={recipientType === 'all'}
                    onChange={() => setRecipientType('all')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="all" className="ml-3 cursor-pointer font-normal flex-1">
                    <div className="font-medium">Todos los usuarios</div>
                    <div className="text-xs text-gray-500">Enviará a todos los usuarios activos del sistema</div>
                  </Label>
                </div>
              </div>

              {/* Opción 2: Usuarios específicos */}
              <div className="p-3 border rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center mb-3" onClick={() => setRecipientType('users')}>
                  <input
                    type="radio"
                    id="users"
                    name="recipientType"
                    value="users"
                    checked={recipientType === 'users'}
                    onChange={() => setRecipientType('users')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="users" className="ml-3 cursor-pointer font-normal flex-1">
                    <div className="font-medium">Usuarios específicos</div>
                    <div className="text-xs text-gray-500">Selecciona los usuarios a los que deseas enviar</div>
                  </Label>
                </div>
                
                {recipientType === 'users' && !recipientsLoading && (
                  <div className="mt-3 pl-7 space-y-2">
                    {Object.keys(usersByRole).length === 0 ? (
                      <div className="text-sm text-gray-500 italic">
                        No hay usuarios disponibles o hubo un error al cargarlos.
                        {recipientsError && ` Error: ${recipientsError}`}
                      </div>
                    ) : (
                      Object.entries(usersByRole).map(([roleType, group]) => (
                        <div key={roleType} className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">{group.roleName}</div>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {group.users && group.users.map((user) => (
                              <div key={user.id} className="flex items-center">
                                <Checkbox
                                  id={`user-${user.id}`}
                                  checked={selectedUsers.includes(user.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedUsers([...selectedUsers, user.id]);
                                    } else {
                                      setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                                    }
                                  }}
                                />
                                <Label htmlFor={`user-${user.id}`} className="ml-2 text-sm cursor-pointer font-normal">
                                  {user.givenNames} {user.lastNames} ({user.email})
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {recipientType === 'users' && recipientsLoading && (
                  <div className="mt-3 pl-7 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-500">Cargando usuarios...</span>
                  </div>
                )}
              </div>

              {/* Opción 3: Por rol */}
              <div className="p-3 border rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center mb-3" onClick={() => setRecipientType('roles')}>
                  <input
                    type="radio"
                    id="roles"
                    name="recipientType"
                    value="roles"
                    checked={recipientType === 'roles'}
                    onChange={() => setRecipientType('roles')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="roles" className="ml-3 cursor-pointer font-normal flex-1">
                    <div className="font-medium">Por rol</div>
                    <div className="text-xs text-gray-500">Selecciona los roles a los que deseas enviar</div>
                  </Label>
                </div>

                {recipientType === 'roles' && !recipientsLoading && (
                  <div className="mt-3 pl-7 space-y-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRoles([...selectedRoles, role.id]);
                            } else {
                              setSelectedRoles(selectedRoles.filter((id) => id !== role.id));
                            }
                          }}
                        />
                        <Label htmlFor={`role-${role.id}`} className="ml-2 text-sm cursor-pointer font-normal">
                          {role.name}
                          {role.description && <span className="text-xs text-gray-500 ml-2">({role.description})</span>}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {recipientType === 'roles' && recipientsLoading && (
                  <div className="mt-3 pl-7 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-500">Cargando roles...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen de selección */}
            {(recipientType === 'users' || recipientType === 'roles') && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                {recipientType === 'users' && selectedUsers.length > 0 && (
                  <div>✓ {selectedUsers.length} usuario(s) seleccionado(s)</div>
                )}
                {recipientType === 'roles' && selectedRoles.length > 0 && (
                  <div>✓ {selectedRoles.length} rol(es) seleccionado(s)</div>
                )}
                {((recipientType === 'users' && selectedUsers.length === 0) || (recipientType === 'roles' && selectedRoles.length === 0)) && (
                  <div>⚠️ Selecciona al menos uno para proceder</div>
                )}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
              </Button>
            )}
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Enviando...' : 'Enviar Notificación'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
