import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/utils/format";

export function ProfilePage() {
  const { user } = useAuth();

  const fields = [
    { label: "Full name", value: user?.name },
    { label: "Email address", value: user?.email },
    { label: "Role", value: user?.role },
    { label: "Branch", value: user?.branch_id ? `Branch #${user.branch_id}` : "All branches" },
  ];

  return (
    <div>
      <PageHeader title="Profile" description="Your account details." />

      <Card className="max-w-2xl">
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold text-text-primary">{user?.name}</p>
            <Badge variant="brand" className="mt-1">{user?.role}</Badge>
          </div>
        </CardContent>

        <div className="divide-y divide-border border-t border-border">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-text-secondary">{field.label}</span>
              <span className="text-sm font-medium text-text-primary">{field.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
