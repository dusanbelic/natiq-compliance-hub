import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MOCK_COMPANY, MOCK_ENTITIES, MOCK_TEAM_MEMBERS, COUNTRY_FLAGS } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Plus, UserPlus } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="font-sora font-bold text-2xl">Settings</h1>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing & Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4 mt-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Company Name</Label><Input value={MOCK_COMPANY.name} readOnly /></div>
                <div><Label>Industry</Label><Input value={MOCK_COMPANY.industry || ''} readOnly /></div>
              </div>
              <div><Label>Plan</Label><Badge className="ml-2 capitalize">{MOCK_COMPANY.plan}</Badge></div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Entities</CardTitle>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Entity</Button>
            </CardHeader>
            <CardContent>
              {MOCK_ENTITIES.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{COUNTRY_FLAGS[e.country]}</span>
                    <span className="font-medium">{e.name}</span>
                  </div>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button size="sm"><UserPlus className="w-4 h-4 mr-1" />Invite</Button>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left p-2">Name</th><th className="text-left p-2">Email</th><th className="text-left p-2">Role</th><th className="text-left p-2">Last Active</th></tr></thead>
                <tbody>
                  {MOCK_TEAM_MEMBERS.map((m) => (
                    <tr key={m.id} className="border-b">
                      <td className="p-2 font-medium">{m.full_name}</td>
                      <td className="p-2 text-muted-foreground">{m.email}</td>
                      <td className="p-2 capitalize">{m.role.replace('_', ' ')}</td>
                      <td className="p-2 text-muted-foreground">{m.last_active}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Qiwa API', 'MOHRE', 'SAP', 'Oracle HCM', 'Workday', 'Bayzat'].map((name, i) => (
              <Card key={name} className="shadow-card">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-lg bg-muted mx-auto mb-3"></div>
                  <h3 className="font-semibold">{name}</h3>
                  {i === 0 ? <Badge className="mt-2 badge-compliant">Connected</Badge> : <Badge variant="secondary" className="mt-2">Coming Soon</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle>Current Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg capitalize">{MOCK_COMPANY.plan} Plan</h3>
                  <p className="text-sm text-muted-foreground">Unlimited team members · All features included</p>
                </div>
                <Button>Upgrade</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
