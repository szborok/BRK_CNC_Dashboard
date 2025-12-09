import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, AlertTriangle, Settings } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
  requiredPermissions?: string[];
  requiredMachine?: string;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

interface AccessDeniedProps {
  reason: string;
  suggestions?: string[];
  canRequestAccess?: boolean;
  onRequestAccess?: () => void;
}

// Access denied component
function AccessDenied({ 
  reason, 
  suggestions = [], 
  canRequestAccess = false, 
  onRequestAccess 
}: AccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="w-full max-w-md">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-red-600">
              You don't have sufficient permissions to access this resource.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {reason}
              </AlertDescription>
            </Alert>

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-800">Suggestions:</h4>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Go Back
              </Button>
              
              {canRequestAccess && onRequestAccess && (
                <Button 
                  variant="destructive" 
                  onClick={onRequestAccess}
                  className="flex-1"
                >
                  Request Access
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading component for authentication checks
function AuthLoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Settings className="w-8 h-8 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-medium mb-2">Verifying Access</h3>
          <p className="text-sm text-muted-foreground text-center">
            Checking your permissions and authentication status...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermissions = [],
  requiredMachine,
  fallbackPath = '/login',
  showAccessDenied = true
}: ProtectedRouteProps) {
  const { 
    isAuthenticated, 
    user, 
    isLoading, 
    hasRole, 
    hasPermission, 
    canAccessMachine 
  } = useAuth();
  
  // Show loading while checking authentication
  if (isLoading) {
    return <AuthLoadingComponent />;
  }

  // Show message if not authenticated (shouldn't happen in this view-based system)
  if (!isAuthenticated || !user) {
    return (
      <AccessDenied
        reason="You must be logged in to access this area."
        suggestions={['Please log in to continue']}
      />
    );
  }

  // Role-based access control
  if (requiredRole && !hasRole(requiredRole)) {
    if (!showAccessDenied) {
      // In view-based system, just show access denied
      return (
        <AccessDenied
          reason="Access denied - insufficient role"
          suggestions={['Contact your administrator']}
        />
      );
    }

    const roleHierarchy = {
      'user': 'User',
      'admin': 'Administrator'
    };

    return (
      <AccessDenied
        reason={`This area requires ${roleHierarchy[requiredRole]} level access or higher. Your current role: ${roleHierarchy[user.role as keyof typeof roleHierarchy]}`}
        suggestions={[
          'Contact your administrator to request access',
          'Check if you have the correct login credentials',
          'Verify your account permissions'
        ]}
        canRequestAccess={true}
        onRequestAccess={() => {
          // In production, this would trigger a request workflow
          console.log('Access request submitted for role:', requiredRole);
        }}
      />
    );
  }

  // Permission-based access control
  const missingPermissions = requiredPermissions.filter(permission => 
    !hasPermission(permission)
  );
  
  if (missingPermissions.length > 0) {
    if (!showAccessDenied) {
      return (
        <AccessDenied
          reason="Missing required permissions"
          suggestions={['Contact your administrator']}
        />
      );
    }

    return (
      <AccessDenied
        reason={`Missing required permissions: ${missingPermissions.join(', ')}`}
        suggestions={[
          'Contact your supervisor to request additional permissions',
          'Verify your role includes these permissions',
          'Check if temporary access can be granted'
        ]}
        canRequestAccess={true}
        onRequestAccess={() => {
          console.log('Permission request submitted for:', missingPermissions);
        }}
      />
    );
  }

  // Machine-specific access control
  if (requiredMachine && !canAccessMachine(requiredMachine)) {
    if (!showAccessDenied) {
      return (
        <AccessDenied
          reason="Machine access denied"
          suggestions={['Contact your supervisor']}
        />
      );
    }

    return (
      <AccessDenied
        reason={`Access denied for machine: ${requiredMachine}. You are not authorized to operate this machine.`}
        suggestions={[
          'Check your authorized machines list with your supervisor',
          'Complete required training for this machine',
          'Request temporary access for specific tasks'
        ]}
        canRequestAccess={true}
        onRequestAccess={() => {
          console.log('Machine access request submitted for:', requiredMachine);
        }}
      />
    );
  }

  // Access control passed - render children
  return <>{children}</>;
}

// Convenience wrapper components for common access patterns

export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="admin" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function UserRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="user" {...props}>
      {children}
    </ProtectedRoute>
  );
}

// Machine-specific route guards
export function MachineRoute({ 
  machineId, 
  children, 
  ...props 
}: Omit<ProtectedRouteProps, 'requiredMachine'> & { machineId: string }) {
  return (
    <ProtectedRoute requiredMachine={machineId} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// Permission-specific route guards
export function PermissionRoute({ 
  permissions, 
  children, 
  ...props 
}: Omit<ProtectedRouteProps, 'requiredPermissions'> & { permissions: string[] }) {
  return (
    <ProtectedRoute requiredPermissions={permissions} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// CNC-specific route guards
export function ProductionRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredPermissions'>) {
  return (
    <ProtectedRoute 
      requiredPermissions={['read', 'operate_machine']} 
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

export function MaintenanceRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredPermissions'>) {
  return (
    <ProtectedRoute 
      requiredPermissions={['read', 'write', 'maintain_machine']} 
      requiredRole="admin"
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

export function EmergencyRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredPermissions'>) {
  return (
    <ProtectedRoute 
      requiredPermissions={['emergency_stop']} 
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

export type { ProtectedRouteProps };